import { create } from 'zustand';

interface MediaState {
  localStream: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
  
  initMedia: () => Promise<void>;
  toggleMic: () => void;
  toggleCamera: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  setDevices: (audio: MediaDeviceInfo[], video: MediaDeviceInfo[]) => void;
  selectAudioDevice: (deviceId: string) => void;
  selectVideoDevice: (deviceId: string) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  localStream: null,
  isMicOn: true,
  isCameraOn: true,
  isScreenSharing: false,
  audioDevices: [],
  videoDevices: [],
  selectedAudioDevice: null,
  selectedVideoDevice: null,
  
  initMedia: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      set({ localStream: stream });
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevs = devices.filter(d => d.kind === 'audioinput');
      const videoDevs = devices.filter(d => d.kind === 'videoinput');
      
      set({ 
        audioDevices: audioDevs,
        videoDevices: videoDevs,
        selectedAudioDevice: audioDevs[0]?.deviceId || null,
        selectedVideoDevice: videoDevs[0]?.deviceId || null
      });
    } catch (err) {
      console.error('Failed to get media:', err);
      // Create a dummy stream for demo purposes
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F0F14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00F0FF';
        ctx.font = '24px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Camera unavailable', canvas.width / 2, canvas.height / 2);
      }
      const dummyStream = canvas.captureStream();
      set({ localStream: dummyStream, isCameraOn: false });
    }
  },
  
  toggleMic: () => {
    const { localStream, isMicOn } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
      set({ isMicOn: !isMicOn });
    }
  },
  
  toggleCamera: () => {
    const { localStream, isCameraOn } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
      set({ isCameraOn: !isCameraOn });
    }
  },
  
  startScreenShare: async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      set({ isScreenSharing: true });
      
      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        get().stopScreenShare();
      };
    } catch (err) {
      console.error('Failed to start screen share:', err);
    }
  },
  
  stopScreenShare: () => {
    set({ isScreenSharing: false });
  },
  
  setDevices: (audio, video) => set({ 
    audioDevices: audio, 
    videoDevices: video 
  }),
  
  selectAudioDevice: (deviceId) => set({ selectedAudioDevice: deviceId }),
  selectVideoDevice: (deviceId) => set({ selectedVideoDevice: deviceId }),
}));
