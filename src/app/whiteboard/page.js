"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/helper/SocketProvider/socketcontextprovider';
import {
  Mic,
  MicOff,
  Users,
  Palette,
  Eraser,
  RotateCcw,
  Phone,
  PhoneOff,
  Copy,
  Check,
  AlertCircle,
  ClipboardEdit
} from 'lucide-react';

const normalizeRoomId = (id) => (typeof id === 'string' ? id.trim().toUpperCase() : id);

const WhiteboardPage = () => {
  const socket = useSocket();
  const { data: session } = useSession();

  // Connection state
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // Canvas and drawing state
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#FFFFFF'); // Default white color
  const [brushSize, setBrushSize] = useState(3);

  // Room and users state
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Voice chat state
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const [voiceUsers, setVoiceUsers] = useState(new Set());
  const [audioAllowed, setAudioAllowed] = useState(false);

  // Get user ID - handle different NextAuth structures
  const getUserId = () => {
    if (!session?.user) return null;
    return session.user.id || session.user.sub || session.user.email;
  };

  const getUsername = () => {
    if (!session?.user) return 'Anonymous';
    return session.user.name || session.user.email || 'User';
  };

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Monitor socket connection
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false);
      setConnectionStatus('No socket connection');
      return;
    }

    const handleConnect = () => {
      console.log('✅ Socket connected');
      setSocketConnected(true);
      setConnectionStatus('Connected');
      
      // Emit user online when socket connects
      if (session?.user) {
        const userId = getUserId();
        const username = getUsername();
        console.log('📡 Emitting user-online:', { userId, username });
        socket.emit('user-online', { userId, username });
      }
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
      setConnectionStatus('Disconnected');
      setIsInRoom(false);
      setRoomUsers([]);
    };

    const handleConnectError = (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionStatus('Connection error');
    };

    // Check if already connected
    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, session]);

  // Initialize canvas with black background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Store current canvas content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the canvas back down using CSS
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(dpr, dpr);
      
      // Set drawing properties
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Restore previous content if it existed
      if (imageData.width > 0 && imageData.height > 0) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !socketConnected) return;

    console.log('🔗 Setting up socket event listeners');

    // Whiteboard events
    const handleDrawingData = (data) => {
      console.log('🎨 Received drawing data:', data);
      handleRemoteDrawing(data);
    };

    const handleRoomUsers = (users) => {
      console.log('👥 Room users updated:', users);
      setRoomUsers(users);
    };

    const handleUserJoined = (user) => {
      console.log('➕ User joined room:', user);
      setRoomUsers(prev => {
        if (prev.find(u => u.userId === user.userId)) return prev;
        return [...prev, user];
      });
      
      // If voice already active, initiate connection to newcomer
      if (isVoiceConnected && user.userId !== getUserId()) {
        createPeerConnection(user.userId, true);
        socket.emit('voice-connected', { 
          roomId: normalizeRoomId(roomId), 
          userId: getUserId() 
        });
      }
    };

    const handleUserLeft = (userId) => {
      console.log('➖ User left room:', userId);
      setRoomUsers(prev => prev.filter(u => u.userId !== userId));
      setVoiceUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleCanvasCleared = () => {
      console.log('🧹 Canvas cleared by remote user');
      clearLocalCanvas();
    };

    const handleCanvasHistory = (canvasData) => {
      console.log('📜 Received canvas history:', canvasData.length, 'items');
      loadCanvasHistory(canvasData);
    };

    const handleRoomJoined = ({ roomId: joinedRoomId, userId, username }) => {
      console.log('✅ Successfully joined room:', { joinedRoomId, userId, username });
      setJoinError('');
    };

    // Voice events
    const handleVoiceConnected = ({ userId }) => {
      console.log('🎤 User voice connected:', userId);
      setVoiceUsers(prev => new Set([...prev, userId]));
    };

    const handleVoiceDisconnected = ({ userId }) => {
      console.log('🔇 User voice disconnected:', userId);
      const peerConnection = peerConnectionsRef.current.get(userId);
      if (peerConnection) {
        peerConnection.close();
        peerConnectionsRef.current.delete(userId);
      }
      setVoiceUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // WebRTC events
    const handleWebRTCOffer = (data) => {
      console.log('📞 Received WebRTC offer:', data);
      handleWebRTCOfferEvent(data);
    };

    const handleWebRTCAnswer = (data) => {
      console.log('📞 Received WebRTC answer:', data);
      handleWebRTCAnswerEvent(data);
    };

    const handleICECandidate = (data) => {
      console.log('🧊 Received ICE candidate:', data);
      handleICECandidateEvent(data);
    };

    const handleDebugResponse = (data) => {
      console.log('🐛 Server debug response:', data);
    };

    // Register all listeners
    socket.on('drawing-data', handleDrawingData);
    socket.on('room-users', handleRoomUsers);
    socket.on('user-joined-room', handleUserJoined);
    socket.on('user-left-room', handleUserLeft);
    socket.on('canvas-cleared', handleCanvasCleared);
    socket.on('canvas-history', handleCanvasHistory);
    socket.on('room-joined', handleRoomJoined);
    socket.on('user-voice-connected', handleVoiceConnected);
    socket.on('user-voice-disconnected', handleVoiceDisconnected);
    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleICECandidate);
    socket.on('debug-response', handleDebugResponse);

    return () => {
      console.log('🧹 Cleaning up socket event listeners');
      socket.off('drawing-data', handleDrawingData);
      socket.off('room-users', handleRoomUsers);
      socket.off('user-joined-room', handleUserJoined);
      socket.off('user-left-room', handleUserLeft);
      socket.off('canvas-cleared', handleCanvasCleared);
      socket.off('canvas-history', handleCanvasHistory);
      socket.off('room-joined', handleRoomJoined);
      socket.off('user-voice-connected', handleVoiceConnected);
      socket.off('user-voice-disconnected', handleVoiceDisconnected);
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleICECandidate);
      socket.off('debug-response', handleDebugResponse);
    };
  }, [socket, socketConnected, isVoiceConnected, roomId]);

  const handleRemoteDrawing = useCallback((data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { x, y, prevX, prevY, color, brushSize, tool } = data;

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, []);

  const loadCanvasHistory = useCallback((canvasData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear and set black background
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, rect.width, rect.height);

    canvasData.forEach(data => {
      const { x, y, prevX, prevY, color, brushSize, tool } = data;
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }, []);

  const clearLocalCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Clear and set black background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width) / dpr,
      y: (e.clientY - rect.top) * (canvas.height / rect.height) / dpr
    };
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);
    isDrawingRef.current = { prevX: pos.x, prevY: pos.y };
    const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    const { prevX, prevY } = isDrawingRef.current;

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (socket && isInRoom) {
      socket.emit('drawing-data', {
        roomId: normalizeRoomId(roomId),
        x: pos.x,
        y: pos.y,
        prevX,
        prevY,
        color,
        brushSize,
        tool,
        userId: getUserId()
      });
    }

    isDrawingRef.current = { prevX: pos.x, prevY: pos.y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      setJoinError('Please enter a room ID');
      return;
    }
    
    if (!socket || !socketConnected) {
      setJoinError('Socket not connected. Please wait...');
      return;
    }
    
    if (!session?.user) {
      setJoinError('Please sign in first');
      return;
    }

    const userId = getUserId();
    const username = getUsername();
    
    if (!userId) {
      setJoinError('Unable to get user ID. Please refresh and try again.');
      return;
    }

    const rid = normalizeRoomId(roomId);
    setRoomId(rid);
    setJoinError('');
    
    console.log(`🏠 Attempting to join room ${rid} as user ${userId} (${username})`);
    
    socket.emit('join-whiteboard-room', {
      roomId: rid,
      userId: userId,
      username: username
    });
    
    setIsInRoom(true);
  };

  const leaveRoom = () => {
    if (socket && isInRoom && session?.user) {
      socket.emit('leave-whiteboard-room', {
        roomId: normalizeRoomId(roomId),
        userId: getUserId()
      });
    }
    setIsInRoom(false);
    setRoomUsers([]);
    setVoiceUsers(new Set());
    disconnectVoice();
    clearLocalCanvas();
  };

  const clearCanvas = () => {
    clearLocalCanvas();
    if (socket && isInRoom) {
      socket.emit('clear-canvas', { roomId: normalizeRoomId(roomId) });
    }
  };

  // Voice chat functions
  const connectVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      localStreamRef.current = stream;
      setIsVoiceConnected(true);

      // Create peer connections for existing users
      roomUsers.forEach(user => {
        if (user.userId !== getUserId()) {
          createPeerConnection(user.userId, true);
        }
      });

      socket?.emit('voice-connected', { 
        roomId: normalizeRoomId(roomId), 
        userId: getUserId() 
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const disconnectVoice = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    setIsVoiceConnected(false);
    setIsMuted(false);

    socket?.emit('voice-disconnected', { 
      roomId: normalizeRoomId(roomId), 
      userId: getUserId() 
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const createPeerConnection = async (userId, isInitiator = false) => {
    if (!getUserId()) return;
    const peerConnection = new RTCPeerConnection(rtcConfig);
    peerConnectionsRef.current.set(userId, peerConnection);

    // Logging state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Peer ${userId} connection state:`, peerConnection.connectionState);
    };

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎵 Received remote audio stream from', userId);
      if (!audioAllowed) {
        console.warn('Audio autoplay might be blocked; user gesture required.');
      }
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.autoplay = true;
      remoteAudio.play().catch(e => {
        console.warn('Autoplay blocked, user interaction needed to enable audio.', e);
      });
    };

    // ICE
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          roomId: normalizeRoomId(roomId),
          candidate: event.candidate,
          targetUserId: userId,
          fromUserId: getUserId()
        });
      }
    };

    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket?.emit('webrtc-offer', {
          roomId: normalizeRoomId(roomId),
          offer,
          targetUserId: userId,
          fromUserId: getUserId()
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleWebRTCOfferEvent = async ({ offer, fromUserId }) => {
    try {
      if (!getUserId()) return;
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionsRef.current.set(fromUserId, peerConnection);

      peerConnection.onconnectionstatechange = () => {
        console.log(`🔗 (offer handling) Peer ${fromUserId} state:`, peerConnection.connectionState);
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      peerConnection.ontrack = (event) => {
        console.log('🎵 Received remote audio stream from', fromUserId);
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.autoplay = true;
        remoteAudio.play().catch(e => console.error('Error playing remote audio:', e));
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc-ice-candidate', {
            roomId: normalizeRoomId(roomId),
            candidate: event.candidate,
            targetUserId: fromUserId,
            fromUserId: getUserId()
          });
        }
      };

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket?.emit('webrtc-answer', {
        roomId: normalizeRoomId(roomId),
        answer,
        targetUserId: fromUserId,
        fromUserId: getUserId()
      });
    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
    }
  };

  const handleWebRTCAnswerEvent = async ({ answer, fromUserId }) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(fromUserId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling WebRTC answer:', error);
    }
  };

  const handleICECandidateEvent = async ({ candidate, fromUserId }) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(fromUserId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const allowAudioPlayback = () => {
    // user gesture to satisfy autoplay policies
    const a = new Audio();
    a.play().catch(() => {});
    setAudioAllowed(true);
  };

  // Enhanced color palette with better contrast for black background
  const colors = [
    '#FFFFFF', // White (default)
    '#FF0000', // Red
    '#00FF00', // Green
    '#0080FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#FF69B4', // Hot Pink
    '#32CD32', // Lime Green
    '#9370DB', // Medium Purple
    '#FFD700'  // Gold
  ];

  if (!session) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Please sign in to use the whiteboard</h2>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b-2 border-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <ClipboardEdit className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">Collaborative Whiteboard</h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border border-white ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-300">{connectionStatus}</span>
            </div>
          </div>

          {!isInRoom ? (
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="px-3 py-2 bg-black border-2 border-white rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
              <button
                onClick={generateRoomId}
                className="px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-lg font-medium transition-colors border-2 border-white"
              >
                Generate
              </button>
              <button
                onClick={joinRoom}
                disabled={!roomId.trim() || !socketConnected}
                className="px-4 py-2 bg-white text-black hover:bg-gray-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border-2 border-white disabled:border-gray-600"
              >
                Join Room
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Room: {roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="p-1 hover:bg-gray-800 rounded transition-colors border border-white"
                  title="Copy room ID"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Users className="w-4 h-4" />
                <span>{roomUsers.length}</span>
              </div>
              <button
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors border-2 border-red-600"
              >
                Leave Room
              </button>
            </div>
          )}
        </div>
        
        {/* Error Display */}
        {joinError && (
          <div className="mt-2 p-2 bg-red-900 border-2 border-red-400 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-200 text-sm">{joinError}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Toolbar - Made responsive */}
        {isInRoom && (
          <div className="w-16 lg:w-20 bg-gray-900 border-r-2 border-white flex flex-col items-center py-4 gap-4 flex-shrink-0">
            {/* Drawing Tools */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setTool('pen')}
                className={`p-2 lg:p-3 rounded-lg transition-colors border-2 ${tool === 'pen' ? 'bg-white text-black border-white' : 'bg-black text-white border-white hover:bg-gray-800'}`}
                title="Pen"
              >
                <Palette className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 lg:p-3 rounded-lg transition-colors border-2 ${tool === 'eraser' ? 'bg-white text-black border-white' : 'bg-black text-white border-white hover:bg-gray-800'}`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>

            {/* Color Palette */}
            <div className="flex flex-col gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 lg:w-8 lg:h-6 rounded border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-gray-600 hover:border-gray-400'}`}
                  style={{ backgroundColor: c }}
                  title={`Color: ${c}`}
                />
              ))}
            </div>

            {/* Brush Size */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-white font-bold">Size</div>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-12 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(brushSize/20)*100}%, #374151 ${(brushSize/20)*100}%, #374151 100%)`
                }}
              />
              <span className="text-xs text-white font-bold">{brushSize}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={clearCanvas}
                className="p-2 lg:p-3 bg-black text-white border-2 border-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Clear Canvas"
              >
                <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {isInRoom ? (
            <>
              {/* Canvas - Takes remaining space but doesn't push voice controls down */}
              <div className="flex-1 relative bg-black border-2 border-white min-h-0">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair"
                  style={{ background: '#000000' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              {/* Voice Controls - Always visible at bottom, fixed height */}
              <div className="bg-gray-900 border-t-2 border-white p-3 lg:p-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                    {!audioAllowed && (
                      <button
                        onClick={allowAudioPlayback}
                        className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black font-bold rounded border-2 border-yellow-400"
                      >
                        Enable Audio
                      </button>
                    )}
                    {!isVoiceConnected ? (
                      <button
                        onClick={connectVoice}
                        className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors border-2 border-green-400"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="hidden sm:inline">Connect Voice</span>
                        <span className="sm:hidden">Voice</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className={`p-2 rounded-lg transition-colors border-2 ${isMuted ? 'bg-red-600 hover:bg-red-700 border-red-400' : 'bg-green-600 hover:bg-green-700 border-green-400'} text-white`}
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={disconnectVoice}
                          className="p-2 bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white rounded-lg transition-colors"
                          title="Disconnect Voice"
                        >
                          <PhoneOff className="w-4 h-4" />
                        </button>
                        <span className="text-green-400 text-sm font-medium hidden sm:inline">Voice Connected</span>
                        <span className="text-green-400 text-xs font-medium sm:hidden">Connected</span>
                      </div>
                    )}
                  </div>

                  {/* Online Users - Made responsive */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white font-medium text-sm">Users ({roomUsers.length}):</span>
                    </div>
                    <div className="flex gap-2 flex-wrap flex-1 sm:flex-none">
                      {roomUsers.map((user) => (
                        <div
                          key={user.userId}
                          className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm flex items-center gap-1 lg:gap-2 border-2 ${
                            voiceUsers.has(user.userId) 
                              ? 'bg-green-700 border-green-400 text-white' 
                              : 'bg-black border-white text-white'
                          }`}
                          title={`${user.username}${voiceUsers.has(user.userId) ? ' (Voice Connected)' : ''}`}
                        >
                          {voiceUsers.has(user.userId) && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          )}
                          <span className="truncate max-w-[80px] lg:max-w-none">
                            {user.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-lg">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-900 border-2 border-white rounded-full flex items-center justify-center">
                  <Palette className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white">Welcome to Collaborative Whiteboard</h2>
                <p className="text-gray-300 mb-6 text-lg">Enter a room ID to start collaborating with others in real-time</p>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>• Draw and collaborate in real-time with crisp, clear lines</p>
                  <p>• Voice chat with room members</p>
                  <p>• Black canvas with white default marker for better contrast</p>
                  <p>• Share your room ID with others to invite them</p>
                </div>
                {!socketConnected && (
                  <div className="mt-6 p-4 bg-red-900 border-2 border-red-400 rounded-lg">
                    <p className="text-red-200 font-medium">Socket not connected. Please refresh the page.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhiteboardPage;