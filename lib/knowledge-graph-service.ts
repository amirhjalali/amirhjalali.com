import { prisma } from './db'

/**
 * Normalize a topic name for consistent storage
 */
function normalizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Get or create a topic entity
 */
export async function getOrCreateTopic(topicName: string): Promise<string> {
  const normalized = normalizeTopic(topicName)

  if (!normalized) {
    throw new Error('Invalid topic name')
  }

  const existing = await prisma.topic.findUnique({
    where: { name: normalized },
  })

  if (existing) {
    return existing.id
  }

  const created = await prisma.topic.create({
    data: {
      name: normalized,
      displayName: topicName.trim(),
    },
  })

  return created.id
}

/**
 * Link a note to its topics, creating topic entities as needed
 * Uses a transaction to ensure all-or-nothing operation
 */
export async function linkNoteToTopics(
  noteId: string,
  topics: string[],
  autoExtracted: boolean = true
): Promise<void> {
  if (!topics || topics.length === 0) return

  // Normalize and deduplicate topics
  const normalizedTopics = [...new Set(topics.map(normalizeTopic).filter(t => t.length > 0))]

  if (normalizedTopics.length === 0) return

  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      const topicIds: string[] = []

      // First, get or create all topics
      for (const topic of topics) {
        const normalized = normalizeTopic(topic)
        if (!normalized) continue

        // Find or create topic within transaction
        let existing = await tx.topic.findUnique({
          where: { name: normalized },
        })

        if (!existing) {
          existing = await tx.topic.create({
            data: {
              name: normalized,
              displayName: topic.trim(),
            },
          })
        }

        topicIds.push(existing.id)
      }

      // Then, create all NoteTopic links
      for (const topicId of topicIds) {
        await tx.noteTopic.upsert({
          where: {
            noteId_topicId: { noteId, topicId },
          },
          create: {
            noteId,
            topicId,
            autoExtracted,
          },
          update: {
            autoExtracted,
          },
        })
      }

      // Finally, update all topic note counts
      for (const topicId of topicIds) {
        const count = await tx.noteTopic.count({
          where: { topicId },
        })

        await tx.topic.update({
          where: { id: topicId },
          data: { noteCount: count },
        })
      }
    })
  } catch (error) {
    console.error(`Failed to link topics to note ${noteId}:`, error)
    throw error // Re-throw to allow caller to handle
  }
}

/**
 * Update the note count for a topic
 */
async function _updateTopicNoteCount(topicId: string): Promise<void> {
  const count = await prisma.noteTopic.count({
    where: { topicId },
  })

  await prisma.topic.update({
    where: { id: topicId },
    data: { noteCount: count },
  })
}

/**
 * Find notes related to a given note by shared topics
 */
export async function findRelatedNotes(
  noteId: string,
  limit: number = 10
): Promise<Array<{ id: string; title: string | null; sharedTopics: string[]; score: number }>> {
  // Get topics for the current note
  const noteTopics = await prisma.noteTopic.findMany({
    where: { noteId },
    include: { topic: true },
  })

  if (noteTopics.length === 0) return []

  const topicIds = noteTopics.map((nt) => nt.topicId)

  // Find other notes with these topics
  const relatedNoteTopics = await prisma.noteTopic.findMany({
    where: {
      topicId: { in: topicIds },
      noteId: { not: noteId },
    },
    include: {
      note: {
        select: { id: true, title: true },
      },
      topic: {
        select: { name: true, displayName: true },
      },
    },
  })

  // Group by note and count shared topics
  const noteScores = new Map<
    string,
    { note: { id: string; title: string | null }; topics: string[]; score: number }
  >()

  for (const nt of relatedNoteTopics) {
    const existing = noteScores.get(nt.noteId)
    const topicName = nt.topic.displayName || nt.topic.name

    if (existing) {
      existing.topics.push(topicName)
      existing.score += nt.relevance
    } else {
      noteScores.set(nt.noteId, {
        note: nt.note,
        topics: [topicName],
        score: nt.relevance,
      })
    }
  }

  // Sort by score (number of shared topics * relevance)
  const sorted = Array.from(noteScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return sorted.map((item) => ({
    id: item.note.id,
    title: item.note.title,
    sharedTopics: item.topics,
    score: item.score,
  }))
}

/**
 * Auto-link notes that share multiple topics
 */
export async function autoLinkRelatedNotes(
  noteId: string,
  minSharedTopics: number = 2
): Promise<number> {
  const relatedNotes = await findRelatedNotes(noteId, 20)

  let linksCreated = 0

  for (const related of relatedNotes) {
    // Only auto-link if they share enough topics
    if (related.sharedTopics.length < minSharedTopics) continue

    try {
      // Check if link already exists
      const existingLink = await prisma.noteLink.findUnique({
        where: {
          fromNoteId_toNoteId: {
            fromNoteId: noteId,
            toNoteId: related.id,
          },
        },
      })

      if (!existingLink) {
        // Also check reverse direction
        const reverseLink = await prisma.noteLink.findUnique({
          where: {
            fromNoteId_toNoteId: {
              fromNoteId: related.id,
              toNoteId: noteId,
            },
          },
        })

        if (!reverseLink) {
          await prisma.noteLink.create({
            data: {
              fromNoteId: noteId,
              toNoteId: related.id,
              linkType: 'related',
              description: `Auto-linked: ${related.sharedTopics.length} shared topics (${related.sharedTopics.slice(0, 3).join(', ')})`,
              autoLinked: true,
            },
          })
          linksCreated++
        }
      }
    } catch (error) {
      console.warn(`Failed to auto-link notes ${noteId} and ${related.id}:`, error)
    }
  }

  return linksCreated
}

/**
 * Update topic-to-topic relationships based on co-occurrence in notes
 */
export async function updateTopicRelations(): Promise<void> {
  // Get all topics with their notes
  const topics = await prisma.topic.findMany({
    include: {
      noteTopics: {
        select: { noteId: true },
      },
    },
  })

  // Build co-occurrence map
  const coOccurrence = new Map<string, Map<string, number>>()

  for (const topic of topics) {
    const noteIds = new Set(topic.noteTopics.map((nt) => nt.noteId))

    for (const otherTopic of topics) {
      if (topic.id === otherTopic.id) continue

      const otherNoteIds = otherTopic.noteTopics.map((nt) => nt.noteId)
      const shared = otherNoteIds.filter((id) => noteIds.has(id)).length

      if (shared > 0) {
        if (!coOccurrence.has(topic.id)) {
          coOccurrence.set(topic.id, new Map())
        }
        coOccurrence.get(topic.id)!.set(otherTopic.id, shared)
      }
    }
  }

  // Update or create topic relations
  for (const [fromId, relations] of coOccurrence) {
    for (const [toId, strength] of relations) {
      // Only store one direction (lower ID -> higher ID)
      if (fromId > toId) continue

      await prisma.topicRelation.upsert({
        where: {
          fromTopicId_toTopicId: { fromTopicId: fromId, toTopicId: toId },
        },
        create: {
          fromTopicId: fromId,
          toTopicId: toId,
          strength,
        },
        update: {
          strength,
        },
      })
    }
  }
}

/**
 * Get the knowledge graph data for visualization
 */
export async function getKnowledgeGraphData(): Promise<{
  nodes: Array<{ id: string; label: string; type: 'note' | 'topic'; size: number }>
  edges: Array<{ source: string; target: string; weight: number }>
}> {
  // Get topics with note counts
  const topics = await prisma.topic.findMany({
    where: { noteCount: { gt: 0 } },
    orderBy: { noteCount: 'desc' },
    take: 50, // Limit for performance
  })

  // Get notes
  const notes = await prisma.note.findMany({
    where: {
      processStatus: { in: ['COMPLETED', 'INDEXED'] },
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      noteTopics: {
        include: { topic: true },
      },
    },
    take: 100, // Limit for performance
  })

  // Get topic relations
  const topicRelations = await prisma.topicRelation.findMany({
    where: {
      fromTopicId: { in: topics.map((t) => t.id) },
      toTopicId: { in: topics.map((t) => t.id) },
    },
  })

  // Build nodes
  const nodes: Array<{ id: string; label: string; type: 'note' | 'topic'; size: number }> = []

  // Add topic nodes
  for (const topic of topics) {
    nodes.push({
      id: `topic-${topic.id}`,
      label: topic.displayName || topic.name,
      type: 'topic',
      size: Math.min(topic.noteCount * 5, 50), // Scale size by note count
    })
  }

  // Add note nodes
  for (const note of notes) {
    nodes.push({
      id: `note-${note.id}`,
      label: note.title || note.excerpt?.substring(0, 30) || 'Untitled',
      type: 'note',
      size: 10,
    })
  }

  // Build edges
  const edges: Array<{ source: string; target: string; weight: number }> = []

  // Note to topic edges
  for (const note of notes) {
    for (const nt of note.noteTopics) {
      edges.push({
        source: `note-${note.id}`,
        target: `topic-${nt.topicId}`,
        weight: nt.relevance,
      })
    }
  }

  // Topic to topic edges
  for (const rel of topicRelations) {
    edges.push({
      source: `topic-${rel.fromTopicId}`,
      target: `topic-${rel.toTopicId}`,
      weight: rel.strength,
    })
  }

  return { nodes, edges }
}

/**
 * Get all links for a specific note
 */
export async function getNoteLinks(noteId: string): Promise<{
  linkedTo: Array<{ id: string; title: string | null; linkType: string; description: string | null }>
  linkedFrom: Array<{ id: string; title: string | null; linkType: string; description: string | null }>
}> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      linkedTo: {
        include: {
          toNote: {
            select: { id: true, title: true },
          },
        },
      },
      linkedFrom: {
        include: {
          fromNote: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  if (!note) {
    return { linkedTo: [], linkedFrom: [] }
  }

  return {
    linkedTo: note.linkedTo.map((link) => ({
      id: link.toNote.id,
      title: link.toNote.title,
      linkType: link.linkType,
      description: link.description,
    })),
    linkedFrom: note.linkedFrom.map((link) => ({
      id: link.fromNote.id,
      title: link.fromNote.title,
      linkType: link.linkType,
      description: link.description,
    })),
  }
}

/**
 * Create a manual link between two notes
 */
export async function createNoteLink(
  fromNoteId: string,
  toNoteId: string,
  linkType: string = 'related',
  description?: string
): Promise<void> {
  await prisma.noteLink.create({
    data: {
      fromNoteId,
      toNoteId,
      linkType,
      description,
      autoLinked: false,
    },
  })
}

/**
 * Delete a link between notes
 */
export async function deleteNoteLink(fromNoteId: string, toNoteId: string): Promise<void> {
  await prisma.noteLink.delete({
    where: {
      fromNoteId_toNoteId: { fromNoteId, toNoteId },
    },
  })
}
