"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Send, 
  User, 
  Bot, 
  Youtube, 
  Clock, 
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Video,
  Search
} from 'lucide-react';

// Types
type MessageType = 'user' | 'assistant';
type VideoStatus = 'idle' | 'processing' | 'ready';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export default function Home() {
  // State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('idle');
  const [videoId, setVideoId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      type: 'assistant', 
      content: 'Hello! 👋 Paste a YouTube URL above and I\'ll help you understand the video content. Ask me anything about the video!', 
      timestamp: new Date() 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatReady, setIsChatReady] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract YouTube ID from URL
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Functions
  const checkBackend = async () => {
    try {
      setBackendStatus('checking');
      const response = await fetch('http://localhost:8000/api/health');
      if (!response.ok) throw new Error();
      setBackendStatus('connected');
    } catch {
      setBackendStatus('disconnected');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProcessVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setVideoStatus('processing');
    const extractedId = extractYouTubeId(videoUrl);
    
    try {
      const response = await fetch('http://localhost:8000/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: videoUrl }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVideoId(extractedId || '');
        setVideoStatus('ready');
        setIsChatReady(true);
        
        // Add success message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `✅ **Video processed successfully!**\n\nI've analyzed ${data.chunk_count} transcript segments. You can now ask me questions about:\n• Key points\n• Specific timestamps\n• Main arguments\n• Or anything else!`,
          timestamp: new Date()
        }]);
        
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      setVideoStatus('idle');
      alert(error instanceof Error ? error.message : 'Failed to process video');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isChatReady) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI thinking
    setTimeout(() => {
      const responses = [
        `**Great question!** Based on the video transcript, this topic is covered around **4:20**. The speaker mentions: "${inputMessage}" is important because it demonstrates the core principle discussed earlier.`,
        `**Interesting!** At **8:15** in the video, the presenter explains that **${inputMessage.toLowerCase()}** is a key concept. They provide several examples including real-world applications.`,
        `**Let me check...** Yes! Around **12:30**, there's detailed discussion about **${inputMessage.toLowerCase()}**. The main points are:\n• Point 1 related to your question\n• Supporting evidence at 13:45\n• Conclusion at 15:20`,
        `**Good observation!** The video addresses this at **6:45**. The speaker talks about how **${inputMessage.toLowerCase()}** relates to the broader theme, with specific examples mentioned at 7:30.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      }]);
    }, 1500);
  };

  const StatusIndicator = () => {
    const config = {
      checking: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Loader2, text: 'Checking...' },
      connected: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, text: 'Connected' },
      disconnected: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle, text: 'Disconnected' }
    };
    
    const { color, bg, icon: Icon, text } = config[backendStatus];
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} ${color}`}>
        <Icon className={`w-4 h-4 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <Youtube className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
                  TubeTalk
                </h1>
                <p className="text-slate-400 text-sm font-medium">Chat with YouTube videos using AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusIndicator />
              <button
                onClick={checkBackend}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-2 text-sm font-medium border border-slate-700"
              >
                <Loader2 className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video Input & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Input Card */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                  <Video className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">YouTube Video Processor</h2>
              </div>
              
              <form onSubmit={handleProcessVideo} className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2 text-sm font-medium">YouTube Video URL</label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition placeholder:text-slate-500 text-white"
                        disabled={videoStatus === 'processing'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!videoUrl.trim() || videoStatus === 'processing'}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2.5 shadow-lg hover:shadow-blue-500/25"
                    >
                      {videoStatus === 'processing' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze Video
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Video Preview */}
              {videoId && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Play className="w-5 h-5" />
                    <h3 className="font-semibold">Video Preview</h3>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                    <div className="aspect-video relative">
                      {/* YouTube iframe embed */}
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                      />
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Video Ready for Chat</h4>
                            <p className="text-slate-400 text-sm">Ask questions in the chat</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-300">15:30</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-slate-400 text-xs font-medium mb-1">STATUS</div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-emerald-400">Ready for Questions</span>
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="text-slate-400 text-xs font-medium mb-1">SEGMENTS</div>
                          <div className="text-sm font-semibold text-white">42 analyzed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Video, title: 'Paste URL', desc: 'Any YouTube video with captions', color: 'from-blue-500/20 to-blue-600/20' },
                { icon: Sparkles, title: 'AI Analysis', desc: 'Deep transcript understanding', color: 'from-purple-500/20 to-purple-600/20' },
                { icon: MessageSquare, title: 'Start Chatting', desc: 'Ask questions, get answers', color: 'from-emerald-500/20 to-emerald-600/20' }
              ].map((item, index) => (
                <div key={index} className={`bg-gradient-to-br ${item.color} border border-slate-700/50 p-5 rounded-xl backdrop-blur-sm`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/5 rounded-lg">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="flex flex-col h-full">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex-1 flex flex-col shadow-xl">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <Bot className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Video Assistant</h2>
                    <p className="text-slate-400 text-sm font-medium">Ask anything about the video</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300'
                    }`}>
                      {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    
                    <div className={`max-w-[75%] rounded-2xl p-4 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 text-white rounded-tr-none shadow-lg' 
                        : 'bg-slate-900/70 text-slate-100 rounded-tl-none border border-slate-700/50'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content.split('**').map((part, i) => 
                          i % 2 === 1 ? (
                            <strong key={i} className="font-bold">{part}</strong>
                          ) : (
                            part
                          )
                        )}
                      </div>
                      <div className={`text-xs mt-3 ${
                        message.type === 'user' ? 'text-blue-200/70' : 'text-slate-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-5 border-t border-slate-700/50">
                {!isChatReady ? (
                  <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Process a Video First</h3>
                    <p className="text-slate-400 text-sm">Enter a YouTube URL above to start chatting about the video content</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                      <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about the video..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition placeholder:text-slate-500 text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2.5 shadow-lg hover:shadow-purple-500/25"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm">
            TubeTalk • Built with Next.js, FastAPI, and AI • Backend running on localhost:8000
          </p>
        </footer>
      </div>
    </div>
  );
}