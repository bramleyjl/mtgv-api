// Database configuration that automatically adapts to the environment
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  // For Render environments (staging only), use DB_URL directly
  // The environment-specific DB_URL_STAGING/DB_URL_PRODUCTION are only for local development
  // Note: Production environment is not currently deployed
  if (process.env.RENDER) {
    return {
      url: process.env.DB_URL,
      name: process.env.DB_NAME || 'MTGVersioner'
    };
  }

  // For local staging environment (connecting to remote staging DB)
  if (env === 'staging') {
    return {
      url: process.env.DB_URL_STAGING || process.env.DB_URL,
      name: process.env.DB_NAME_STAGING || process.env.DB_NAME || 'MTGVersioner'
    };
  }

  // For local production environment (connecting to remote production DB)
  if (env === 'production') {
    return {
      url: process.env.DB_URL_PRODUCTION || process.env.DB_URL,
      name: process.env.DB_NAME_PRODUCTION || process.env.DB_NAME || 'MTGVersioner'
    };
  }

  // For Docker development
  if (process.env.DOCKER_ENV) {
    return {
      url: process.env.DB_URL || 'mongodb://127.0.0.1:27017',
      name: process.env.DB_NAME || 'MTGVersioner'
    };
  }

  // For local development (default)
  return {
    url: process.env.DB_URL || 'mongodb://127.0.0.1:27017',
    name: process.env.DB_NAME || 'MTGVersioner'
  };
};

export const dbConfig = getDatabaseConfig();
