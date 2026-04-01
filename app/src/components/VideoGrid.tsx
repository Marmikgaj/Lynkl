import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MicOff, VideoOff, User, Monitor } from 'lucide-react';

interface Participant {
  id: string;
  username: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
}

function Avatar3D({ username, isSpeaking }: { username: string; isSpeaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Generate consistent color from username
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    
    const draw = () => {
      ctx.fillStyle = '#0F0F14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw abstract avatar
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 60;
      
      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.5);
      gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.3)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 60%, 40%, 0.8)`;
      ctx.fill();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.9)`;
      ctx.fill();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 70%, 1)`;
      ctx.fill();
      
      // Audio wave rings if speaking
      if (isSpeaking) {
        const time = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
          const offset = i * 0.5;
          const radius = baseRadius + 20 + Math.sin(time * 3 + offset) * 10;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.4 - i * 0.1})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      requestAnimationFrame(draw);
    };
    
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [username, isSpeaking]);
  
  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="w-full h-full object-cover"
    />
  );
}

function VideoTile({ 
  participant, 
  stream, 
  isLocal = false 
}: { 
  participant: Participant; 
  stream?: MediaStream | null;
  isLocal?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        video-tile relative overflow-hidden
        ${participant.isSpeaking ? 'ring-2 ring-lynkl-cyan ring-offset-2 ring-offset-lynkl-void' : ''}
      `}
    >
      {/* Video or Avatar */}
      {participant.isVideoOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-lynkl-charcoal">
          <Avatar3D username={participant.username} isSpeaking={participant.isSpeaking} />
        </div>
      )}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-lynkl-void/80 via-transparent to-transparent pointer-events-none" />
      
      {/* Username badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs font-medium">
          {participant.username} {isLocal && '(you)'}
        </span>
      </div>
      
      {/* Status indicators */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        {!participant.isAudioOn && (
          <div className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center">
            <MicOff className="w-3.5 h-3.5" />
          </div>
        )}
        {!participant.isVideoOn && (
          <div className="w-7 h-7 rounded-full bg-lynkl-gray/50 flex items-center justify-center">
            <VideoOff className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      
      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-0.5">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-lynkl-cyan rounded-full"
                animate={{
                  height: [4, 16, 8, 20, 4],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Screen share indicator */}
      {participant.isScreenSharing && (
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-lynkl-purple/80 text-xs font-medium flex items-center gap-1.5">
          <Monitor className="w-3 h-3" />
          Sharing screen
        </div>
      )}
    </motion.div>
  );
}

export default function VideoGrid({ 
  participants, 
  localStream, 
  isMicOn, 
  isCameraOn 
}: VideoGridProps) {
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  
  useEffect(() => {
    // Create local participant from props
    const local = participants.find(p => p.id === '1');
    if (local) {
      setLocalParticipant({
        ...local,
        isAudioOn: isMicOn,
        isVideoOn: isCameraOn
      });
    }
  }, [participants, isMicOn, isCameraOn]);
  
  const remoteParticipants = participants.filter(p => p.id !== '1');
  const totalParticipants = participants.length;
  
  // Determine grid layout based on participant count
  const getGridClass = () => {
    switch (totalParticipants) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
      case 4:
        return 'grid-cols-2';
      case 5:
      case 6:
        return 'grid-cols-3';
      default:
        return 'grid-cols-4';
    }
  };
  
  return (
    <div className={`w-full h-full grid ${getGridClass()} gap-3 p-1`}>
      {/* Local participant (always first) */}
      {localParticipant && (
        <VideoTile
          participant={localParticipant}
          stream={localStream}
          isLocal={true}
        />
      )}
      
      {/* Remote participants */}
      {remoteParticipants.map((participant) => (
        <VideoTile
          key={participant.id}
          participant={participant}
          isLocal={false}
        />
      ))}
      
      {/* Empty slots for demo (if less than 4 participants) */}
      {totalParticipants < 4 && [...Array(4 - totalParticipants)].map((_, i) => (
        <motion.div
          key={`empty-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="video-tile flex items-center justify-center bg-lynkl-charcoal/50 border-dashed border-2 border-white/10"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <User className="w-8 h-8 text-lynkl-gray/50" />
            </div>
            <p className="text-sm text-lynkl-gray/50">Waiting for others...</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
