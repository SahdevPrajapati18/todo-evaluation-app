import type { EmojiStyle } from "emoji-picker-react";

/**
 * Represents a universally unique identifier.
 */
export type UUID = ReturnType<typeof crypto.randomUUID>;

export type DarkModeOptions = "system" | "auto" | "light" | "dark";

/**
 * Task priority levels
 */
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";

/**
 * Task status for better tracking
 */
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled";

/**
 * Filter options for task views
 */
export type FilterOption = "All" | "Today" | "This Week" | "Custom" | "Overdue" | "Completed";

/**
 * Represents a user in the application.
 */
export interface User {
  name: string | null;
  createdAt: Date;
  /**
   * must be a URL starting with "https://" or a local file reference in the form "LOCAL_FILE_" + UUID
   */
  profilePicture: string | null;
  emojisStyle: EmojiStyle;
  tasks: Task[];
  /**
   * Stores the IDs of tasks that were deleted locally.
   * Used to ensure deletions are synced correctly across devices.
   */
  deletedTasks: UUID[];
  categories: Category[];
  deletedCategories: UUID[];
  favoriteCategories: UUID[];
  colorList: string[];
  settings: AppSettings;
  theme: "system" | (string & {});
  darkmode: DarkModeOptions;
  lastSyncedAt?: Date;
  /**
   * User preferences for notifications
   */
  notificationPreferences?: NotificationSettings;
  /**
   * User timezone for proper date handling
   */
  timezone?: string;
}

/**
 * Represents a task in the application.
 */
export interface Task {
  id: UUID;
  done: boolean;
  pinned: boolean;
  name: string;
  description?: string;
  emoji?: string;
  color: string;
  /**
   * created at date
   */
  date: Date;
  deadline?: Date;
  category?: Category[];
  lastSave?: Date;
  sharedBy?: string;
  /**
   * Optional numeric position for drag-and-drop (for p2p sync)
   */
  position?: number;
  /**
   * Priority level of the task
   */
  priority?: TaskPriority;
  /**
   * Task completion date
   */
  completedAt?: Date;
  /**
   * Estimated time to complete (in minutes)
   */
  estimatedTime?: number;
  /**
   * Actual time spent on task (in minutes)
   */
  timeSpent?: number;
  /**
   * Task status for workflow tracking
   */
  status?: TaskStatus;
  /**
   * Subtasks for complex tasks
   */
  subtasks?: SubTask[];
  /**
   * Tags for better organization
   */
  tags?: string[];
  /**
   * Task recurrence pattern
   */
  recurrence?: RecurrencePattern;
  /**
   * Attachments or links related to the task
   */
  attachments?: TaskAttachment[];
  /**
   * Comments or notes on the task
   */
  comments?: TaskComment[];
}

/**
 * Represents a subtask
 */
export interface SubTask {
  id: UUID;
  name: string;
  done: boolean;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Task recurrence pattern
 */
export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number; // e.g., every 2 days, every 3 weeks
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endDate?: Date;
  maxOccurrences?: number;
}

/**
 * Task attachment
 */
export interface TaskAttachment {
  id: UUID;
  name: string;
  type: "file" | "link" | "image" | "document";
  url: string;
  size?: number; // in bytes
  uploadedAt: Date;
}

/**
 * Task comment
 */
export interface TaskComment {
  id: UUID;
  content: string;
  createdAt: Date;
  author?: string;
}

/**
 * Represents a category in the application.
 */
export interface Category {
  id: UUID;
  name: string;
  emoji?: string;
  color: string;
  lastSave?: Date;
  /**
   * Category description
   */
  description?: string;
  /**
   * Parent category for hierarchical structure
   */
  parentId?: UUID;
  /**
   * Sort order within parent category
   */
  sortOrder?: number;
  /**
   * Whether category is archived
   */
  archived?: boolean;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  enableTaskReminders: boolean;
  enableDeadlineAlerts: boolean;
  reminderMinutes: number[]; // e.g., [15, 60, 1440] for 15min, 1hr, 1day before
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  enableEmailNotifications?: boolean;
  enablePushNotifications?: boolean;
}

/**
 * Represents application settings for the user.
 */
export interface AppSettings {
  enableCategories: boolean;
  doneToBottom: boolean;
  enableGlow: boolean;
  simpleEmojiPicker: boolean;
  enableReadAloud: boolean;
  appBadge: boolean;
  showProgressBar: boolean;
  /**
   * Voice property in the format 'name::lang' to ensure uniqueness on macOS/iOS,
   * where multiple voices can share the same name.
   */
  voice: `${string}::${string}`;
  voiceVolume: number;
  sortOption: SortOption;
  reduceMotion: ReduceMotionOption;
  /**
   * Default task priority when creating new tasks
   */
  defaultTaskPriority: TaskPriority;
  /**
   * Auto-save interval in minutes
   */
  autoSaveInterval: number;
  /**
   * Date format preference
   */
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  /**
   * Time format preference
   */
  timeFormat: "12h" | "24h";
  /**
   * First day of week (0 = Sunday, 1 = Monday)
   */
  firstDayOfWeek: 0 | 1;
  /**
   * Compact view for mobile
   */
  compactMode: boolean;
  /**
   * Show task numbers/indices
   */
  showTaskNumbers: boolean;
  /**
   * Auto-mark overdue tasks
   */
  autoMarkOverdue: boolean;
  /**
   * Default task color
   */
  defaultTaskColor: string;
  /**
   * Maximum number of recent colors to remember
   */
  maxRecentColors: number;
  /**
   * Enable keyboard shortcuts
   */
  enableKeyboardShortcuts: boolean;
  /**
   * Language preference
   */
  language: string;
  /**
   * Currency for any cost tracking features
   */
  currency?: string;
}

export type SortOption = "dateCreated" | "dueDate" | "alphabetical" | "custom" | "priority" | "status" | "completedAt";
export type ReduceMotionOption = "system" | "on" | "off";

/**
 * Export/Import data structure
 */
export interface ExportData {
  version: string;
  exportedAt: Date;
  user: Omit<User, 'lastSyncedAt'>;
  metadata?: {
    appVersion: string;
    platform: string;
  };
}

/**
 * Statistics and analytics
 */
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  averageCompletionTime: number; // in days
  mostUsedCategory?: Category;
  productivityStreak: number; // consecutive days with completed tasks
  totalTimeSpent: number; // in minutes
  averageTasksPerDay: number;
}

/**
 * Utility types for better type safety
 */
export type TaskWithoutId = Omit<Task, 'id'>;
export type CategoryWithoutId = Omit<Category, 'id'>;
export type UserSettings = Pick<User, 'settings' | 'theme' | 'darkmode' | 'emojisStyle'>;
export type TaskPreview = Pick<Task, 'id' | 'name' | 'done' | 'priority' | 'deadline' | 'category'>;

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface TaskApiResponse extends ApiResponse<Task> {}
export interface TaskListApiResponse extends ApiResponse<Task[]> {}
export interface UserApiResponse extends ApiResponse<User> {}

/**
 * Form validation types
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}