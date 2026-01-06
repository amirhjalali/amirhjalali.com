// Mock OpenAI client for testing

const mockChatCompletion = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          summary: 'Test summary',
          excerpt: 'Test excerpt',
          keyInsights: ['Insight 1', 'Insight 2'],
          topics: ['topic1', 'topic2'],
          sentiment: 'neutral',
        }),
      },
    },
  ],
}

const mockEmbedding = {
  data: [
    {
      embedding: new Array(1536).fill(0.1), // Mock 1536-dimension embedding
    },
  ],
}

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue(mockChatCompletion),
    },
  },
  embeddings: {
    create: jest.fn().mockResolvedValue(mockEmbedding),
  },
}

export default jest.fn().mockImplementation(() => mockOpenAI)
