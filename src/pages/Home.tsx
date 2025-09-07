import { useState, useContext, useMemo, lazy, Suspense, useEffect } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import {
  AddButton,
  GreetingHeader,
  Offline,
  ProgressPercentageContainer,
  StyledProgress,
  TaskCompletionText,
  TaskCountClose,
  TaskCountHeader,
  TaskCountTextContainer,
  TasksCount,
  TasksCountContainer,
} from "../styles";
import { Emoji } from "emoji-picker-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { AddRounded, CloseRounded, TodayRounded, UndoRounded, WifiOff } from "@mui/icons-material";
import { UserContext } from "../contexts/UserContext";
import { useResponsiveDisplay } from "../hooks/useResponsiveDisplay";
import { useNavigate } from "react-router-dom";
import { AnimatedGreeting } from "../components/AnimatedGreeting";
import { showToast } from "../utils";

// It's a good practice to extend dayjs with plugins you need
dayjs.extend(isBetween);

const TasksList = lazy(() =>
  import("../components/tasks/TasksList").then((module) => ({ default: module.TasksList })),
);

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const { tasks, emojisStyle, settings, name } = user;
  const [filter, setFilter] = useState("All");
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);

  const isOnline = useOnlineStatus();
  const n = useNavigate();
  const isMobile = useResponsiveDisplay();

  useEffect(() => {
    document.title = "Todo App";
  }, []);

  const filteredTasks = useMemo(() => {
    const today = dayjs().startOf("day");
    const endOfWeek = dayjs().endOf("week");

    switch (filter) {
      case "Today":
        return tasks.filter((task) =>
          task.deadline ? dayjs(task.deadline).isSame(today, "day") : false,
        );
      case "This Week":
        return tasks.filter((task) =>
          task.deadline
            ? dayjs(task.deadline).isBetween(today, endOfWeek, "day", "[]")
            : false,
        );
      case "Custom":
        if (customStart && customEnd) {
          return tasks.filter((task) =>
            task.deadline
              ? dayjs(task.deadline).isBetween(customStart, customEnd, "day", "[]")
              : false,
          );
        }
        return [];
      default:
        return tasks;
    }
  }, [filter, tasks, customStart, customEnd]);

  const taskStats = useMemo(() => {
    const completedCount = tasks.filter((task) => task.done).length;
    const completedPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    // Corrected to use dayjs for consistency
    const today = dayjs().startOf("day");
    const dueTodayTasks = tasks.filter((task) => {
      if (task.deadline) {
        return dayjs(task.deadline).isSame(today, "day") && !task.done;
      }
      return false;
    });

    return {
      completedTasksCount: completedCount,
      completedTaskPercentage: completedPercentage,
      tasksWithDeadlineTodayCount: dueTodayTasks.length,
      tasksDueTodayNames: dueTodayTasks.map((task) => task.name),
    };
  }, [tasks]);

  const timeGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Good morning";
    if (currentHour >= 12 && currentHour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const taskCompletionText = useMemo(() => {
    const percentage = taskStats.completedTaskPercentage;
    if (percentage === 0) return "No tasks completed yet. Keep going!";
    if (percentage === 100) return "Congratulations! All tasks completed!";
    if (percentage >= 75) return "Almost there!";
    if (percentage >= 50) return "You're halfway there! Keep it up!";
    if (percentage >= 25) return "You're making good progress.";
    return "You're just getting started.";
  }, [taskStats.completedTaskPercentage]);

  const updateShowProgressBar = (value) => {
    setUser((prevUser) => ({
      ...prevUser,
      settings: { ...prevUser.settings, showProgressBar: value },
    }));
  };

  return (
    <>
      {/* 🔹 Filter Section - Wrapped in LocalizationProvider for Date Pickers */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
          >
            <ToggleButton value="All">All Tasks</ToggleButton>
            <ToggleButton value="Today">Today</ToggleButton>
            <ToggleButton value="This Week">This Week</ToggleButton>
            <ToggleButton value="Custom">Custom</ToggleButton>
          </ToggleButtonGroup>

          {filter === "Custom" && (
            <>
              <DatePicker
                label="Start Date"
                value={customStart}
                onChange={(newVal) => setCustomStart(newVal)}
              />
              <DatePicker
                label="End Date"
                value={customEnd}
                onChange={(newVal) => setCustomEnd(newVal)}
              />
            </>
          )}
        </Box>
      </LocalizationProvider>

      {/* Greeting */}
      <GreetingHeader>
        <Emoji unified="1f44b" emojiStyle={emojisStyle} /> &nbsp; {timeGreeting}
        {name && (
          <span translate="no">
            , <span>{name}</span>
          </span>
        )}
      </GreetingHeader>

      <AnimatedGreeting />

      {/* Offline Notice */}
      {!isOnline && (
        <Offline>
          <WifiOff /> You're offline but you can use the app!
        </Offline>
      )}

      {/* Progress Bar */}
      {tasks.length > 0 && settings.showProgressBar && (
        <TasksCountContainer>
          <TasksCount glow={settings.enableGlow}>
            <TaskCountClose
              size="small"
              onClick={() => {
                updateShowProgressBar(false);
                showToast(
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Progress bar hidden. You can enable it in settings.
                    <Button
                      variant="contained"
                      sx={{ p: "12px 32px" }}
                      onClick={() => updateShowProgressBar(true)}
                      startIcon={<UndoRounded />}
                    >
                      Undo
                    </Button>
                  </span>,
                );
              }}
            >
              <CloseRounded />
            </TaskCountClose>

            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <StyledProgress
                variant="determinate"
                value={taskStats.completedTaskPercentage}
                size={64}
                thickness={5}
                aria-label="Progress"
                glow={settings.enableGlow}
              />
              <ProgressPercentageContainer
                glow={settings.enableGlow && taskStats.completedTaskPercentage > 0}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="white"
                  sx={{ fontSize: "16px", fontWeight: 600 }}
                >
                  {`${Math.round(taskStats.completedTaskPercentage)}%`}
                </Typography>
              </ProgressPercentageContainer>
            </Box>

            <TaskCountTextContainer>
              <TaskCountHeader>
                {taskStats.completedTasksCount === 0
                  ? `You have ${tasks.length} task${tasks.length > 1 ? "s" : ""} to complete.`
                  : `You've completed ${taskStats.completedTasksCount} out of ${tasks.length} tasks.`}
              </TaskCountHeader>
              <TaskCompletionText>{taskCompletionText}</TaskCompletionText>
              {taskStats.tasksWithDeadlineTodayCount > 0 && (
                <span style={{ opacity: 0.8, display: "inline-block" }}>
                  <TodayRounded sx={{ fontSize: "20px", verticalAlign: "middle" }} />
                  &nbsp;Tasks due today:&nbsp;
                  <span translate="no">
                    {new Intl.ListFormat("en", { style: "long" }).format(
                      taskStats.tasksDueTodayNames,
                    )}
                  </span>
                </span>
              )}
            </TaskCountTextContainer>
          </TasksCount>
        </TasksCountContainer>
      )}

      {/* Tasks List */}
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        }
      >
        <TasksList tasks={filteredTasks} />
      </Suspense>

      {/* Add Button */}
      {!isMobile && (
        <Tooltip title={tasks.length > 0 ? "Add New Task" : "Add Task"} placement="left">
          <AddButton
            animate={tasks.length === 0}
            glow={settings.enableGlow}
            onClick={() => n("add")}
            aria-label="Add Task"
          >
            <AddRounded style={{ fontSize: "44px" }} />
          </AddButton>
        </Tooltip>
      )}
    </>
  );
};

export default Home;