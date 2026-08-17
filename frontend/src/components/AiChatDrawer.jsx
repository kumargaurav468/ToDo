import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const SUGGESTED_PROMPTS = [
  '✅ Complete all work tasks',
  '⚡ Create a high priority task due tomorrow',
  '📋 Break down task into subtasks',
  '🧹 Clear all completed tasks'
];

export const AiChatDrawer = ({
  isOpen,
  onClose,
  onExecuteAiAction,
  tasks = []
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: "Hello! I'm your TaskFlow AI Assistant 🤖. You can ask me to create tasks, mark tasks as completed (e.g. 'Mark Work tasks complete'), generate subtask checklists, or clear finished items!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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

    try {
      const result = await onExecuteAiAction(promptText);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Sorry, I encountered an error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <AutoAwesomeIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              TaskFlow AI Assistant
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Automate task management with AI
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Suggested Quick Prompts */}
      <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Suggested Automations:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <Chip
              key={idx}
              label={prompt}
              size="small"
              onClick={() => handleSend(prompt)}
              disabled={loading}
              sx={{
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Message History */}
      <Box
        sx={{
          flexGrow: 1,
          p: 2.5,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
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
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main'
              }}
            >
              {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ maxWidth: '80%' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: msg.sender === 'user' ? 'primary.main' : 'action.selected',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  borderTopRightRadius: msg.sender === 'user' ? 4 : 12,
                  borderTopLeftRadius: msg.sender === 'user' ? 12 : 4
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
                  {msg.text}
                </Typography>
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

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.selected' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="caption" color="text.secondary">
                  TaskFlow AI is processing...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Box */}
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
          placeholder="Ask AI to complete tasks, create items..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          size="small"
          disabled={loading}
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
