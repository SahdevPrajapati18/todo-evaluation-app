import React, { useState, useContext } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { UserContext } from "../contexts/UserContext";
import { Task } from "../types/user";

const AddTask: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"Critical" | "High" | "Medium" | "Low">("Medium");
  const [error, setError] = useState("");

  // FIXED: Better validation and error handling
  const validateForm = () => {
    if (!name.trim()) {
      setError("Task name is required");
      return false;
    }
    if (name.trim().length > 100) {
      setError("Task name must be less than 100 characters");
      return false;
    }
    if (description.length > 500) {
      setError("Description must be less than 500 characters");
      return false;
    }
    if (deadline) {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError("Deadline cannot be in the past");
        return false;
      }
    }
    return true;
  };

  const handleAddTask = () => {
    setError("");
    
    if (!validateForm()) {
      return;
    }

    try {
      const newTask: Task = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || undefined,
        color: "#1976d2",
        date: new Date(),
        deadline: deadline ? new Date(deadline + "T23:59:59") : undefined, // FIXED: Set end of day for deadline
        category: [],
        done: false,
        pinned: false,
        priority,
      };

      setUser({
        ...user,
        tasks: [...user.tasks, newTask],
      });

      // FIXED: Reset form and close dialog
      handleClose();
    } catch (error) {
      setError("Failed to add task. Please try again.");
      console.error("Error adding task:", error);
    }
  };

  // FIXED: Proper form reset function
  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setDeadline("");
    setPriority("Medium");
    setError("");
  };

  // FIXED: Handle Enter key submission
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleAddTask();
    }
  };

  // FIXED: Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Task
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          onKeyDown: handleKeyPress
        }}
      >
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Task Name *"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ marginBottom: 2 }}
            error={!name.trim() && name !== ""}
            helperText={`${name.length}/100 characters`}
            inputProps={{ maxLength: 100 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
            helperText={`${description.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />
          
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            sx={{ marginBottom: 2 }}
            inputProps={{ 
              min: getMinDate() // FIXED: Prevent past dates
            }}
            helperText="Optional: Set a deadline for this task"
          />
          
          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "Critical" | "High" | "Medium" | "Low")}
            fullWidth
            sx={{ marginBottom: 2 }}
            helperText="Choose the priority level for this task"
          >
            <MenuItem value="Critical">🔴 Critical</MenuItem>
            <MenuItem value="High">🟡 High</MenuItem>
            <MenuItem value="Medium">🟣 Medium</MenuItem>
            <MenuItem value="Low">🟢 Low</MenuItem>
          </TextField>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddTask}
            disabled={!name.trim()} // FIXED: Disable if name is empty
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTask;