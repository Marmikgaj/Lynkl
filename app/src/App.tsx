import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  PhoneOff, Copy, Check, X, Sparkles
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ParticleBackground from './components/ParticleBackground';
import VideoGrid from './components/VideoGrid';
import ChatPanel from './components/ChatPanel';
import ControlsDock from './components/ControlsDock';
import { useRoomStore } from './store/roomStore';
import { useMediaStore } from './store/mediaStore';
import { generateRoomCode } from './utils/roomCode';
import './App.css';

type AppStage = 'join' | 'room' | 'ended';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  isMe: boolean;
}

interface Participant {
  id: string;
  username: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

function App() {
  const [stage, setStage] = useState<AppStage>('join');
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const joinCardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { localStream, isMicOn, isCameraOn, toggleMic, toggleCamera, initMedia } = useMediaStore();
  const { currentRoom, setCurrentRoom } = useRoomStore();

  // Generate random username on mount
  useEffect(() => {
    const adjectives = ['neon', 'cyber', 'quantum', 'digital', 'shadow', 'electric', 'phantom'];
    const nouns = ['wolf', 'ghost', 'pulse', 'wave', 'drift', 'spark', 'cipher'];
    const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}`;
    setUsername(randomName);
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (stage === 'join' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [stage]);

  // Entrance animation for join stage
  useEffect(() => {
    if (stage === 'join' && joinCardRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.join-headline', 
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power3.out' }
        );
        gsap.fromTo('.join-subtext',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.35, ease: 'power3.out' }
        );
        gsap.fromTo('.join-input-group',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: 'power3.out' }
        );
        gsap.fromTo('.join-preview',
          { opacity: 0, x: 60, scale: 0.98 },
          { opacity: 1, x: 0, scale: 1, duration: 0.7, delay: 0.5, ease: 'power2.out' }
        );
      }, joinCardRef);
      
      return () => ctx.revert();
    }
  }, [stage]);

  const handleCreateRoom = async () => {
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    setIsCreatingRoom(true);
    
    // Initialize media
    await initMedia();
    
    // Simulate room creation
    setTimeout(() => {
      setCurrentRoom(newRoomCode);
      setParticipants([
        { id: '1', username, isVideoOn: isCameraOn, isAudioOn: isMicOn, isScreenSharing: false, isSpeaking: false }
      ]);
      setStage('room');
      setIsCreatingRoom(false);
    }, 800);
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    
    setIsCreatingRoom(true);
    
    // Initialize media
    await initMedia();
    
    // Simulate joining
    setTimeout(() => {
      setCurrentRoom(roomCode);
      setParticipants([
        { id: '1', username, isVideoOn: isCameraOn, isAudioOn: isMicOn, isScreenSharing: false, isSpeaking: false },
        { id: '2', username: 'alex', isVideoOn: true, isAudioOn: true, isScreenSharing: false, isSpeaking: true },
        { id: '3', username: 'sarah', isVideoOn: false, isAudioOn: true, isScreenSharing: false, isSpeaking: false },
      ]);
      // Add sample messages
      setMessages([
        { id: '1', username: 'alex', text: 'yo is this working', timestamp: Date.now() - 60000, isMe: false },
        { id: '2', username: 'sarah', text: 'lmao yes but your mic is loud', timestamp: Date.now() - 45000, isMe: false },
        { id: '3', username: 'mike', text: "who's sharing the tab", timestamp: Date.now() - 30000, isMe: false },
        { id: '4', username: 'sarah', text: "not me, I'm on phone", timestamp: Date.now() - 15000, isMe: false },
      ]);
      setStage('room');
      setIsCreatingRoom(false);
    }, 800);
  };

  const handleLeaveRoom = () => {
    setStage('ended');
    setCurrentRoom(null);
    setParticipants([]);
    setMessages([]);
  };

  const handleRejoin = () => {
    setStage('join');
    setRoomCode('');
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      username,
      text,
      timestamp: Date.now(),
      isMe: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addReaction = (emoji: string) => {
    // Simulate sending a reaction message
    sendMessage(emoji);
    setShowEmojiPicker(false);
  };

  // Keyboard shortcut: Cmd/Ctrl + K to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-lynkl-void overflow-hidden">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Neon Gradient Blob */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 animate-pulse-slow"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.15) 0%, rgba(45, 98, 255, 0.1) 30%, rgba(184, 41, 221, 0.08) 60%, transparent 70%)',
          }}
        />
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg neon-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-lynkl-void" />
            </div>
            <span className="font-display font-bold text-xl text-lynkl-white">Lynkl</span>
          </motion.div>

          {/* Right side utilities */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="text-sm text-lynkl-gray hover:text-lynkl-white transition-colors"
            >
              How it works
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button className="text-sm text-lynkl-gray hover:text-lynkl-white transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lynkl-cyan animate-pulse" />
              Neon
            </button>
          </motion.div>
        </div>
      </nav>

      {/* How It Works Modal */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHowItWorks(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold">How Lynkl Works</h3>
                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-lynkl-gray">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-lynkl-cyan/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lynkl-cyan font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-lynkl-white font-medium">Create or join a room</p>
                    <p className="text-sm">No accounts needed. Just a code.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-lynkl-purple/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lynkl-purple font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="text-lynkl-white font-medium">Talk freely</p>
                    <p className="text-sm">Video, voice, chat, and screen share.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-lynkl-pink/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lynkl-pink font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="text-lynkl-white font-medium">Vanish completely</p>
                    <p className="text-sm">When you leave, everything disappears. No logs, no history.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* JOIN STAGE */}
          {stage === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              ref={joinCardRef}
              className="w-full max-w-5xl"
            >
              <div className="glass-card p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Left: Form */}
                  <div className="space-y-8">
                    <div>
                      <h1 className="join-headline font-display text-5xl md:text-6xl font-bold text-lynkl-white mb-4">
                        Join a room
                      </h1>
                      <p className="join-subtext text-lg text-lynkl-gray">
                        No accounts. No logs. Just a code.
                      </p>
                    </div>

                    <div className="join-input-group space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-lynkl-gray mb-2">
                          Room code
                        </label>
                        <input
                          ref={inputRef}
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                          placeholder="e.g. aqua-7-mountain"
                          className="input-glass font-mono text-base"
                          onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        />
                        <p className="mt-2 text-xs text-lynkl-gray/60">
                          Press Cmd/Ctrl + K to focus
                        </p>
                      </div>

                      <button
                        onClick={handleJoinRoom}
                        disabled={!roomCode.trim() || isCreatingRoom}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingRoom ? (
                          <div className="w-5 h-5 border-2 border-lynkl-void/30 border-t-lynkl-void rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Enter room</span>
                            <Sparkles className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <button
                          onClick={handleCreateRoom}
                          disabled={isCreatingRoom}
                          className="text-sm text-lynkl-cyan hover:text-lynkl-white transition-colors relative group"
                        >
                          Create a new room instead
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-lynkl-cyan group-hover:w-full transition-all duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Preview */}
                  <div className="join-preview relative">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face"
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-lynkl-void/60 via-transparent to-transparent" />
                      
                      {/* Live indicator */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-lynkl-cyan animate-pulse" />
                        <span className="text-xs font-medium">Live</span>
                      </div>
                      
                      {/* Watermark */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md neon-gradient flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-lynkl-void" />
                        </div>
                        <span className="text-sm font-display font-semibold">Lynkl</span>
                      </div>
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute -inset-4 neon-gradient opacity-20 blur-3xl -z-10 rounded-3xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROOM STAGE */}
          {stage === 'room' && (
            <motion.div
              key="room"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="w-full h-screen pt-20 pb-4 px-4"
            >
              {/* Room Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center mb-4"
              >
                <div className="glass-panel px-4 py-2 flex items-center gap-3">
                  <span className="text-sm text-lynkl-gray">Room:</span>
                  <code className="font-mono text-sm text-lynkl-cyan">{currentRoom}</code>
                  <button
                    onClick={copyRoomCode}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-lynkl-gray hover:text-lynkl-white" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Main Content Area */}
              <div className="flex gap-4 h-[calc(100vh-140px)]">
                {/* Video Grid */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-[320px]' : ''}`}
                >
                  <VideoGrid 
                    participants={participants}
                    localStream={localStream}
                    isMicOn={isMicOn}
                    isCameraOn={isCameraOn}
                  />
                </motion.div>

                {/* Chat Sidebar */}
                <AnimatePresence>
                  {isChatOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 80 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-4 top-[140px] bottom-4 w-80"
                    >
                      <ChatPanel 
                        messages={messages}
                        onSendMessage={sendMessage}
                        username={username}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls Dock */}
              <ControlsDock
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                isChatOpen={isChatOpen}
                onToggleMic={toggleMic}
                onToggleCamera={toggleCamera}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onLeave={handleLeaveRoom}
                onShowEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
              />

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-card p-4 z-50"
                  >
                    <div className="flex gap-2 flex-wrap max-w-xs justify-center">
                      {['👍', '❤️', '😂', '😮', '🎉', '🔥', '👏', '😢', '😡', '👋'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(emoji)}
                          className="text-2xl hover:scale-125 transition-transform p-2"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ENDED STAGE */}
          {stage === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md"
            >
              <div className="glass-card p-10 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto rounded-full bg-lynkl-purple/20 flex items-center justify-center"
                >
                  <PhoneOff className="w-10 h-10 text-lynkl-purple" />
                </motion.div>
                
                <div>
                  <h2 className="font-display text-3xl font-bold text-lynkl-white mb-2">
                    You left the room.
                  </h2>
                  <p className="text-lynkl-gray">
                    This room is ephemeral—no history was kept.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleRejoin}
                    className="btn-primary w-full"
                  >
                    Rejoin
                  </button>
                  <button
                    onClick={handleRejoin}
                    className="text-sm text-lynkl-cyan hover:text-lynkl-white transition-colors relative group"
                  >
                    Join a different room
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-lynkl-cyan group-hover:w-full transition-all duration-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
