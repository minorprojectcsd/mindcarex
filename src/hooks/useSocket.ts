import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage, RiskIndicator, WebRTCSignal } from '@/types';

// Mock Socket implementation for development
// Replace with actual Socket.IO client in production

interface SocketEvents {
  onMessage: (message: ChatMessage) => void;
  onTyping: (data: { userId: string; isTyping: boolean }) => void;
  onRiskAlert: (alert: RiskIndicator) => void;
  onWebRTCSignal: (signal: WebRTCSignal) => void;
  onUserJoined: (userId: string) => void;
  onUserLeft: (userId: string) => void;
  onSessionEnd: () => void;
}

export function useSocket(sessionId: string, userId: string, events: Partial<SocketEvents>) {
  const [isConnected, setIsConnected] = useState(false);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    // Simulate connection
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      console.log('[Socket] Connected to session:', sessionId);
    }, 500);

    return () => {
      clearTimeout(connectTimeout);
      setIsConnected(false);
      console.log('[Socket] Disconnected from session:', sessionId);
    };
  }, [sessionId]);

  const sendMessage = useCallback((content: string) => {
    if (!isConnected) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId,
      senderId: userId,
      senderRole: userId.startsWith('doctor') ? 'DOCTOR' : 'PATIENT',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Simulate sending and receiving
    setTimeout(() => {
      eventsRef.current.onMessage?.(message);
    }, 100);

    console.log('[Socket] Message sent:', content);
  }, [isConnected, sessionId, userId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!isConnected) return;
    console.log('[Socket] Typing:', isTyping);
  }, [isConnected]);

  const sendWebRTCSignal = useCallback((signal: Omit<WebRTCSignal, 'from'>) => {
    if (!isConnected) return;
    console.log('[Socket] WebRTC signal:', signal.type);
  }, [isConnected]);

  const joinSession = useCallback(() => {
    if (!isConnected) return;
    console.log('[Socket] Joining session:', sessionId);
    eventsRef.current.onUserJoined?.(userId);
  }, [isConnected, sessionId, userId]);

  const leaveSession = useCallback(() => {
    if (!isConnected) return;
    console.log('[Socket] Leaving session:', sessionId);
    eventsRef.current.onUserLeft?.(userId);
  }, [isConnected, sessionId, userId]);

  const endSession = useCallback(() => {
    if (!isConnected) return;
    console.log('[Socket] Ending session:', sessionId);
    eventsRef.current.onSessionEnd?.();
  }, [isConnected, sessionId]);

  return {
    isConnected,
    sendMessage,
    sendTyping,
    sendWebRTCSignal,
    joinSession,
    leaveSession,
    endSession,
  };
}
