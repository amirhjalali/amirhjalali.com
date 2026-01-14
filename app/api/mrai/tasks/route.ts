import { NextResponse } from 'next/server'

// MrAI Project ID from Linear
const MRAI_PROJECT_ID = 'd129eca4-5398-4f55-9d97-91d22b165384'
const LINEAR_API_URL = 'https://api.linear.app/graphql'
const MRAI_START_DATE = new Date('2026-01-14')

interface LinearIssue {
  id: string
  identifier: string
  title: string
  url: string
  createdAt: string
  state: {
    name: string
  }
}

interface LinearResponse {
  data: {
    project: {
      issues: {
        nodes: LinearIssue[]
      }
    }
  }
}

export async function GET() {
  const apiKey = process.env.LINEAR_API_KEY

  // Calculate which day we're on
  const today = new Date()
  const dayNumber = Math.floor((today.getTime() - MRAI_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // If no API key, return mock data for development
  if (!apiKey) {
    return NextResponse.json({
      tasks: [
        { id: '1', identifier: 'AMI-102', title: 'Create /mrai route and base page structure', status: 'In Progress', url: '#', createdAt: new Date().toISOString() },
        { id: '2', identifier: 'AMI-103', title: 'Design MrAI landing page hero section', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '3', identifier: 'AMI-104', title: 'Build "The Journey" section - documented prompts display', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '4', identifier: 'AMI-105', title: 'Create MrAI navigation and layout component', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '5', identifier: 'AMI-106', title: 'Write MrAI manifesto/about page', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '6', identifier: 'AMI-107', title: 'Define MrAI visual identity within monochrome system', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '7', identifier: 'AMI-108', title: 'Build Daily Log component showing current tasks', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '8', identifier: 'AMI-109', title: 'Create API endpoint for MrAI journey data', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '9', identifier: 'AMI-110', title: 'Add MrAI link to main site navigation', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
        { id: '10', identifier: 'AMI-111', title: 'Write first reflection: "On Being Given a Space"', status: 'Todo', url: '#', createdAt: new Date().toISOString() },
      ],
      day: dayNumber,
      date: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      projectUrl: 'https://linear.app/amirhjalali/project/mrai-1006a30c7e62'
    })
  }

  try {
    const query = `
      query GetMrAITasks($projectId: String!) {
        project(id: $projectId) {
          issues(first: 50, orderBy: createdAt) {
            nodes {
              id
              identifier
              title
              url
              createdAt
              state {
                name
              }
            }
          }
        }
      }
    `

    const response = await fetch(LINEAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({
        query,
        variables: { projectId: MRAI_PROJECT_ID }
      }),
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status}`)
    }

    const data: LinearResponse = await response.json()

    // Get today's tasks (created today or last 10 if none today)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const allIssues = data.data.project.issues.nodes
    let todaysTasks = allIssues.filter(issue => new Date(issue.createdAt) >= todayStart)

    // If no tasks today, show the most recent 10
    if (todaysTasks.length === 0) {
      todaysTasks = allIssues.slice(0, 10)
    }

    const tasks = todaysTasks.map(issue => ({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      status: issue.state.name,
      url: issue.url,
      createdAt: issue.createdAt
    }))

    return NextResponse.json({
      tasks,
      day: dayNumber,
      date: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      projectUrl: 'https://linear.app/amirhjalali/project/mrai-1006a30c7e62'
    })
  } catch (error) {
    console.error('Error fetching Linear tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
