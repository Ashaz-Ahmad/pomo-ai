import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ChatType = 'task-completion' | 'general-help';

interface ChatModalProps {
  isOpen: boolean;
  chatType: ChatType;
  taskName?: string;
  estimatedPomos?: number;
  actualPomos?: number;
  currentTaskName?: string;
  mode?: 'work' | 'shortBreak' | 'longBreak';
  onClose: () => void;
}

const ChatModal = ({ isOpen, chatType, taskName, estimatedPomos, actualPomos, currentTaskName, mode = 'work', onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load general chat history from localStorage when modal opens
  useEffect(() => {
    if (isOpen && chatType === 'general-help') {
      const storedHistory = localStorage.getItem('pomo_general_chat_history');
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setMessages(parsedHistory);
          }
        } catch (e) {
          console.error('Error loading chat history:', e);
        }
      }
    } else if (isOpen && chatType === 'task-completion') {
      // Task-completion chat always starts fresh
      setMessages([]);
    }
  }, [isOpen, chatType]);

  // Initialize with AI message when modal opens (only if no existing messages and not task-completion with data)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // For general-help, check if we just loaded history (give it a moment)
      if (chatType === 'general-help') {
        const storedHistory = localStorage.getItem('pomo_general_chat_history');
        if (storedHistory) {
          try {
            const parsedHistory = JSON.parse(storedHistory);
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
              return; // Don't initialize if we have history
            }
          } catch {
            // Continue to initialization if parsing fails
          }
        }
      }

      const initializeChat = async () => {
        setIsLoading(true);
        
        let prompt: string;
        
        if (chatType === 'task-completion' && taskName && estimatedPomos !== undefined && actualPomos !== undefined) {
          const systemPrompt = `You are a productivity coach helping someone reflect on their Pomodoro session. Be honest, encouraging, and constructive. They completed a task called "${taskName}". They estimated it would take ${estimatedPomos} pomodoros but it actually took ${actualPomos} pomodoros.`;
          prompt = `${systemPrompt}\n\nProvide a brief, encouraging analysis of their performance. If they finished in fewer pomodoros than estimated, congratulate them and ask what they did to stay focused. If they took more, be supportive and ask what they think went wrong. Be conversational and helpful. Keep it short - 3-4 sentences.`;
        } else {
          // General help chat
          const taskInfo = currentTaskName ? ` They are currently working on a task called "${currentTaskName}".` : '';
          prompt = `You are a productivity coach. Someone came to you for help or just to talk.${taskInfo} Be warm, supportive, and helpful. Ask how you can help them with their productivity or their current work. Keep it brief and conversational.`;
        }

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: prompt, history: [] }),
          });

          if (!response.ok) throw new Error('Failed to get AI response');

          const data = await response.json();
          const fallbackMessage = chatType === 'task-completion' 
            ? 'Great job completing your task! How do you think the session went?'
            : 'How can I help you with your productivity today?';
          const initialMessage = { role: 'assistant' as const, content: data.response || fallbackMessage };
          setMessages([initialMessage]);
          
          // Save to localStorage for general-help chat
          if (chatType === 'general-help') {
            localStorage.setItem('pomo_general_chat_history', JSON.stringify([initialMessage]));
          }
        } catch (error) {
          console.error('Error generating initial message:', error);
          let fallbackMessage: string;
          if (chatType === 'task-completion' && taskName && estimatedPomos !== undefined && actualPomos !== undefined) {
            fallbackMessage = actualPomos <= estimatedPomos
              ? `Excellent work! You completed "${taskName}" in ${actualPomos} pomodoros, ${estimatedPomos - actualPomos} less than your estimate. What do you think helped you stay focused?`
              : `You completed "${taskName}" in ${actualPomos} pomodoros, which is ${actualPomos - estimatedPomos} more than your estimate. That's okay! What do you think made it take longer than expected?`;
          } else {
            fallbackMessage = currentTaskName 
              ? `Hi! I see you're working on "${currentTaskName}". How can I help you with your productivity today?`
              : 'Hi! How can I help you with your productivity today?';
          }
          const initialMessage = { role: 'assistant' as const, content: fallbackMessage };
          setMessages([initialMessage]);
          
          // Save to localStorage for general-help chat
          if (chatType === 'general-help') {
            localStorage.setItem('pomo_general_chat_history', JSON.stringify([initialMessage]));
          }
        } finally {
          setIsLoading(false);
        }
      };
      initializeChat();
    }
  }, [isOpen, messages.length, chatType, taskName, estimatedPomos, actualPomos, currentTaskName]);

  // Reset chat when modal closes (only for task-completion, keep general-help history)
  useEffect(() => {
    if (!isOpen) {
      if (chatType === 'task-completion') {
        setMessages([]);
      }
      setInput('');
    }
  }, [isOpen, chatType]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Save user message to localStorage for general-help chat
    if (chatType === 'general-help') {
      localStorage.setItem('pomo_general_chat_history', JSON.stringify(updatedMessages));
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, history: messages }), // Send previous messages (before user's current message)
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: data.response }];
      setMessages(finalMessages);
      
      // Save assistant response to localStorage for general-help chat
      if (chatType === 'general-help') {
        localStorage.setItem('pomo_general_chat_history', JSON.stringify(finalMessages));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Sorry, I encountered an error. Could you try asking again?' 
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Save error message to localStorage for general-help chat
      if (chatType === 'general-help') {
        localStorage.setItem('pomo_general_chat_history', JSON.stringify(finalMessages));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  // Dynamic colors based on mode
  const iconBg = mode === 'work' 
    ? 'bg-gradient-to-r from-red-500 to-orange-500'
    : mode === 'shortBreak'
    ? 'bg-gradient-to-r from-blue-500 to-blue-700'
    : 'bg-gradient-to-r from-purple-500 to-purple-700';

  const sendButtonBg = mode === 'work'
    ? 'bg-red-500 hover:bg-red-600'
    : mode === 'shortBreak'
    ? 'bg-blue-500 hover:bg-blue-600'
    : 'bg-purple-500 hover:bg-purple-600';

  const userMessageBg = mode === 'work'
    ? 'bg-red-500'
    : mode === 'shortBreak'
    ? 'bg-blue-500'
    : 'bg-purple-500';

  const userAvatarBg = mode === 'work'
    ? 'bg-red-100'
    : mode === 'shortBreak'
    ? 'bg-blue-100'
    : 'bg-purple-100';

  const userAvatarText = mode === 'work'
    ? 'text-red-600'
    : mode === 'shortBreak'
    ? 'text-blue-600'
    : 'text-purple-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-60">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">PomoAI - Your Productivity Coach</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reflect on your work</p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                  message.role === 'user'
                    ? `${userMessageBg} text-white`
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className={`w-8 h-8 ${userAvatarBg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                  <span className={`${userAvatarText} font-semibold text-sm`}>You</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-3">
            <textarea
              className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
            />
            <button
              className={`flex items-center justify-center gap-2 px-6 py-2 ${sendButtonBg} text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

