import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Leaf, 
  AlertTriangle, 
  Lightbulb, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { askGeminiAssistant } from '../services/apiClient.ts';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  source?: 'local' | 'gemini' | 'fallback';
}

const PRELOADED_PROMPTS = [
  'Can I recycle greasy pizza boxes in the Blue bin?',
  'What is the fire hazard with swollen lithium batteries?',
  'How do I sanitize and upcycle glass mason jars?',
  'What are the local rules for multi-layer chip bags?'
];

const LOCAL_GUIDANCE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['plastic bottle', 'pet bottle', 'water bottle'],
    answer: 'Empty and rinse the bottle. Recycling acceptance varies by plastic type and local program, so check your area’s rules; don’t assume every plastic container is recyclable. Reuse only if the bottle is intact and intended for repeated use. General guidance—verify local rules.'
  },
  {
    keywords: ['cardboard', 'pizza box'],
    answer: 'Keep cardboard clean and dry. Remove food and liners; heavily greasy or food-soiled sections may not be accepted with paper recycling. Compost them only if your local program accepts them; otherwise use the appropriate residual-waste route. General guidance—verify local rules.'
  },
  {
    keywords: ['paper', 'newspaper'],
    answer: 'Keep paper clean and dry, and remove plastic wrapping. Coated, laminated, or food-soiled paper may not be accepted with ordinary paper recycling. Check your local collection rules before sorting.'
  },
  {
    keywords: ['glass bottle', 'glass jar', 'mason jar', 'glass'],
    answer: 'Rinse the container and check local rules: some programs accept glass bottles and jars, while others collect them separately or not at all. Don’t put broken glass into a recycling bin unless your local program specifically instructs you how to handle it.'
  },
  {
    keywords: ['aluminium can', 'aluminum can', 'drink can', 'soda can'],
    answer: 'Empty and rinse the can. Metal cans are commonly collected for recycling, but accepted items and lid instructions vary by location. Check your local program’s guidance.'
  },
  {
    keywords: ['banana', 'food scraps', 'food waste', 'vegetable peel', 'compost'],
    answer: 'Food scraps may be suitable for an organics collection or home compost, depending on what that program accepts. Keep them out of paper and recycling bins, and check local rules for accepted food and packaging.'
  },
  {
    keywords: ['battery', 'batteries', 'lithium'],
    answer: 'Do not put batteries in household recycling or general waste unless local authorities explicitly say to. Keep them separate and use an approved battery collection point. If a battery is swollen, hot, leaking, or damaged, avoid handling or charging it and contact local hazardous-waste or emergency guidance.'
  },
  {
    keywords: ['charger', 'phone', 'electronics', 'e-waste', 'cable'],
    answer: 'Keep chargers and electronics out of ordinary recycling and household waste. Use a local electronics take-back or approved e-waste collection service; remove batteries only if the device instructions and local guidance say it is safe.'
  },
  {
    keywords: ['reusable container', 'food container', 'reuse'],
    answer: 'Reuse a container only when its material and intended use are known, it is intact, and it can be cleaned properly. Don’t assume an unknown or damaged container is food-safe. Check local recycling rules if it can no longer be reused.'
  }
];

const findLocalGuidance = (query: string): string | undefined => {
  const normalizedQuery = query.toLowerCase();
  return LOCAL_GUIDANCE.find(entry =>
    entry.keywords.some(keyword => normalizedQuery.includes(keyword))
  )?.answer;
};

export const EcoAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello! I am your EcoFlux AI Circular Economy Assistant. Ask me anything about material recyclability, proper bin separation, upcycling ideas, or hazardous e-waste safety guidelines.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const localAnswer = findLocalGuidance(query);
    if (localAnswer) {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: localAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local'
      }]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await askGeminiAssistant(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'AI answers are temporarily unavailable. I could not confidently match that question to my offline waste guide. Please check your local waste authority’s instructions or try asking about a specific material or item.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fallback'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 3.8 Flash Generative AI · Circular Economy Specialist
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Generative AI Eco Assistant
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Get personalized circularity advice, unpack confusing packaging labels, and learn how to prevent contamination.
          </p>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div>
        <div className="text-xs text-slate-400 mb-2 font-medium">
          Suggested Inquiries:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRELOADED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors text-left flex items-center gap-1.5"
            >
              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 min-h-[420px] flex flex-col justify-between shadow-xl">
        
        {/* Messages Stream */}
        <div className="space-y-4 overflow-y-auto max-h-[480px] p-2">
          {messages.map(m => {
            const isAI = m.sender === 'ai';
            return (
              <div 
                key={m.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isAI 
                    ? 'bg-slate-950 border border-slate-800 text-slate-200' 
                    : 'bg-emerald-600 text-white font-medium shadow-md'
                }`}>
                  <div className="whitespace-pre-line">{m.text}</div>
                  {isAI && m.source && (
                    <div className="text-[10px] mt-2 font-medium text-emerald-400">
                      {m.source === 'local' ? 'General local-guide fallback · verify local rules' : m.source === 'gemini' ? 'Gemini AI' : 'Offline fallback'}
                    </div>
                  )}
                  <div className={`text-[10px] mt-2 font-mono ${isAI ? 'text-slate-500' : 'text-emerald-200 text-right'}`}>
                    {m.timestamp}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Gemini 3.8 Flash is consulting circularity guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about material properties, reuse ideas, or hazardous items..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
