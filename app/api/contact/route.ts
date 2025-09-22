import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  projectType: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // In a production environment, you would send the email here using a service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - NodeMailer with SMTP

    // For now, we'll create a formatted message that could be sent
    const emailContent = `
      New Contact Form Submission

      From: ${data.name}
      Email: ${data.email}
      Project Type: ${data.projectType || 'Not specified'}
      Subject: ${data.subject}

      Message:
      ${data.message}

      ---
      Sent from amirhjalali.com contact form
    `

    // Log the contact form submission (in production, save to database or send email)
    console.log('Contact form submission:', emailContent)

    // If you have email service configured, uncomment and modify:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'contact@amirhjalali.com',
      to: 'amirhjalali@gmail.com',
      subject: `Contact Form: ${data.subject}`,
      text: emailContent,
      reply_to: data.email
    })
    */

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! I will get back to you soon.'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}