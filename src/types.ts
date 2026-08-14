export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface QuickTopic {
  id: string;
  title: string;
  category: string;
  stance: string;
}
