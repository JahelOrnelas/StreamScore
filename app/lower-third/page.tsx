'use client'

import { useState, useEffect } from 'react'
import { LowerThird } from '@/components/lower-third'
import type { LowerThirdState } from '@/components/lower-third-control'

export default function LowerThirdPage() {
  const [lowerThirdState, setLowerThirdState] = useState<LowerThirdState>({
    title: '',
    subtitle: '',
    visible: false,
    style: 'player',
    colors: {
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
    },
  })

  useEffect(() => {
    console.log('[v0] Conectando al stream de plecas')
    const eventSource = new EventSource('/api/match-state')

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('[v0] Mensaje recibido:', message.type)
      if (message.type === 'lowerThird') {
        setLowerThirdState(message.data)
      }
    }

    eventSource.onerror = (error) => {
      console.error('[v0] Error en stream:', error)
    }

    return () => {
      console.log('[v0] Desconectando stream')
      eventSource.close()
    }
  }, [])

  return (
    <div className="h-screen w-screen bg-transparent">
      <LowerThird {...lowerThirdState} />
    </div>
  )
}
