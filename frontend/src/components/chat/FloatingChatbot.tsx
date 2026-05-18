import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { chatApi } from '../../api/endpoints';
import type { ChatMessage } from '../../types';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId || '',
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(userMsg.content, sessionId || undefined);
      if (res.data.session_id) setSessionId(res.data.session_id);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: res.data.session_id,
        role: 'assistant',
        content: res.data.answer,
        created_at: new Date().toISOString(),
        llm_provider: res.data.llm_provider,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionId || '',
        role: 'assistant',
        content: "Sorry, I encountered an error while trying to generate a response. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-morning-600 to-morning-400 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all z-50 animate-bounce"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed right-6 bottom-6 z-50 flex flex-col glass-morning rounded-2xl shadow-2xl transition-all duration-300 ${
            isMaximized ? 'w-[calc(100vw-3rem)] h-[calc(100vh-3rem)] max-w-4xl' : 'w-80 sm:w-96 h-[500px]'
          } border border-morning-200 overflow-hidden animate-slide-up`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-morning-600 to-morning-400 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-heading font-semibold text-white tracking-wide">eOffice Assistant</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsMaximized(!isMaximized)} className="text-morning-100 hover:text-white transition">
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-morning-100 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-morning-50/50 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-morning-700 opacity-70">
                <Bot className="w-12 h-12 mb-3 text-morning-400" />
                <p className="font-medium">How can I help you today?</p>
                <p className="text-sm mt-1">Ask me about productivity or pending files.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-morning-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-morning-100 rounded-tl-none'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-morning-500">
                        <Bot className="w-3 h-3" /> Assistant
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-morning-100 text-gray-800 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-morning-500" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-morning-100 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about productivity..." 
                className="w-full bg-morning-50 border border-morning-200 text-gray-800 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-morning-400 focus:border-transparent transition-all placeholder-gray-400"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!query.trim() || loading}
                className="absolute right-2 p-1.5 bg-morning-500 text-white rounded-lg hover:bg-morning-600 disabled:opacity-50 disabled:hover:bg-morning-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
