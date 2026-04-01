import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  isMe: boolean;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  username: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getUsernameColor(username: string): string {
  const colors = [
    'text-lynkl-cyan',
    'text-lynkl-purple',
    'text-lynkl-pink',
    'text-lynkl-blue',
  ];
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Simulate typing indicator from others
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(Math.random() > 0.7);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div>
          <h3 className="font-display font-semibold text-sm">Room chat</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Lock className="w-3 h-3 text-lynkl-gray/60" />
            <span className="text-xs text-lynkl-gray/60">End-to-end encrypted</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-lynkl-gray">Live</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col ${message.isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${getUsernameColor(message.username)}`}>
                  {message.username}
                </span>
                <span className="text-xs text-lynkl-gray/40">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div 
                className={`
                  chat-bubble max-w-[85%] break-words
                  ${message.isMe 
                    ? 'bg-lynkl-cyan/20 text-lynkl-white rounded-tr-sm' 
                    : 'bg-white/5 text-lynkl-white rounded-tl-sm'
                  }
                `}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-lynkl-gray">Someone is typing</span>
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-lynkl-gray"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 input-glass py-2.5 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl neon-gradient flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4 text-lynkl-void" />
          </button>
        </div>
        <p className="mt-2 text-xs text-center text-lynkl-gray/40">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
