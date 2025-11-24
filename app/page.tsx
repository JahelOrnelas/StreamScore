'use client'

import { useState, useEffect } from 'react'
import { TennisScoreboard } from '@/components/tennis-scoreboard'
import { ControlPanel } from '@/components/control-panel'
import { LowerThirdControl } from '@/components/lower-third-control'
import type { LowerThirdState } from '@/components/lower-third-control'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'

export type TennisScore = {
  points: number
  games: number
  sets: number
}

export type SetResult = {
  player1: number
  player2: number
  winner: 1 | 2 | null
}

export type MatchState = {
  player1Name: string
  player2Name: string
  player1PartnerName?: string
  player2PartnerName?: string
  player1Flag: string
  player2Flag: string
  player1PartnerFlag?: string
  player2PartnerFlag?: string
  player1Score: TennisScore
  player2Score: TennisScore
  previousSets: SetResult[]
  isDoubles?: boolean
  server: 1 | 2
  isDeuce: boolean
  advantage: 1 | 2 | null
  timerSeconds: number
  timerRunning: boolean
  isTieBreak: boolean
  isSuperTieBreak: boolean
  isBreakPoint: boolean
  colors: {
    backgroundColor: string
    textColor: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
}

export default function Home() {
  const [matchState, setMatchState] = useState<MatchState>({
    player1Name: 'Jugador 1',
    player2Name: 'Jugador 2',
    player1PartnerName: '',
    player2PartnerName: '',
    player1Flag: '🇦🇷',
    player2Flag: '🇪🇸',
    player1PartnerFlag: '',
    player2PartnerFlag: '',
    player1Score: { points: 0, games: 0, sets: 0 },
    player2Score: { points: 0, games: 0, sets: 0 },
    previousSets: [],
    isDoubles: false,
    server: 1,
    isDeuce: false,
    advantage: null,
    timerSeconds: 0,
    timerRunning: false,
    isTieBreak: false,
    isSuperTieBreak: false,
    isBreakPoint: false,
    colors: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      primaryColor: '#3b82f6',
      secondaryColor: '#f59e0b',
      accentColor: '#10b981',
    },
  })

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

  const [overlayUrl, setOverlayUrl] = useState('')
  const [lowerThirdUrl, setLowerThirdUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedLT, setCopiedLT] = useState(false)

  useEffect(() => {
    setOverlayUrl(`${window.location.origin}/overlay`)
    setLowerThirdUrl(`${window.location.origin}/lower-third`)
  }, [])

  useEffect(() => {
    console.log('[v0] Enviando estado del partido')
    fetch('/api/match-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'match', data: matchState }),
    }).catch(err => console.error('[v0] Error enviando estado:', err))
  }, [matchState])

  useEffect(() => {
    console.log('[v0] Enviando estado de plecas')
    fetch('/api/match-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'lowerThird', data: lowerThirdState }),
    }).catch(err => console.error('[v0] Error enviando plecas:', err))
  }, [lowerThirdState])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLowerThirdToClipboard = () => {
    navigator.clipboard.writeText(lowerThirdUrl)
    setCopiedLT(true)
    setTimeout(() => setCopiedLT(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Marcador de Tenis para OBS
          </h1>
          <p className="text-pretty text-muted-foreground">
            Usa el panel de control para gestionar el marcador. Copia el enlace del overlay para agregarlo en OBS.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-card-foreground">
            URL del Overlay para OBS
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Copia este enlace y agrégalo como "Navegador" en OBS con fondo transparente
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={overlayUrl}
              readOnly
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            <Button onClick={() => window.open('/overlay', '_blank')} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-card-foreground">
            URL del Lower Third para OBS
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Copia este enlace para agregar las plecas como una fuente separada en OBS
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={lowerThirdUrl}
              readOnly
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
            <Button onClick={copyLowerThirdToClipboard} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              {copiedLT ? 'Copiado!' : 'Copiar'}
            </Button>
            <Button onClick={() => window.open('/lower-third', '_blank')} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir
            </Button>
          </div>
        </div>

        <TennisScoreboard matchState={matchState} />

        <LowerThirdControl
          lowerThirdState={lowerThirdState}
          setLowerThirdState={setLowerThirdState}
        />

        <ControlPanel matchState={matchState} setMatchState={setMatchState} />
      </div>
    </div>
  )
}
