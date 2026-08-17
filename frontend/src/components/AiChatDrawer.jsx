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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import PsychofarmologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

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
  text: "Hello! I am your Real-Time TaskFlow AI Agent 🤖. How can I assist your productivity workflow today?\n\nYou can issue autonomous commands to create tasks ('Add task report tomorrow'), delete tasks ('Delete completed tasks'), clear chat history ('Clear chat'), or postpone dates!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  executedTool: 'agent_init_node()',
  thoughts: ['🟢 Agent system online', '⚡ Real-time database listening active']
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

  // Real-Time Typewriter Animation Engine
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef(null);

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

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Simulate real-time step-by-step thinking
    setCurrentThoughtStep('🧠 Agent analyzing prompt intent & context...');
    await new Promise((r) => setTimeout(r, 250));

    setCurrentThoughtStep('⚡ Resolving SQL database tool bindings...');
    await new Promise((r) => setTimeout(r, 250));

    try {
      const result = await onExecuteAiAction(promptText);

      if (result.actionType === 'CLEAR_CHAT') {
        handleClearChat();
        return;
      }

      setCurrentThoughtStep('✨ Synthesizing final agent response...');
      await new Promise((r) => setTimeout(r, 200));

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: stripAsterisks(result.reply),
        executedTool: result.executedTool || 'agent_node()',
        thoughts: result.thoughts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Real-Time Agent Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
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
          backgroundImage: 'none'
        }
      }}
    >
      {/* Drawer Header with Real-Time Agent Badge */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
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
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-Time Autonomous Copilot
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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

      {/* Message History & Agent Execution Traces */}
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
                boxShadow: msg.sender === 'ai' ? '0 2px 8px rgba(168, 85, 247, 0.3)' : 'none'
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
                  boxShadow: msg.sender === 'ai' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
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

                {/* Render Executed Tool Badge if available */}
                {msg.executedTool && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      icon={<BuildIcon style={{ fontSize: 12, color: '#a855f7' }} />}
                      label={`Tool Executed: ${msg.executedTool}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.68rem',
                        height: 22,
                        borderColor: 'rgba(168, 85, 247, 0.4)',
                        color: msg.sender === 'user' ? 'white' : 'text.secondary'
                      }}
                    />
                  </Box>
                )}

                {/* Render Agent Thought Process Accordion */}
                {msg.thoughts && msg.thoughts.length > 0 && (
                  <Accordion
                    elevation={0}
                    sx={{
                      mt: 1,
                      bgcolor: 'transparent',
                      '&:before': { display: 'none' },
                      borderTop: '1px dashed rgba(0,0,0,0.1)'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ fontSize: 14 }} />}
                      sx={{ p: 0, minHeight: 24, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem', fontWeight: 600 }}>
                        <PsychofarmologyIcon sx={{ fontSize: 13, color: '#6366f1' }} /> View Agent Execution Trace ({msg.thoughts.length} steps)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      {msg.thoughts.map((step, sIdx) => (
                        <Typography key={sIdx} variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                          {step}
                        </Typography>
                      ))}
                    </AccordionDetails>
                  </Accordion>
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

      {/* Input Box with Real-Time Typewriter Placeholder */}
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
        <TextField
          placeholder={typedPlaceholder ? `${typedPlaceholder}|` : "Type a command..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            if (!input) {
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
                    sx={{ height: 22, fontSize: '0.65rem', cursor: 'pointer' }}
                  />
                </Tooltip>
              </InputAdornment>
            ) : null
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
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
            '&:hover': {
              bgcolor: 'primary.dark'
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
