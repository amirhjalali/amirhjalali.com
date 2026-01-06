import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getKnowledgeGraphData } from '@/lib/knowledge-graph-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const graphData = await getKnowledgeGraphData()

    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Failed to get knowledge graph:', error)
    return NextResponse.json(
      { error: 'Failed to get knowledge graph' },
      { status: 500 }
    )
  }
}
