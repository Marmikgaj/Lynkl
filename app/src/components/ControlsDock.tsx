import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Monitor, MessageSquare, Smile, MoreVertical,
  Settings, Users, Hand
} from 'lucide-react';

interface ControlsDockProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
  onShowEmojiPicker: () => void;
}

interface ControlButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDanger?: boolean;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  shortcut?: string;
}

function ControlButton({ 
  onClick, 
  isActive = true, 
  isDanger = false,
  icon, 
  activeIcon,
  label,
  shortcut
}: ControlButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
          ${isDanger 
            ? 'bg-red-500 hover:bg-red-600 hover:shadow-glow-red' 
            : isActive 
              ? 'bg-white/10 hover:bg-white/15 hover:shadow-glow-cyan' 
              : 'bg-red-500/80 hover:bg-red-500'
          }
        `}
      >
        {isActive ? icon : (activeIcon || icon)}
      </motion.button>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-lynkl-charcoal border border-white/10 whitespace-nowrap"
          >
            <span className="text-xs font-medium">{label}</span>
            {shortcut && (
              <span className="ml-2 text-xs text-lynkl-gray">{shortcut}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ControlsDock({
  isMicOn,
  isCameraOn,
  isChatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  onLeave,
  onShowEmojiPicker
}: ControlsDockProps) {
  const [showMore, setShowMore] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };
  
  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass-panel px-4 py-3 flex items-center gap-3">
        {/* Mic */}
        <ControlButton
          onClick={onToggleMic}
          isActive={isMicOn}
          icon={<Mic className="w-5 h-5" />}
          activeIcon={<MicOff className="w-5 h-5" />}
          label={isMicOn ? 'Mute' : 'Unmute'}
          shortcut="⌘D"
        />
        
        {/* Camera */}
        <ControlButton
          onClick={onToggleCamera}
          isActive={isCameraOn}
          icon={<Video className="w-5 h-5" />}
          activeIcon={<VideoOff className="w-5 h-5" />}
          label={isCameraOn ? 'Stop video' : 'Start video'}
          shortcut="⌘E"
        />
        
        {/* Divider */}
        <div className="w-px h-8 bg-white/10" />
        
        {/* Screen Share */}
        <ControlButton
          onClick={handleScreenShare}
          isActive={!isScreenSharing}
          icon={<Monitor className="w-5 h-5" />}
          label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        />
        
        {/* Reactions */}
        <ControlButton
          onClick={onShowEmojiPicker}
          isActive={true}
          icon={<Smile className="w-5 h-5" />}
          label="Reactions"
        />
        
        {/* Raise Hand */}
        <ControlButton
          onClick={handleRaiseHand}
          isActive={!isHandRaised}
          icon={<Hand className={`w-5 h-5 ${isHandRaised ? 'text-lynkl-cyan' : ''}`} />}
          label={isHandRaised ? 'Lower hand' : 'Raise hand'}
        />
        
        {/* Chat */}
        <ControlButton
          onClick={onToggleChat}
          isActive={!isChatOpen}
          icon={<MessageSquare className="w-5 h-5" />}
          label={isChatOpen ? 'Close chat' : 'Open chat'}
          shortcut="⌘/"
        />
        
        {/* More options */}
        <div className="relative">
          <ControlButton
            onClick={() => setShowMore(!showMore)}
            isActive={true}
            icon={<MoreVertical className="w-5 h-5" />}
            label="More"
          />
          
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 glass-card p-2 min-w-[160px]"
              >
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                  <Settings className="w-4 h-4 text-lynkl-gray" />
                  <span className="text-sm">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                  <Users className="w-4 h-4 text-lynkl-gray" />
                  <span className="text-sm">Participants</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Divider */}
        <div className="w-px h-8 bg-white/10" />
        
        {/* Leave button */}
        <motion.button
          onClick={onLeave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Hand raised indicator */}
      <AnimatePresence>
        {isHandRaised && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-lynkl-cyan/20 border border-lynkl-cyan/30"
          >
            <div className="flex items-center gap-2">
              <Hand className="w-4 h-4 text-lynkl-cyan" />
              <span className="text-sm font-medium text-lynkl-cyan">Hand raised</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
