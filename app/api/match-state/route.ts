let currentMatchState: any = null
let currentLowerThirdState: any = null

const clients = new Set<ReadableStreamDefaultController>()

export async function GET() {
  let controllerRef: ReadableStreamDefaultController | null = null
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('[v0] Cliente conectado al stream')
      controllerRef = controller
      clients.add(controller)
      
      // Enviar estado inicial
      if (currentMatchState) {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'match', data: currentMatchState })}\n\n`)
        } catch (error) {
          console.log('[v0] Error enviando estado inicial:', error)
          clients.delete(controller)
          controllerRef = null
        }
      }
      if (currentLowerThirdState) {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'lowerThird', data: currentLowerThirdState })}\n\n`)
        } catch (error) {
          console.log('[v0] Error enviando estado inicial:', error)
          clients.delete(controller)
          controllerRef = null
        }
      }
    },
    cancel() {
      console.log('[v0] Cliente desconectado del stream')
      if (controllerRef) {
        clients.delete(controllerRef)
        controllerRef = null
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  console.log('[v0] Estado recibido:', body.type)
  
  if (body.type === 'match') {
    currentMatchState = body.data
  } else if (body.type === 'lowerThird') {
    currentLowerThirdState = body.data
  }

  // Notificar a todos los clientes
  const message = `data: ${JSON.stringify(body)}\n\n`
  const controllersToRemove: ReadableStreamDefaultController[] = []
  
  clients.forEach((controller) => {
    try {
      // Verificar si el controller está cerrado intentando enviar
      controller.enqueue(message)
    } catch (error) {
      console.log('[v0] Error enviando a cliente (controller cerrado):', error)
      controllersToRemove.push(controller)
    }
  })

  // Eliminar controllers cerrados del Set
  controllersToRemove.forEach((controller) => {
    clients.delete(controller)
  })

  return Response.json({ success: true })
}
