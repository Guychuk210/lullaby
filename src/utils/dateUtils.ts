/**
 * Utility functions for date and timestamp handling
 */

/**
 * Validate and normalize a timestamp to ensure it's a valid number in milliseconds
 * 
 * @param timestamp The timestamp to validate
 * @returns A valid timestamp in milliseconds or current time if invalid
 */
export const normalizeTimestamp = (timestamp: any): number => {
  // If undefined or null, use current time
  if (timestamp === undefined || timestamp === null) {
    return Date.now();
  }

  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    // Try to parse as number
    const parsed = parseInt(timestamp, 10);
    if (!isNaN(parsed)) {
      // If it's in seconds format (10 digits), convert to milliseconds
      if (parsed < 1000000000000) {
        return parsed * 1000;
      }
      return parsed;
    }

    // Try to parse as date string
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }

    // Invalid string format
    return Date.now();
  }

  // If it's a number, validate it
  if (typeof timestamp === 'number') {
    if (isNaN(timestamp)) {
      return Date.now();
    }
    
    // If it's in seconds format (10 digits), convert to milliseconds
    if (timestamp < 1000000000000) {
      return timestamp * 1000;
    }
    
    return timestamp;
  }

  // If it's a Date object, get its time
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  // For any other type, use current time
  return Date.now();
};

/**
 * Format a timestamp for display
 * 
 * @param timestamp The timestamp to format
 * @param format The format string (optional)
 * @returns Formatted date string or empty string if invalid
 */
export const formatTimestamp = (timestamp: any, format?: string): string => {
  try {
    const normalizedTimestamp = normalizeTimestamp(timestamp);
    const date = new Date(normalizedTimestamp);
    
    // If format is provided, use it (would require a formatting library)
    // For now, return a simple ISO string
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

/**
 * Check if a timestamp is valid
 * 
 * @param timestamp The timestamp to check
 * @returns true if valid, false otherwise
 */
export const isValidTimestamp = (timestamp: any): boolean => {
  try {
    const normalizedTimestamp = normalizeTimestamp(timestamp);
    const date = new Date(normalizedTimestamp);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}; 