import React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Chip,
  Typography,
  Box,
  IconButton
} from "@mui/material";
import { Close as CloseIcon, CalendarToday, Flag, Description, DateRange } from "@mui/icons-material";
import { Task } from "../types/user";

type TaskDetailsProps = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
};

// FIXED: Better priority colors and emojis
const PRIORITY_CONFIG: Record<string, { color: string; emoji: string; textColor: string }> = {
  Critical: { color: "#f44336", emoji: "🔴", textColor: "#fff" },
  High: { color: "#ff9800", emoji: "🟡", textColor: "#000" },
  Medium: { color: "#9c27b0", emoji: "🟣", textColor: "#fff" },
  Low: { color: "#4caf50", emoji: "🟢", textColor: "#fff" },
};

const TaskDetails: React.FC<TaskDetailsProps> = ({ open, onClose, task }) => {
  if (!task) return null;

  // FIXED: Better date formatting
  const formatDate = (date: Date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = taskDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (diffDays === 0) {
      return `${formattedDate} (Today)`;
    } else if (diffDays === 1) {
      return `${formattedDate} (Tomorrow)`;
    } else if (diffDays === -1) {
      return `${formattedDate} (Yesterday)`;
    } else if (diffDays > 0) {
      return `${formattedDate} (in ${diffDays} days)`;
    } else {
      return `${formattedDate} (${Math.abs(diffDays)} days ago)`;
    }
  };

  // FIXED: Check if task is overdue
  const isOverdue = task.deadline && !task.done && new Date(task.deadline) < new Date();

  const priorityConfig = PRIORITY_CONFIG[task.priority || "Medium"];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ flex: 1, mr: 2 }}>
          {task.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* Priority Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Flag color="action" />
            <Typography variant="body2" color="text.secondary">Priority:</Typography>
            <Chip
              label={`${priorityConfig.emoji} ${task.priority || "Medium"}`}
              size="small"
              sx={{
                backgroundColor: priorityConfig.color,
                color: priorityConfig.textColor,
                fontWeight: 'bold'
              }}
            />
          </Box>

          {/* Status Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip
              label={task.done ? "✅ Completed" : "⏳ Pending"}
              size="small"
              color={task.done ? "success" : "default"}
              variant={task.done ? "filled" : "outlined"}
            />
          </Box>

          {/* Creation Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateRange color="action" />
            <Typography variant="body2" color="text.secondary">Created:</Typography>
            <Typography variant="body2">
              {formatDate(task.date)}
            </Typography>
          </Box>

          {/* Deadline Section */}
          {task.deadline && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="action" />
              <Typography variant="body2" color="text.secondary">Deadline:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2"
                  color={isOverdue ? "error.main" : "text.primary"}
                >
                  {formatDate(task.deadline)}
                </Typography>
                {isOverdue && (
                  <Chip 
                    label="⚠️ Overdue" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Description Section */}
          {task.description && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Description color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Description:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'grey.50',
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  {task.description}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Additional Info */}
          {task.pinned && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Pinned:</Typography>
              <Chip label="📌 Yes" size="small" color="primary" variant="outlined" />
            </Box>
          )}

          {/* Categories (if implemented) */}
          {task.category && task.category.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">Categories:</Typography>
              {task.category.map((cat, index) => (
                <Chip 
                  key={cat.id || index} 
                  label={`${cat.emoji || ''} ${cat.name}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ backgroundColor: cat.color + '20', borderColor: cat.color }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;