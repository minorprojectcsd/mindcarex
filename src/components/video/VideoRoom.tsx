import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import { ConsentSettings } from '@/types';
import { ChatPanel } from './ChatPanel';
import { cn } from '@/lib/utils';

interface VideoRoomProps {
  sessionId: string;
  consent: ConsentSettings;
  onEnd?: () => void;
}

export function VideoRoom({ sessionId, consent, onEnd }: VideoRoomProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFrameCapture = useCallback((frame: ImageData) => {
    // Send frame to Flask backend for emotion analysis
    console.log('[VideoRoom] Frame captured:', frame.width, 'x', frame.height);
    // In production: POST to Flask API
  }, []);

  const {
    localStream,
    isAudioMuted,
    isVideoOff,
    startCall,
    toggleAudio,
    toggleVideo,
    endCall,
    startFrameCapture,
  } = useWebRTC({
    sessionId,
    userId: user?.id || '',
    consent,
    onRemoteStream: setRemoteStream,
    onConnectionStateChange: setConnectionState,
    onFrameCapture: consent.emotionTrackingEnabled ? handleFrameCapture : undefined,
  });

  // Initialize video call
  useEffect(() => {
    startCall().catch(console.error);
    return () => {
      endCall();
    };
  }, [startCall, endCall]);

  // Set up local video
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      
      // Start frame capture for emotion analysis
      if (consent.emotionTrackingEnabled) {
        startFrameCapture(localVideoRef.current, 1000);
      }
    }
  }, [localStream, consent.emotionTrackingEnabled, startFrameCapture]);

  // Set up remote video
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    endCall();
    onEnd?.();
    navigate('/dashboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full min-h-[calc(100vh-4rem)] gap-4',
        isFullscreen && 'bg-background p-4'
      )}
    >
      {/* Main video area */}
      <div className="relative flex-1">
        {/* Remote video (main view) */}
        <div className="relative h-full overflow-hidden rounded-2xl bg-muted">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Waiting for participant...
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connection: {connectionState}
                </p>
              </div>
            </div>
          )}

          {/* Connection indicator */}
          <div className="absolute left-4 top-4">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm',
                connectionState === 'connected'
                  ? 'bg-success/20 text-success'
                  : 'bg-muted/80 text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  connectionState === 'connected'
                    ? 'animate-pulse-soft bg-success'
                    : 'bg-muted-foreground'
                )}
              />
              {connectionState === 'connected' ? 'Live' : 'Connecting...'}
            </div>
          </div>

          {/* Local video (picture-in-picture) */}
          <Card className="absolute bottom-4 right-4 h-36 w-48 overflow-hidden shadow-lg">
            {localStream && !isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <VideoOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Card>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <Button
            variant={isAudioMuted ? 'control-danger' : 'control'}
            size="icon-lg"
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            variant={isVideoOff ? 'control-danger' : 'control'}
            size="icon-lg"
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>

          <Button
            variant="control-danger"
            size="icon-lg"
            onClick={handleEndCall}
            title="End call"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          <div className="mx-2 h-8 w-px bg-border" />

          <Button
            variant={isChatOpen ? 'control-active' : 'control'}
            size="icon-lg"
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Toggle chat"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>

          <Button
            variant="control"
            size="icon-lg"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-6 w-6" />
            ) : (
              <Maximize className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Chat panel */}
      {isChatOpen && (
        <div className="w-80 animate-slide-in-right">
          <ChatPanel
            sessionId={sessionId}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
