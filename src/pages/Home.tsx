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
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

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

// Extend dayjs
dayjs.extend(isBetween);

const TasksList = lazy(() =>
  import("../components/tasks/TasksList").then((module) => ({ default: module.TasksList })),
);

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const { tasks, emojisStyle, settings, name } = user;

  const [filter, setFilter] = useState("All");
  const [customStart, setCustomStart] = useState<Dayjs | null>(null);
  const [customEnd, setCustomEnd] = useState<Dayjs | null>(null);

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
          task.deadline ? dayjs(task.deadline).isBetween(today, endOfWeek, "day", "[]") : false,
        );
      case "Custom":
        if (customStart && customEnd) {
          return tasks.filter((task) =>
            task.deadline
              ? dayjs(task.deadline).isBetween(customStart, customEnd, "day", "[]")
              : false,
          );
        }
        return tasks;
      default:
        return tasks;
    }
  }, [filter, tasks, customStart, customEnd]);

  const taskStats = useMemo(() => {
    const completedCount = tasks.filter((task) => task.done).length;
    const completedPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    const today = dayjs().startOf("day");
    const dueTodayTasks = tasks.filter(
      (task) => task.deadline && dayjs(task.deadline).isSame(today, "day") && !task.done,
    );

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
    if (currentHour >= 12 && currentHour < 17) return "Good afternoon";
    if (currentHour >= 17 && currentHour < 21) return "Good evening";
    return "Good night";
  }, []);

  const taskCompletionText = useMemo(() => {
    const percentage = taskStats.completedTaskPercentage;
    const totalTasks = tasks.length;

    if (totalTasks === 0) return "Add your first task to get started!";
    if (percentage === 100) return "🎉 Amazing! All tasks completed!";
    if (percentage >= 75) return "🚀 Almost there! Just a few more to go!";
    if (percentage >= 50) return "💪 You're halfway there! Keep it up!";
    if (percentage >= 25) return "👍 You're making good progress!";
    return "🎯 You're just getting started. You've got this!";
  }, [taskStats.completedTaskPercentage, tasks.length]);

  const updateShowProgressBar = (value: boolean) => {
    setUser((prevUser) => ({
      ...prevUser,
      settings: { ...prevUser.settings, showProgressBar: value },
    }));
  };

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      if (newFilter !== "Custom") {
        setCustomStart(null);
        setCustomEnd(null);
      }
    }
  };

  const isValidCustomRange = customStart && customEnd && customStart.isBefore(customEnd);

  return (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
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
              onChange={(newVal: Dayjs | null) => setCustomStart(newVal)}
            />
            <DatePicker
              label="End Date"
              value={customEnd}
              onChange={(newVal: Dayjs | null) => setCustomEnd(newVal)}
              minDate={customStart || undefined}
            />
            {customStart && customEnd && !isValidCustomRange && (
              <Typography variant="caption" color="error">
                End date must be after start date
              </Typography>
            )}
          </>
        )}
      </Box>

      <GreetingHeader>
        <Emoji unified="1f44b" emojiStyle={emojisStyle} /> &nbsp; {timeGreeting}
        {name && (
          <span translate="no">
            , <span>{name}</span>
          </span>
        )}
      </GreetingHeader>

      <AnimatedGreeting />

      {!isOnline && (
        <Offline>
          <WifiOff /> You're offline but you can use the app!
        </Offline>
      )}

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
                <Box sx={{ opacity: 0.8, display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                  <TodayRounded sx={{ fontSize: "20px" }} />
                  <Typography variant="body2">
                    Tasks due today: {" "}
                    <span translate="no">
                      {new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(
                        taskStats.tasksDueTodayNames,
                      )}
                    </span>
                  </Typography>
                </Box>
              )}
            </TaskCountTextContainer>
          </TasksCount>
        </TasksCountContainer>
      )}

      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        {filteredTasks.length === 0 && tasks.length > 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No tasks found for {filter === "Custom" ? "selected date range" : filter.toLowerCase()}
            </Typography>
            <Button variant="outlined" onClick={() => setFilter("All")} sx={{ mt: 2 }}>
              View All Tasks
            </Button>
          </Box>
        ) : (
          <TasksList tasks={filteredTasks} />
        )}
      </Suspense>

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
