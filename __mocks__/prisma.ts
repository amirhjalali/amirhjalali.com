// Mock Prisma client for testing
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Create a deep mock of Prisma client
export const prismaMock = mockDeep<PrismaClient>()

// Reset mock before each test
beforeEach(() => {
  mockReset(prismaMock)
})

// Export as default for module mocking
export default prismaMock
