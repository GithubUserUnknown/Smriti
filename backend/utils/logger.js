const logger = {
  error: (message, error) => {
    if (process.env.NODE_ENV === 'production') {
      // In production, log only non-sensitive information
      console.error(message, error?.name || 'Unknown error');
    } else {
      // In development, log full error details
      console.error(message, error);
    }
  },
  
  info: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message);
    }
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(message);
    }
  }
};

module.exports = logger;