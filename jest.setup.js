// Jest setup file

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// }

// Global test timeout
jest.setTimeout(30000)
