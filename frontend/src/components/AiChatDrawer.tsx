import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
  Divider,
  Tooltip,
  InputAdornment,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import HearingIcon from '@mui/icons-material/Hearing';

const AUTOMATED_SUGGESTIONS = [
  'Add task prepare quarterly presentation tomorrow',
  'Delete all completed tasks',
  'How are you?',
  'What should I focus on next?',
  'Reschedule work tasks to next week',
  'Clear chat'
];

const stripAsterisks = (str) => {
  if (!str) return '';
  return str.replace(/\*/g, '');
};

const INITIAL_MESSAGE = {
  id: 'msg-init',
  sender: 'ai',
  text: "Hello! I am your Real-Time Accessibility Voice Agent 🤖🎙️. How can I assist your hands-free productivity today?\n\nYou can click the microphone button or speak your command (e.g. 'Add task report tomorrow', 'Delete completed tasks', 'How are you?'), and I will respond in voice!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const AiChatDrawer = ({
  isOpen,
  onClose,
  onExecuteAiAction,
  tasks = []
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [currentThoughtStep, setCurrentThoughtStep] = useState('');

  // Voice Assistant Accessibility State
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [voiceErrorNotice, setVoiceErrorNotice] = useState('');
  
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const accumulatedSpeechRef = useRef('');

  // Real-Time Typewriter Animation Engine
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef(null);

  // Text-To-Speech Read Aloud Helper
  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = stripAsterisks(text).replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  // Ultra-Robust Web Speech API Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceErrorNotice('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge for voice dictation.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = navigator.language || 'en-US';

    rec.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setVoiceErrorNotice('');
      setVoiceStatus('🎙️ Listening live... Speak now');
    };

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk + ' ';
        } else {
          interimTranscript += transcriptChunk;
        }
      }

      if (finalTranscript) {
        accumulatedSpeechRef.current += finalTranscript;
      }

      const combinedText = (accumulatedSpeechRef.current + interimTranscript).trim();
      if (combinedText) {
        setInput(combinedText);
      }
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceErrorNotice('Microphone access blocked. Please allow microphone permission in your browser address bar.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        setVoiceStatus('🎙️ Listening... (Waiting for voice speech)');
      } else if (event.error !== 'aborted') {
        setVoiceStatus(`Voice notice: ${event.error}`);
      }
    };

    rec.onend = () => {
      // Auto-restart if user has not toggled listening off
      if (isListeningRef.current) {
        try {
          rec.start();
        } catch {
          // ignore if active
        }
      } else {
        setIsListening(false);
        setVoiceStatus('');
      }
    };

    recognitionRef.current = rec;

    return () => {
      isListeningRef.current = false;
      try {
        rec.abort();
      } catch {}
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not available in your current browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      setVoiceStatus('');
      try {
        recognitionRef.current.stop();
      } catch {}
    } else {
      accumulatedSpeechRef.current = '';
      setInput('');
      setVoiceErrorNotice('');
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        // Try restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        } catch {}
      }
    }
  };

  // Real-Time Typewriter Typing Effect Logic
  useEffect(() => {
    const currentFullText = AUTOMATED_SUGGESTIONS[suggestionIndex];
    const typingSpeed = isDeleting ? 30 : 65;
    const pauseTime = isDeleting ? 250 : 2000;

    if (!isDeleting && charIndex === currentFullText.length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setSuggestionIndex((prev) => (prev + 1) % AUTOMATED_SUGGESTIONS.length);
      return;
    }

    const timer = setTimeout(() => {
      const nextCharIndex = charIndex + (isDeleting ? -1 : 1);
      setCharIndex(nextCharIndex);
      setTypedPlaceholder(currentFullText.substring(0, nextCharIndex));
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, suggestionIndex]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, currentThoughtStep, isOpen]);

  const handleApplyAutomatedSuggestion = () => {
    const textToInsert = typedPlaceholder || AUTOMATED_SUGGESTIONS[suggestionIndex];
    setInput(textToInsert);
  };

  const handleClearChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: `msg-init-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    if (isListening && recognitionRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    accumulatedSpeechRef.current = '';
    setLoading(true);

    // Simulate real-time step-by-step thinking
    setCurrentThoughtStep('🧠 Agent analyzing prompt intent & context...');
    await new Promise((r) => setTimeout(r, 200));

    setCurrentThoughtStep('⚡ Resolving SQL database tool bindings...');
    await new Promise((r) => setTimeout(r, 200));

    try {
      const result = await onExecuteAiAction(promptText);

      if (result.actionType === 'CLEAR_CHAT') {
        handleClearChat();
        return;
      }

      setCurrentThoughtStep('✨ Synthesizing response...');
      await new Promise((r) => setTimeout(r, 150));

      const cleanReply = stripAsterisks(result.reply);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: cleanReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(cleanReply);
    } catch (err) {
      const errMsg = `Real-Time Agent Error: ${err.message}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: errMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(errMsg);
    } finally {
      setLoading(false);
      setCurrentThoughtStep('');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.3)'
        }
      }}
    >
      {/* Drawer Header with Voice Accessibility Controls */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(168, 85, 247, 0.16) 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.5)',
              animation: 'pulseGlow 3s ease-in-out infinite alternate'
            }}
          >
            <AutoAwesomeIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              TaskFlow AI Agent
              <Chip
                label="LIVE AGENT"
                size="small"
                color="success"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RecordVoiceOverIcon sx={{ fontSize: 13, color: '#a855f7' }} /> Accessibility Voice Assistant
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isVoiceEnabled ? 'Disable Voice Read-Aloud' : 'Enable Voice Read-Aloud'}>
            <IconButton onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} size="small" color={isVoiceEnabled ? 'secondary' : 'default'}>
              {isVoiceEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Chat History">
            <IconButton onClick={handleClearChat} size="small">
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error notice if permission or browser issue */}
      {voiceErrorNotice && (
        <Alert severity="warning" onClose={() => setVoiceErrorNotice('')} sx={{ borderRadius: 0, fontSize: '0.8rem' }}>
          {voiceErrorNotice}
        </Alert>
      )}

      {/* Voice Status Indicator Banner when listening */}
      {isListening && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="caption" fontWeight={700} color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
            <HearingIcon sx={{ fontSize: 16 }} />
            {voiceStatus || '🎙️ Listening... Speak clearly into microphone'}
          </Typography>
          <IconButton size="small" onClick={toggleListening} color="error">
            <MicOffIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Message History */}
      <Box
        sx={{
          flexGrow: 1,
          p: 2.5,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              gap: 1.5,
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start'
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.85rem',
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main',
                boxShadow: msg.sender === 'ai' ? '0 4px 14px rgba(168, 85, 247, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ maxWidth: '82%' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: msg.sender === 'user' ? 'primary.main' : 'action.selected',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  borderTopRightRadius: msg.sender === 'user' ? 4 : 12,
                  borderTopLeftRadius: msg.sender === 'user' ? 12 : 4,
                  boxShadow: msg.sender === 'ai' ? '0 4px 16px rgba(0,0,0,0.12)' : '0 4px 16px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.5,
                    fontSize: '0.875rem'
                  }}
                >
                  {stripAsterisks(msg.text)}
                </Typography>

                {/* Read Aloud Button for AI Message Bubbles */}
                {msg.sender === 'ai' && (
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Read Message Aloud">
                      <IconButton size="small" onClick={() => speakText(msg.text)} sx={{ p: 0.5, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                        <VolumeUpIcon style={{ fontSize: 14, color: '#a855f7' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Paper>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, px: 0.5, textAlign: msg.sender === 'user' ? 'right' : 'left' }}
              >
                {msg.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Real-time Agent Thinking Animation State */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', animation: 'pulse 1.5s infinite' }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>

            <Paper elevation={0} sx={{ p: 1.75, borderRadius: 3, bgcolor: 'action.selected', borderTopLeftRadius: 4, maxWidth: '80%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress size={14} color="secondary" />
                <Typography variant="caption" fontWeight={700} color="secondary">
                  Real-Time AI Agent Reasoning...
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                {currentThoughtStep || '⚡ Executing real-time agent workflow...'}
              </Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Box with Voice Microphone & Typewriter Placeholder */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper'
        }}
      >
        {/* Voice Dictation Microphone Button */}
        <Tooltip title={isListening ? 'Stop Voice Dictation' : 'Click to Speak Command (Voice Dictation)'}>
          <IconButton
            onClick={toggleListening}
            color={isListening ? 'error' : 'secondary'}
            sx={{
              bgcolor: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(168, 85, 247, 0.12)',
              border: '1.5px solid',
              borderColor: isListening ? 'error.main' : 'rgba(168, 85, 247, 0.5)',
              transition: 'all 0.2s ease',
              animation: isListening ? 'pulse 1s infinite' : 'none',
              boxShadow: isListening ? '0 0 14px rgba(239, 68, 68, 0.5)' : 'none',
              '&:hover': {
                bgcolor: isListening ? 'rgba(239, 68, 68, 0.35)' : 'rgba(168, 85, 247, 0.25)',
                transform: 'scale(1.08)'
              }
            }}
          >
            {isListening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <TextField
          placeholder={isListening ? '🎙️ Listening... speak now' : (typedPlaceholder ? `${typedPlaceholder}|` : 'Speak or type a command...')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            if (!input && !isListening) {
              handleApplyAutomatedSuggestion();
            }
          }}
          fullWidth
          size="small"
          disabled={loading}
          InputProps={{
            endAdornment: !input ? (
              <InputAdornment position="end">
                <Tooltip title="Insert current suggestion">
                  <Chip
                    icon={<AutoFixHighIcon style={{ fontSize: 12, color: '#6366f1' }} />}
                    label="Insert"
                    size="small"
                    onClick={handleApplyAutomatedSuggestion}
                    sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  />
                </Tooltip>
              </InputAdornment>
            ) : null
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isListening ? 'rgba(239, 68, 68, 0.05)' : 'rgba(99, 102, 241, 0.03)',
              borderColor: isListening ? 'error.main' : undefined,
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)'
              },
              '&.Mui-focused': {
                borderColor: '#a855f7',
                boxShadow: '0 0 18px rgba(168, 85, 247, 0.35)',
                background: 'transparent'
              }
            }
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!input.trim() || loading}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.08)'
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Drawer>
  );
};
