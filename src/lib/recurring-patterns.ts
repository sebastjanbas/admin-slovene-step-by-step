/**
 * Utility functions for handling recurring patterns in timeblocks
 */

export interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly";
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  interval: number; // Every N days/weeks/months
  endDate?: Date;
}

export interface TimeblockData {
  title: string;
  description?: string;
  tutorId: number;
  startTime: Date;
  endTime: Date;
  price: number;
  location: string;
  maxStudents: number;
}

/**
 * Generate timeblocks based on a recurring pattern
 */
export function generateRecurringTimeblocks(
  baseTimeblock: TimeblockData,
  pattern: RecurringPattern,
  startDate: Date,
  endDate?: Date
): TimeblockData[] {
  const timeblocks: TimeblockData[] = [];
  const finalEndDate =
    endDate ||
    pattern.endDate ||
    new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days

  let currentDate = new Date(startDate);

  while (currentDate <= finalEndDate) {
    const shouldCreateTimeblock = shouldCreateOnDate(currentDate, pattern);

    if (shouldCreateTimeblock) {
      const timeblockStart = new Date(currentDate);
      const timeblockEnd = new Date(currentDate);

      // Set the time based on the base timeblock
      const baseStartTime = baseTimeblock.startTime;
      const baseEndTime = baseTimeblock.endTime;

      timeblockStart.setHours(
        baseStartTime.getHours(),
        baseStartTime.getMinutes(),
        0,
        0
      );
      timeblockEnd.setHours(
        baseEndTime.getHours(),
        baseEndTime.getMinutes(),
        0,
        0
      );

      timeblocks.push({
        ...baseTimeblock,
        startTime: timeblockStart,
        endTime: timeblockEnd,
      });
    }

    // Move to next occurrence
    currentDate = getNextOccurrence(currentDate, pattern);
  }

  return timeblocks;
}

/**
 * Check if a timeblock should be created on a specific date
 */
function shouldCreateOnDate(date: Date, pattern: RecurringPattern): boolean {
  if (pattern.frequency === "daily") {
    return true;
  }

  if (pattern.frequency === "weekly") {
    const dayOfWeek = date.getDay();
    return pattern.daysOfWeek?.includes(dayOfWeek) || false;
  }

  if (pattern.frequency === "monthly") {
    // For monthly, we create on the same day of the month
    return true;
  }

  return false;
}

/**
 * Get the next occurrence date based on the pattern
 */
function getNextOccurrence(currentDate: Date, pattern: RecurringPattern): Date {
  const nextDate = new Date(currentDate);

  switch (pattern.frequency) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + pattern.interval);
      break;

    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7 * pattern.interval);
      break;

    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + pattern.interval);
      break;
  }

  return nextDate;
}

/**
 * Parse a recurring pattern from JSON string
 */
export function parseRecurringPattern(
  patternJson: string | null
): RecurringPattern | null {
  if (!patternJson) return null;

  try {
    const parsed = JSON.parse(patternJson);
    return {
      frequency: parsed.frequency,
      daysOfWeek: parsed.daysOfWeek,
      interval: parsed.interval || 1,
      endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
    };
  } catch (error) {
    console.error("Error parsing recurring pattern:", error);
    return null;
  }
}

/**
 * Format a recurring pattern for display
 */
export function formatRecurringPattern(pattern: RecurringPattern): string {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  switch (pattern.frequency) {
    case "daily":
      return `Every ${pattern.interval} day${pattern.interval > 1 ? "s" : ""}`;

    case "weekly":
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = pattern.daysOfWeek
          .map((day) => daysOfWeek[day])
          .join(", ");
        return `Every ${pattern.interval} week${
          pattern.interval > 1 ? "s" : ""
        } on ${dayNames}`;
      }
      return `Every ${pattern.interval} week${pattern.interval > 1 ? "s" : ""}`;

    case "monthly":
      return `Every ${pattern.interval} month${
        pattern.interval > 1 ? "s" : ""
      }`;

    default:
      return "Unknown pattern";
  }
}

/**
 * Validate a recurring pattern
 */
export function validateRecurringPattern(pattern: RecurringPattern): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (
    !pattern.frequency ||
    !["daily", "weekly", "monthly"].includes(pattern.frequency)
  ) {
    errors.push("Invalid frequency. Must be 'daily', 'weekly', or 'monthly'");
  }

  if (pattern.interval < 1) {
    errors.push("Interval must be at least 1");
  }

  if (
    pattern.frequency === "weekly" &&
    (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)
  ) {
    errors.push("Weekly patterns must specify at least one day of the week");
  }

  if (pattern.daysOfWeek) {
    const invalidDays = pattern.daysOfWeek.filter((day) => day < 0 || day > 6);
    if (invalidDays.length > 0) {
      errors.push(
        "Invalid days of week. Must be between 0 (Sunday) and 6 (Saturday)"
      );
    }
  }

  if (pattern.endDate && pattern.endDate < new Date()) {
    errors.push("End date cannot be in the past");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get the next occurrence of a recurring pattern from a given date
 */
export function getNextRecurringDate(
  fromDate: Date,
  pattern: RecurringPattern
): Date | null {
  const validation = validateRecurringPattern(pattern);
  if (!validation.isValid) {
    return null;
  }

  let currentDate = new Date(fromDate);
  const maxIterations = 100; // Prevent infinite loops
  let iterations = 0;

  while (iterations < maxIterations) {
    if (shouldCreateOnDate(currentDate, pattern)) {
      return currentDate;
    }

    currentDate = getNextOccurrence(currentDate, pattern);
    iterations++;
  }

  return null;
}

/**
 * Check if a date matches a recurring pattern
 */
export function matchesRecurringPattern(
  date: Date,
  pattern: RecurringPattern
): boolean {
  return shouldCreateOnDate(date, pattern);
}
