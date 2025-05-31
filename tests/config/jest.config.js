export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Update paths to be relative to this config file
  rootDir: '../../',
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['./tests/config/testEnv.js'],
  setupFilesAfterEnv: ['./tests/config/jest.setup.js'],
  globalSetup: './tests/config/globalSetup.js',
  globalTeardown: './tests/config/globalTeardown.js'
};