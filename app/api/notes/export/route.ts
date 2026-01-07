import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/notes/export - Export notes in markdown or JSON format
export async function GET(request: NextRequest) {
  // 1. Validate session
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Get format from query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'markdown'

    // Validate format
    if (format !== 'markdown' && format !== 'json') {
      return NextResponse.json(
        { error: 'Invalid format. Use "markdown" or "json"' },
        { status: 400 }
      )
    }

    // 3. Fetch all processed notes with topics
    const notes = await prisma.note.findMany({
      where: {
        processStatus: 'COMPLETED',
      },
      include: {
        noteTopics: {
          include: {
            topic: true,
          },
        },
        notebook: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 4. Format based on requested format
    if (format === 'json') {
      // Return structured JSON
      const exportData = {
        exportedAt: new Date().toISOString(),
        noteCount: notes.length,
        notes: notes.map(note => ({
          id: note.id,
          title: note.title,
          type: note.type,
          content: note.content,
          fullContent: note.fullContent,
          excerpt: note.excerpt,
          summary: note.summary,
          keyInsights: note.keyInsights,
          sourceUrl: note.sourceUrl,
          domain: note.domain,
          topics: note.noteTopics.map(nt => nt.topic.name),
          tags: note.tags,
          notebook: note.notebook ? {
            id: note.notebook.id,
            title: note.notebook.title,
          } : null,
          wordCount: note.wordCount,
          readingTime: note.readingTime,
          pinned: note.pinned,
          starred: note.starred,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        })),
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="notes-export-${Date.now()}.json"`,
        },
      })
    }

    // 5. For markdown format
    const exportDate = new Date().toLocaleString()
    let markdown = `# Notes Export\n\n`
    markdown += `**Exported:** ${exportDate}\n`
    markdown += `**Total Notes:** ${notes.length}\n\n`
    markdown += `---\n\n`

    for (const note of notes) {
      markdown += `## ${note.title || 'Untitled'}\n\n`

      // Metadata section
      markdown += `**Type:** ${note.type}\n`

      if (note.sourceUrl) {
        markdown += `**Source:** [${note.domain || note.sourceUrl}](${note.sourceUrl})\n`
      }

      if (note.noteTopics.length > 0) {
        const topicNames = note.noteTopics.map(nt => nt.topic.name).join(', ')
        markdown += `**Topics:** ${topicNames}\n`
      }

      if (note.tags.length > 0) {
        markdown += `**Tags:** ${note.tags.join(', ')}\n`
      }

      if (note.notebook) {
        markdown += `**Notebook:** ${note.notebook.title}\n`
      }

      if (note.readingTime) {
        markdown += `**Reading Time:** ${note.readingTime} min\n`
      }

      markdown += `\n`

      // Summary section
      if (note.summary) {
        markdown += `### Summary\n\n${note.summary}\n\n`
      }

      // Key Insights section
      if (note.keyInsights && note.keyInsights.length > 0) {
        markdown += `### Key Insights\n\n`
        for (const insight of note.keyInsights) {
          markdown += `- ${insight}\n`
        }
        markdown += `\n`
      }

      // Content section
      if (note.fullContent || note.content) {
        markdown += `### Content\n\n`
        // Use fullContent if available, otherwise use content
        const contentToExport = note.fullContent || note.content
        // For very long content, truncate with a note
        if (contentToExport.length > 10000) {
          markdown += `${contentToExport.substring(0, 10000)}\n\n*[Content truncated - ${contentToExport.length} characters total]*\n\n`
        } else {
          markdown += `${contentToExport}\n\n`
        }
      }

      // Footer with dates
      markdown += `*Created: ${note.createdAt.toLocaleString()}*`
      if (note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime()) {
        markdown += ` | *Updated: ${note.updatedAt.toLocaleString()}*`
      }
      markdown += `\n\n`

      markdown += `---\n\n`
    }

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="notes-export-${Date.now()}.md"`,
      },
    })
  } catch (error: any) {
    console.error('GET /api/notes/export error:', error)
    return NextResponse.json(
      { error: 'Failed to export notes', details: error.message },
      { status: 500 }
    )
  }
}
