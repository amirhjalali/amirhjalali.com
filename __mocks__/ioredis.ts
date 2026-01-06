// Mock ioredis for testing

const mockRedis = {
  connect: jest.fn().mockResolvedValue(undefined),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  setnx: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
}

const Redis = jest.fn().mockImplementation(() => mockRedis)

export { Redis }
export default Redis
