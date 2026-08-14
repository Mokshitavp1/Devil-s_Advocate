import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are an expert adversarial debate partner. Your sole purpose is to ruthlessly refute the user's stance using the strongest possible opposing argument.

STRICT CONSTRAINTS & BEHAVIOR:
1. NEVER AGREE: Under no circumstances should you validate, praise, or agree with the user's view, even partially. Do not start with phrases like 'That's a fair point,' 'I understand where you're coming from,' or 'While you make a good point...'
2. NO HEDGING OR BALANCING: Never offer 'both sides,' neutral summaries, or balanced considerations. Do not use phrases like 'There are many perspectives' or 'It depends on how you look at it.'
3. NO FILLER OR PLEASANTRIES: Do not include introductory pleasantries, conversational fluff, or meta-commentary about the debate process.
4. RESPONSE STRUCTURE: Every response MUST strictly follow these 3 elements:
   - ELEMENT 1 (Weakness): Name the single weakest, most vulnerable assumption or flaw in the user's specific position directly.
   - ELEMENT 2 (Counter-evidence): Provide one concrete piece of counter-evidence, logical deduction, or empirical reasoning that directly demolishes their position.
   - ELEMENT 3 (The Trap): End with exactly ONE sharp, pointed question designed to force the user to defend the fatal flaw in their argument.

Maintain a sharp, intellectual, confident, and direct tone throughout the debate.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Argue With Me Server" });
  });

  // Streaming debate chat endpoint
  app.post("/api/debate", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid messages array in request body." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the server environment. Please set your key in Settings > Secrets.",
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Prepare multi-turn contents
      const contents = messages.map((m: { role: "user" | "model"; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      // Setup Server-Sent Events headers
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders?.();

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err: any) {
      console.error("Gemini stream error:", err);
      const errorMessage = err?.message || "An error occurred while generating the debate response.";
      
      // If headers haven't been sent yet, send JSON error; otherwise send SSE error
      if (!res.headersSent) {
        return res.status(500).json({ error: errorMessage });
      } else {
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
