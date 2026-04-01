import { create } from 'zustand';

interface Participant {
  id: string;
  username: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

interface RoomState {
  currentRoom: string | null;
  participants: Participant[];
  isHost: boolean;
  
  setCurrentRoom: (room: string | null) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  setIsHost: (isHost: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  participants: [],
  isHost: false,
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  addParticipant: (participant) => 
    set((state) => ({ 
      participants: [...state.participants, participant] 
    })),
  
  removeParticipant: (id) => 
    set((state) => ({ 
      participants: state.participants.filter(p => p.id !== id) 
    })),
  
  updateParticipant: (id, updates) => 
    set((state) => ({ 
      participants: state.participants.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ) 
    })),
  
  setIsHost: (isHost) => set({ isHost }),
}));
