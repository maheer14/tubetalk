"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';

// Dynamically import react-player (no SSR)
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// Types
type MessageType = 'user' | 'assistant';
type VideoStatus = 'idle' | 'processing' | 'ready';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface VideoData {
  title: string;
  duration: string;
  thumbnail: string;
  chunks: number;
}

export default function Home() {
  // State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('idle');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'assistant', content: 'Hi! Paste a YouTube URL and I\'ll help you understand the video content. What would you like to know?', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [playerReady, setPlayerReady] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    
    try {
      const response = await fetch('http://localhost:8000/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: videoUrl }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Mock video data (in real app, this would come from backend)
        setVideoData({
          title: 'Sample Video Title',
          duration: '15:30',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          chunks: data.chunk_count
        });
        
        setVideoStatus('ready');
        
        // Add success message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `✅ Video processed successfully! I've analyzed ${data.chunk_count} transcript segments. You can now ask questions about the video.`,
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
    if (!inputMessage.trim() || !videoData) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response (in real app, call your backend)
    setTimeout(() => {
      const responses = [
        `Based on the video, the speaker discusses this topic around the 4:20 mark. They mention that "${inputMessage}" is important because...`,
        `The video covers this in detail! At 8:15, the presenter explains that ${inputMessage.toLowerCase()} is a key concept that...`,
        `Great question! Around 12:30 in the video, they provide examples of ${inputMessage.toLowerCase()} including...`,
        `I found relevant information about this! At 6:45, the speaker talks about how ${inputMessage.toLowerCase()} relates to...`
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
      checking: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Loader2, text: 'Checking...' },
      connected: { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle, text: 'Connected' },
      disconnected: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle, text: 'Disconnected' }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-black/50" />
      
      <div className="relative container mx-auto px-4 py-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75" />
                <div className="relative bg-gray-900 p-2 rounded-xl">
                  <Youtube className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TubeTalk
                </h1>
                <p className="text-gray-400 text-sm">Chat with YouTube videos using AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <StatusIndicator />
              <button
                onClick={checkBackend}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-sm"
              >
                <Loader2 className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Column - Video Input & Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Input Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Play className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">YouTube Video</h2>
              </div>
              
              <form onSubmit={handleProcessVideo} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Video URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition"
                      disabled={videoStatus === 'processing'}
                    />
                    <button
                      type="submit"
                      disabled={!videoUrl.trim() || videoStatus === 'processing'}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      {videoStatus === 'processing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Video Player Area */}
              <AnimatePresence>
                {videoData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="bg-black rounded-xl overflow-hidden aspect-video">
                      {playerReady ? (
                        <ReactPlayer
                          url={videoUrl}
                          width="100%"
                          height="100%"
                          controls
                          playing={false}
                          onReady={() => setPlayerReady(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <div className="text-center">
                            <Youtube className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">Video player loading...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {videoData && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="text-gray-400 text-sm mb-1">Title</div>
                          <div className="font-medium truncate">{videoData.title}</div>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Duration
                          </div>
                          <div className="font-medium">{videoData.duration}</div>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="text-gray-400 text-sm mb-1">Segments</div>
                          <div className="font-medium">{videoData.chunks} chunks</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {[
                { icon: Sparkles, title: 'AI Analysis', desc: 'Deep understanding of video content' },
                { icon: Clock, title: 'Time Stamps', desc: 'Jump to relevant moments' },
                { icon: ExternalLink, title: 'Quick Links', desc: 'Reference specific sections' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-900/30 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                  <item.icon className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Chat Interface */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Video Assistant</h2>
                    <p className="text-gray-400 text-sm">Ask questions about the video</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                          : 'bg-gray-800 text-gray-100'
                      } rounded-2xl ${message.type === 'user' ? 'rounded-br-none' : 'rounded-bl-none'} p-4`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={videoData ? "Ask about the video..." : "Process a video first..."}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    disabled={!videoData}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || !videoData}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                
                {!videoData && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-sm text-center">
                      ⚡ Process a YouTube video to start chatting
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}