import { ProgressEvent } from './types'

/**
 * Server-Sent Events (SSE) helper for streaming progress updates
 */
export class SSEStream {
  private encoder = new TextEncoder()

  /**
   * Send a progress event to the client
   */
  sendEvent(controller: ReadableStreamDefaultController, event: ProgressEvent) {
    const data = `data: ${JSON.stringify(event)}\n\n`
    controller.enqueue(this.encoder.encode(data))
  }

  /**
   * Send completion signal and close the stream
   */
  sendComplete(controller: ReadableStreamDefaultController) {
    controller.enqueue(this.encoder.encode('data: [DONE]\n\n'))
    controller.close()
  }

  /**
   * Send an error event and optionally close the stream
   */
  sendError(
    controller: ReadableStreamDefaultController,
    error: string,
    close = true
  ) {
    const errorEvent: ProgressEvent = {
      step: 'error',
      progress: 0,
      message: 'Generation failed',
      error,
    }
    this.sendEvent(controller, errorEvent)
    if (close) {
      controller.close()
    }
  }

  /**
   * Send a keep-alive ping to prevent timeout
   */
  sendKeepAlive(controller: ReadableStreamDefaultController) {
    controller.enqueue(this.encoder.encode(': keep-alive\n\n'))
  }
}

/**
 * Create a ReadableStream for SSE responses
 */
export function createSSEStream(
  handler: (stream: SSEStream, controller: ReadableStreamDefaultController) => Promise<void>
): ReadableStream {
  const stream = new SSEStream()

  return new ReadableStream({
    async start(controller) {
      try {
        await handler(stream, controller)
      } catch (error: any) {
        console.error('SSE stream error:', error)
        stream.sendError(controller, error.message)
      }
    },
  })
}
