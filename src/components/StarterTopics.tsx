import React from 'react';
import { Swords, Flame, Sparkles, Brain, Cpu, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { QuickTopic } from '../types';

interface StarterTopicsProps {
  onSelectTopic: (stance: string) => void;
}

const STARTER_TOPICS: QuickTopic[] = [
  {
    id: 'ai-devs',
    category: 'Technology & AI',
    title: 'AI Replacing Developers',
    stance: 'AI code generators and autonomous agents will replace 90% of professional software engineers within the next five years.',
  },
  {
    id: 'remote-work',
    category: 'Work & Culture',
    title: 'Remote Work Failure',
    stance: 'Remote work permanently damages team culture, slows down breakthrough innovation, and leads to long-term career stagnation.',
  },
  {
    id: 'higher-ed',
    category: 'Education & Economics',
    title: 'College Degrees Obsolescence',
    stance: 'Traditional university degrees are an overpriced credentialing racket that no longer provide positive return on investment for most students.',
  },
  {
    id: 'social-media',
    category: 'Society & Media',
    title: 'Social Media Net Negative',
    stance: 'Algorithmic social media platforms have done vastly more harm to human psychological well-being and democratic discourse than any perceived benefit.',
  },
  {
    id: 'free-will',
    category: 'Philosophy & Science',
    title: 'Illusion of Free Will',
    stance: 'Human free will is a complete neurological illusion; every decision we make is deterministically governed by prior physics and genetics.',
  },
  {
    id: 'space-colonization',
    category: 'Future & Space',
    title: 'Mars Colonization Delusion',
    stance: 'Spending billions to colonize Mars is an absurd distraction; we must dedicate 100% of technological capital to solving Earth’s ecological collapse.',
  },
];

export const StarterTopics: React.FC<StarterTopicsProps> = ({ onSelectTopic }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 text-center max-w-3xl mx-auto animate-fadeIn">
      {/* Visual icon banner */}
      <div className="mb-4 inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border border-red-500/30 text-red-400 shadow-xl shadow-red-950/20">
        <Swords className="h-8 w-8 text-red-500" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        Enter the Arena of Ruthless Debate
      </h2>
      <p className="text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
        State any stance, conviction, or controversial thesis. The AI sparring partner will never agree, never balance perspectives, and will attack your core assumptions with precision.
      </p>

      {/* Rules pill bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mb-8 text-left">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-950/80 border border-red-500/40 text-[11px] font-bold text-red-400">
            1
          </span>
          <div>
            <div className="text-xs font-semibold text-zinc-200">Exposes Weakness</div>
            <div className="text-[11px] text-zinc-400">Pinpoints your most fragile assumption.</div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-950/80 border border-orange-500/40 text-[11px] font-bold text-orange-400">
            2
          </span>
          <div>
            <div className="text-xs font-semibold text-zinc-200">Counter-Evidence</div>
            <div className="text-[11px] text-zinc-400">Demolishes with sharp logical counter-proof.</div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-950/80 border border-rose-500/40 text-[11px] font-bold text-rose-400">
            3
          </span>
          <div>
            <div className="text-xs font-semibold text-zinc-200">The Trap Question</div>
            <div className="text-[11px] text-zinc-400">Forces you into an intellectual corner.</div>
          </div>
        </div>
      </div>

      {/* Suggested Hot Topics */}
      <div className="w-full text-left">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Flame className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Select a starter stance or type your own below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STARTER_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.stance)}
              className="group relative flex flex-col p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/70 hover:border-red-500/40 transition-all text-left cursor-pointer hover:shadow-md hover:shadow-red-950/20"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-medium text-red-400/90 tracking-wide uppercase">
                  {topic.category}
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-red-400 transition-colors">
                  Argue →
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                "{topic.stance}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
