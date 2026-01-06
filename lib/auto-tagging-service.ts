/**
 * Smart Auto-Tagging Service
 * Learns from user's manual tag additions and suggests tags based on similar notes
 */

import { prisma } from './db'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TagSuggestion {
  tag: string
  confidence: number
  reason: 'similar_notes' | 'topic_cooccurrence' | 'ai_extracted' | 'user_pattern'
  sourceNoteIds?: string[]
}

export interface UserTagPattern {
  topicId: string
  topicName: string
  manualCount: number
  autoCount: number
  preferenceScore: number // Higher means user prefers this tag
}

/**
 * Get tag suggestions for a note based on multiple signals
 */
export async function getTagSuggestions(
  noteId: string,
  limit: number = 10
): Promise<TagSuggestion[]> {
  const suggestions: TagSuggestion[] = []
  const seenTags = new Set<string>()

  try {
    // Get the note
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        noteTopics: {
          include: { topic: true },
        },
      },
    })

    if (!note) {
      throw new Error(`Note ${noteId} not found`)
    }

    // Existing topics for this note
    const existingTopics = new Set(note.noteTopics.map((nt) => nt.topic.name))

    // 1. Get suggestions from similar notes (by content similarity via embeddings)
    const similarNoteSuggestions = await getTagsFromSimilarNotes(noteId, existingTopics)
    for (const suggestion of similarNoteSuggestions) {
      if (!seenTags.has(suggestion.tag)) {
        suggestions.push(suggestion)
        seenTags.add(suggestion.tag)
      }
    }

    // 2. Get suggestions from topic co-occurrence patterns
    const cooccurrenceSuggestions = await getTagsFromCooccurrence(
      Array.from(existingTopics),
      existingTopics
    )
    for (const suggestion of cooccurrenceSuggestions) {
      if (!seenTags.has(suggestion.tag)) {
        suggestions.push(suggestion)
        seenTags.add(suggestion.tag)
      }
    }

    // 3. Get user's preferred tags based on their manual additions
    const userPatterns = await getUserTagPatterns()
    for (const pattern of userPatterns.slice(0, 5)) {
      if (!seenTags.has(pattern.topicName) && !existingTopics.has(pattern.topicName)) {
        // Check if this tag is relevant to the note content
        const isRelevant = await checkTagRelevance(
          note.fullContent || note.content,
          pattern.topicName
        )
        if (isRelevant) {
          suggestions.push({
            tag: pattern.topicName,
            confidence: pattern.preferenceScore * 0.6,
            reason: 'user_pattern',
          })
          seenTags.add(pattern.topicName)
        }
      }
    }

    // 4. Use AI to extract additional relevant tags
    if (note.fullContent || note.content) {
      const aiSuggestions = await getAITagSuggestions(
        note.fullContent || note.content,
        existingTopics,
        seenTags
      )
      for (const suggestion of aiSuggestions) {
        if (!seenTags.has(suggestion.tag)) {
          suggestions.push(suggestion)
          seenTags.add(suggestion.tag)
        }
      }
    }

    // Sort by confidence and limit
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, limit)
  } catch (error) {
    console.error(`Failed to get tag suggestions for note ${noteId}:`, error)
    return []
  }
}

/**
 * Get tags from notes with similar embeddings
 */
async function getTagsFromSimilarNotes(
  noteId: string,
  existingTopics: Set<string>
): Promise<TagSuggestion[]> {
  try {
    // Get chunks for the note to find its embeddings
    const noteChunks = await prisma.noteChunk.findMany({
      where: { noteId },
      select: { embedding: true },
      take: 3, // Use first few chunks for similarity
    })

    if (noteChunks.length === 0) {
      return []
    }

    // Use the first chunk's embedding for similarity search
    const firstEmbedding = noteChunks[0].embedding as number[]
    if (!firstEmbedding || firstEmbedding.length === 0) {
      return []
    }

    // Find similar notes using cosine similarity
    // Note: In production, this would use pgvector for efficient similarity search
    // For now, we'll do a simpler approach with related topics
    const similarNotes = await prisma.note.findMany({
      where: {
        id: { not: noteId },
        processStatus: { in: ['COMPLETED', 'INDEXED'] },
      },
      include: {
        noteTopics: {
          include: { topic: true },
        },
      },
      take: 20,
    })

    // Count tag frequency in similar notes
    const tagCounts = new Map<string, { count: number; noteIds: string[] }>()

    for (const similarNote of similarNotes) {
      for (const nt of similarNote.noteTopics) {
        const tagName = nt.topic.name
        if (!existingTopics.has(tagName)) {
          const existing = tagCounts.get(tagName) || { count: 0, noteIds: [] }
          existing.count++
          existing.noteIds.push(similarNote.id)
          tagCounts.set(tagName, existing)
        }
      }
    }

    // Convert to suggestions
    const suggestions: TagSuggestion[] = []
    for (const [tag, data] of tagCounts) {
      if (data.count >= 2) {
        // Only suggest if appears in 2+ similar notes
        suggestions.push({
          tag,
          confidence: Math.min(0.9, data.count / 10),
          reason: 'similar_notes',
          sourceNoteIds: data.noteIds.slice(0, 3),
        })
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  } catch (error) {
    console.error('Failed to get tags from similar notes:', error)
    return []
  }
}

/**
 * Get tags based on topic co-occurrence patterns
 */
async function getTagsFromCooccurrence(
  currentTopics: string[],
  existingTopics: Set<string>
): Promise<TagSuggestion[]> {
  if (currentTopics.length === 0) {
    return []
  }

  try {
    // Get topic IDs
    const topics = await prisma.topic.findMany({
      where: { name: { in: currentTopics } },
      select: { id: true, name: true },
    })

    const topicIds = topics.map((t) => t.id)
    if (topicIds.length === 0) {
      return []
    }

    // Find related topics based on co-occurrence
    const relatedTopics = await prisma.topicRelation.findMany({
      where: {
        OR: [{ fromTopicId: { in: topicIds } }, { toTopicId: { in: topicIds } }],
      },
      include: {
        fromTopic: true,
        toTopic: true,
      },
      orderBy: { strength: 'desc' },
      take: 20,
    })

    // Build suggestions from related topics
    const suggestions: TagSuggestion[] = []
    const seenTopicIds = new Set(topicIds)

    for (const relation of relatedTopics) {
      const relatedTopic =
        topicIds.includes(relation.fromTopicId) ? relation.toTopic : relation.fromTopic

      if (!seenTopicIds.has(relatedTopic.id) && !existingTopics.has(relatedTopic.name)) {
        seenTopicIds.add(relatedTopic.id)
        suggestions.push({
          tag: relatedTopic.displayName || relatedTopic.name,
          confidence: Math.min(0.8, relation.strength / 10),
          reason: 'topic_cooccurrence',
        })
      }
    }

    return suggestions.slice(0, 5)
  } catch (error) {
    console.error('Failed to get tags from co-occurrence:', error)
    return []
  }
}

/**
 * Get user's tag patterns (what they tend to manually add)
 */
export async function getUserTagPatterns(): Promise<UserTagPattern[]> {
  try {
    // Get all topics with their usage counts
    const topics = await prisma.topic.findMany({
      include: {
        noteTopics: {
          select: {
            autoExtracted: true,
          },
        },
      },
      where: {
        noteCount: { gt: 0 },
      },
    })

    // Calculate preference scores
    const patterns: UserTagPattern[] = topics.map((topic) => {
      const manualCount = topic.noteTopics.filter((nt) => !nt.autoExtracted).length
      const autoCount = topic.noteTopics.filter((nt) => nt.autoExtracted).length
      const total = manualCount + autoCount

      // Higher score for topics the user manually adds
      // Manual additions weighted 3x more than auto additions
      const preferenceScore = total > 0 ? (manualCount * 3 + autoCount) / (total * 3) : 0

      return {
        topicId: topic.id,
        topicName: topic.displayName || topic.name,
        manualCount,
        autoCount,
        preferenceScore,
      }
    })

    // Sort by manual count first, then preference score
    return patterns
      .filter((p) => p.manualCount > 0)
      .sort((a, b) => {
        if (b.manualCount !== a.manualCount) {
          return b.manualCount - a.manualCount
        }
        return b.preferenceScore - a.preferenceScore
      })
  } catch (error) {
    console.error('Failed to get user tag patterns:', error)
    return []
  }
}

/**
 * Check if a tag is relevant to content (simple keyword check)
 */
async function checkTagRelevance(content: string, tag: string): Promise<boolean> {
  if (!content) return false

  const normalizedContent = content.toLowerCase()
  const normalizedTag = tag.toLowerCase()

  // Check if tag or its variations appear in content
  const tagWords = normalizedTag.split(/\s+/)

  // All words must appear in content
  return tagWords.every((word) => normalizedContent.includes(word))
}

/**
 * Get AI-powered tag suggestions
 */
async function getAITagSuggestions(
  content: string,
  existingTopics: Set<string>,
  seenTags: Set<string>
): Promise<TagSuggestion[]> {
  try {
    const existingList = Array.from(existingTopics).join(', ')
    const seenList = Array.from(seenTags).join(', ')

    const systemPrompt = `You are a tagging assistant. Given content, suggest relevant tags that are NOT already present.
Current tags: ${existingList || 'none'}
Already suggested: ${seenList || 'none'}

Return 3-5 NEW tags as JSON: { "tags": ["tag1", "tag2", ...] }
Tags should be lowercase, 1-3 words each.
Only suggest highly relevant tags not already listed above.`

    const userPrompt = content.substring(0, 1500)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 150,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    const tags = result.tags || []

    return tags
      .filter((tag: string) => !existingTopics.has(tag.toLowerCase()) && !seenTags.has(tag.toLowerCase()))
      .map((tag: string) => ({
        tag: tag.toLowerCase().trim(),
        confidence: 0.7,
        reason: 'ai_extracted' as const,
      }))
  } catch (error) {
    console.error('Failed to get AI tag suggestions:', error)
    return []
  }
}

/**
 * Learn from a user's manual tag addition
 * Updates the topic's metadata to reflect user preference
 */
export async function recordManualTagAddition(
  noteId: string,
  tagName: string
): Promise<void> {
  try {
    // Normalize tag name
    const normalized = tagName.toLowerCase().trim()

    // Find or create the topic
    let topic = await prisma.topic.findUnique({
      where: { name: normalized },
    })

    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          name: normalized,
          displayName: tagName.trim(),
        },
      })
    }

    // Create the note-topic link as manually added
    await prisma.noteTopic.upsert({
      where: {
        noteId_topicId: { noteId, topicId: topic.id },
      },
      create: {
        noteId,
        topicId: topic.id,
        autoExtracted: false, // Manual addition
        relevance: 1.0, // User-added tags have high relevance
      },
      update: {
        autoExtracted: false,
        relevance: 1.0,
      },
    })

    // Update topic note count
    const count = await prisma.noteTopic.count({
      where: { topicId: topic.id },
    })

    await prisma.topic.update({
      where: { id: topic.id },
      data: { noteCount: count },
    })
  } catch (error) {
    console.error(`Failed to record manual tag addition:`, error)
    throw error
  }
}

/**
 * Remove a tag from a note
 */
export async function removeTagFromNote(noteId: string, tagName: string): Promise<void> {
  try {
    const normalized = tagName.toLowerCase().trim()

    const topic = await prisma.topic.findUnique({
      where: { name: normalized },
    })

    if (!topic) {
      return // Tag doesn't exist, nothing to remove
    }

    // Delete the note-topic link
    await prisma.noteTopic.deleteMany({
      where: {
        noteId,
        topicId: topic.id,
      },
    })

    // Update topic note count
    const count = await prisma.noteTopic.count({
      where: { topicId: topic.id },
    })

    await prisma.topic.update({
      where: { id: topic.id },
      data: { noteCount: count },
    })

    // If topic has no more notes, optionally delete it
    if (count === 0) {
      // For now, keep orphaned topics for future use
      // Could add a cleanup job that removes topics with 0 notes after X days
    }
  } catch (error) {
    console.error(`Failed to remove tag from note:`, error)
    throw error
  }
}

/**
 * Apply suggested tags to a note
 */
export async function applyTagSuggestions(
  noteId: string,
  tags: string[],
  autoExtracted: boolean = true
): Promise<void> {
  if (tags.length === 0) return

  try {
    await prisma.$transaction(async (tx) => {
      for (const tagName of tags) {
        const normalized = tagName.toLowerCase().trim()
        if (!normalized) continue

        // Find or create topic
        let topic = await tx.topic.findUnique({
          where: { name: normalized },
        })

        if (!topic) {
          topic = await tx.topic.create({
            data: {
              name: normalized,
              displayName: tagName.trim(),
            },
          })
        }

        // Create note-topic link
        await tx.noteTopic.upsert({
          where: {
            noteId_topicId: { noteId, topicId: topic.id },
          },
          create: {
            noteId,
            topicId: topic.id,
            autoExtracted,
            relevance: autoExtracted ? 0.8 : 1.0,
          },
          update: {
            // Don't overwrite manual additions with auto
            autoExtracted: autoExtracted ? undefined : false,
          },
        })

        // Update topic note count
        const count = await tx.noteTopic.count({
          where: { topicId: topic.id },
        })

        await tx.topic.update({
          where: { id: topic.id },
          data: { noteCount: count },
        })
      }
    })
  } catch (error) {
    console.error(`Failed to apply tag suggestions to note ${noteId}:`, error)
    throw error
  }
}

/**
 * Build personal topic ontology from user's notes
 * Returns a hierarchical structure of related topics
 */
export async function buildTopicOntology(): Promise<{
  topics: Array<{
    id: string
    name: string
    noteCount: number
    relatedTopics: Array<{ id: string; name: string; strength: number }>
  }>
}> {
  try {
    // Get all topics with their relations
    const topics = await prisma.topic.findMany({
      where: { noteCount: { gt: 0 } },
      include: {
        relatedFrom: {
          include: { toTopic: true },
          orderBy: { strength: 'desc' },
          take: 5,
        },
        relatedTo: {
          include: { fromTopic: true },
          orderBy: { strength: 'desc' },
          take: 5,
        },
      },
      orderBy: { noteCount: 'desc' },
    })

    return {
      topics: topics.map((topic) => ({
        id: topic.id,
        name: topic.displayName || topic.name,
        noteCount: topic.noteCount,
        relatedTopics: [
          ...topic.relatedFrom.map((r) => ({
            id: r.toTopic.id,
            name: r.toTopic.displayName || r.toTopic.name,
            strength: r.strength,
          })),
          ...topic.relatedTo.map((r) => ({
            id: r.fromTopic.id,
            name: r.fromTopic.displayName || r.fromTopic.name,
            strength: r.strength,
          })),
        ].slice(0, 5),
      })),
    }
  } catch (error) {
    console.error('Failed to build topic ontology:', error)
    return { topics: [] }
  }
}
