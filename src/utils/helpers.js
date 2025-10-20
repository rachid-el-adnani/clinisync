/**
 * Utility helper functions
 */

/**
 * Format error message for API response
 */
function formatErrorResponse(error) {
  return {
    success: false,
    message: error.message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
}

/**
 * Format success message for API response
 */
function formatSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format (YYYY-MM-DD HH:MM:SS)
 */
function isValidDateTime(dateTime) {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!dateTimeRegex.test(dateTime)) {
    return false;
  }
  
  const date = new Date(dateTime);
  return date instanceof Date && !isNaN(date);
}

/**
 * Sanitize SQL input (basic - use parameterized queries instead)
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return input.trim();
}

module.exports = {
  formatErrorResponse,
  formatSuccessResponse,
  isValidEmail,
  isValidDateTime,
  sanitizeInput
};

