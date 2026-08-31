import { NextRequest } from 'next/server'
import { realtimeHub, type RealtimeEvent } from '@/lib/realtime-hub'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const encoder = new TextEncoder()

  let unsubscribe: (() => void) | null = null
  let pingInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      // Enviar evento de conexão inicial imediata
      const initial = `data: ${JSON.stringify({
        type: 'connected',
        obraSlug: slug,
        timestamp: new Date().toISOString(),
        message: 'Conectado ao canal em tempo real do canteiro de obras',
      })}\n\n`
      controller.enqueue(encoder.encode(initial))

      // Registrar ouvinte no hub de eventos
      unsubscribe = realtimeHub.subscribe(slug, (event: RealtimeEvent) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch {
          // Conexão encerrada
        }
      })

      // Ping a cada 20 segundos
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`))
        } catch {
          if (pingInterval) clearInterval(pingInterval)
        }
      }, 20000)
    },
    cancel() {
      if (unsubscribe) unsubscribe()
      if (pingInterval) clearInterval(pingInterval)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
