// Database configuration that automatically adapts to the environment
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // For staging environment (current Render deployment)
  if (env === 'staging' || process.env.RENDER) {
    return {
      url: process.env.DB_URL,
      name: process.env.DB_NAME || 'MTGVersioner'
    };
  }
  
  // For production environment (future production deployment)
  if (env === 'production') {
    return {
      url: process.env.DB_URL,
      name: process.env.DB_NAME || 'MTGVersioner'
    };
  }
  
  // For Docker development
  if (process.env.DOCKER_ENV) {
    return {
      url: 'mongodb://host.docker.internal:27017',
      name: 'MTGVersioner'
    };
  }
  
  // For local development (default)
  return {
    url: 'mongodb://127.0.0.1:27017',
    name: 'MTGVersioner'
  };
};

export const dbConfig = getDatabaseConfig(); 