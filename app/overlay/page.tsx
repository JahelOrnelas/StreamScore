'use client'

import { useEffect, useState } from 'react'
import { MatchState } from '@/app/page'
import { Clock } from 'lucide-react'

export default function OverlayPage() {
  const [matchState, setMatchState] = useState<MatchState>({
    player1Name: 'Jugador 1',
    player2Name: 'Jugador 2',
    player1Flag: '🇦🇷',
    player2Flag: '🇪🇸',
    player1Score: { points: 0, games: 0, sets: 0 },
    player2Score: { points: 0, games: 0, sets: 0 },
    previousSets: [],
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

  useEffect(() => {
    console.log('[v0] Conectando al stream del overlay')
    const eventSource = new EventSource('/api/match-state')

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('[v0] Mensaje recibido:', message.type)
      if (message.type === 'match') {
        // Asegurar que el estado tenga todos los campos necesarios
        const receivedState = message.data
        setMatchState((prev) => ({
          ...prev,
          ...receivedState,
          colors: receivedState.colors || prev.colors || {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            primaryColor: '#3b82f6',
            secondaryColor: '#f59e0b',
            accentColor: '#10b981',
          },
          player1Flag: receivedState.player1Flag ?? prev.player1Flag ?? '',
          player2Flag: receivedState.player2Flag ?? prev.player2Flag ?? '',
          player1PartnerName: receivedState.player1PartnerName ?? prev.player1PartnerName ?? '',
          player2PartnerName: receivedState.player2PartnerName ?? prev.player2PartnerName ?? '',
          player1PartnerFlag: receivedState.player1PartnerFlag ?? prev.player1PartnerFlag ?? '',
          player2PartnerFlag: receivedState.player2PartnerFlag ?? prev.player2PartnerFlag ?? '',
          isDoubles: typeof receivedState.isDoubles === 'boolean' ? receivedState.isDoubles : prev.isDoubles ?? false,
        }))
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

  const getPointDisplay = (player: 1 | 2) => {
    const score = player === 1 ? matchState.player1Score : matchState.player2Score

    if (matchState.isTieBreak || matchState.isSuperTieBreak) {
      return score.points.toString()
    }

    if (matchState.isDeuce) {
      if (matchState.advantage === player) {
        return 'AD'
      } else if (matchState.advantage === null) {
        return '40'
      } else {
        return '40'
      }
    }

    switch (score.points) {
      case 0:
        return '0'
      case 15:
        return '15'
      case 30:
        return '30'
      case 40:
        return '40'
      default:
        return '0'
    }
  }

  const isServing = (player: 1 | 2) => matchState.server === player

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const renderFlag = (flag: string) => {
    if (!flag) {
      return null
    }

    if (flag.startsWith('http://') || flag.startsWith('https://')) {
      return <img src={flag || "/placeholder.svg"} alt="Flag" className="h-10 w-16 rounded object-cover" />
    }
    return <span className="text-4xl">{flag}</span>
  }

  return (
    <div className="flex h-screen items-center justify-center bg-transparent p-8">
      <div
        className="w-full max-w-7xl rounded-xl p-8 shadow-2xl backdrop-blur-sm overflow-hidden"
        style={{
          backgroundColor: `${matchState.colors.backgroundColor}f0`,
          color: matchState.colors.textColor
        }}
      >
        <div className="space-y-6">
          {(matchState.isTieBreak || matchState.isSuperTieBreak || matchState.isBreakPoint) && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              {matchState.isTieBreak && (
                <div
                  className="rounded-lg px-6 py-3 text-lg font-bold uppercase tracking-wider shadow-lg"
                  style={{
                    backgroundColor: matchState.colors.primaryColor,
                    color: '#ffffff'
                  }}
                >
                  Tie Break
                </div>
              )}
              {matchState.isSuperTieBreak && (
                <div
                  className="rounded-lg px-6 py-3 text-lg font-bold uppercase tracking-wider shadow-lg"
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff'
                  }}
                >
                  Súper Tie-Break
                </div>
              )}
              {matchState.isBreakPoint && (
                <div
                  className="animate-pulse rounded-lg px-6 py-3 text-lg font-bold uppercase tracking-wider shadow-lg"
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff'
                  }}
                >
                  Break Point
                </div>
              )}
            </div>
          )}

          <div
            className="mb-6 flex items-center justify-center gap-2 rounded-lg py-3"
            style={{ backgroundColor: `${matchState.colors.secondaryColor}20` }}
          >
            <Clock className="h-6 w-6" style={{ color: matchState.colors.textColor }} />
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: matchState.colors.textColor }}
            >
              {formatTime(matchState.timerSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex min-w-[520px] items-center gap-4">
              <div className="w-10 flex items-center justify-center" title={isServing(1) ? 'Saque' : ''}>
                <div
                  className={`rounded-full h-6 w-6 ${isServing(1) ? '' : 'opacity-0'}`}
                  style={{ backgroundColor: matchState.colors.accentColor }}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-3">
                  {renderFlag(matchState.player1Flag)}
                  <span
                    className="text-4xl font-bold truncate"
                    style={{ color: matchState.colors.textColor }}
                  >
                    {matchState.player1Name}
                  </span>
                </div>
                {matchState.isDoubles && matchState.player1PartnerName && (
                  <div className="flex items-center gap-3 mt-1">
                    {matchState.player1PartnerFlag && renderFlag(matchState.player1PartnerFlag)}
                    <span className="text-4xl font-bold truncate" style={{ color: matchState.colors.textColor }}>
                      {matchState.player1PartnerName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 justify-end">
              {/* Previous Sets */}
              {matchState.previousSets.map((set, index) => (
                <div
                  key={`p1-set-${index}`}
                  className="flex h-20 w-16 items-center justify-center rounded-lg text-3xl font-bold opacity-80"
                  style={{
                    backgroundColor: `${matchState.colors.secondaryColor}20`,
                    color: set.winner === 1 ? matchState.colors.primaryColor : matchState.colors.textColor
                  }}
                >
                  {set.player1}
                </div>
              ))}

              <div
                className="flex h-20 w-24 items-center justify-center rounded-lg text-4xl font-bold"
                style={{
                  backgroundColor: matchState.colors.primaryColor,
                  color: '#ffffff'
                }}
              >
                {matchState.player1Score.sets}
              </div>

              <div
                className="flex h-20 w-24 items-center justify-center rounded-lg text-4xl font-bold"
                style={{
                  backgroundColor: `${matchState.colors.secondaryColor}40`,
                  color: matchState.colors.textColor
                }}
              >
                {matchState.player1Score.games}
              </div>

              <div
                className="flex h-20 w-32 items-center justify-center rounded-lg text-4xl font-bold"
                style={{
                  backgroundColor: `${matchState.colors.secondaryColor}40`,
                  color: matchState.colors.textColor
                }}
              >
                {getPointDisplay(1)}
              </div>
            </div>
          </div>

          <div className="border-t-2" style={{ borderColor: `${matchState.colors.textColor}20` }} />

          <div className="flex items-center gap-6">
            <div className="flex min-w-[520px] items-center gap-4">
              <div className="w-10 flex items-center justify-center" title={isServing(2) ? 'Saque' : ''}>
                <div
                  className={`rounded-full h-6 w-6 ${isServing(2) ? '' : 'opacity-0'}`}
                  style={{ backgroundColor: matchState.colors.accentColor }}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-3">
                  {renderFlag(matchState.player2Flag)}
                  <span
                    className="text-4xl font-bold truncate"
                    style={{ color: matchState.colors.textColor }}
                  >
                    {matchState.player2Name}
                  </span>
                </div>
                {matchState.isDoubles && matchState.player2PartnerName && (
                  <div className="flex items-center gap-3 mt-1">
                    {matchState.player2PartnerFlag && renderFlag(matchState.player2PartnerFlag)}
                    <span className="text-4xl font-bold truncate" style={{ color: matchState.colors.textColor }}>
                      {matchState.player2PartnerName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 justify-end">
              {/* Previous Sets */}
              {matchState.previousSets.map((set, index) => (
                <div
                  key={`p2-set-${index}`}
                  className="flex h-20 w-16 items-center justify-center rounded-lg text-3xl font-bold opacity-80"
                  style={{
                    backgroundColor: `${matchState.colors.secondaryColor}20`,
                    color: set.winner === 2 ? matchState.colors.primaryColor : matchState.colors.textColor
                  }}
                >
                  {set.player2}
                </div>
              ))}

              <div
                className="flex h-20 w-24 items-center justify-center rounded-lg text-4xl font-bold"
                style={{
                  backgroundColor: matchState.colors.primaryColor,
                  color: '#ffffff'
                }}
              >
                {matchState.player2Score.sets}
              </div>

              <div
                className="flex h-20 w-24 items-center justify-center rounded-lg text-4xl font-bold"
                style={{
                  backgroundColor: `${matchState.colors.secondaryColor}40`,
                  color: matchState.colors.textColor
                }}
              >
                {matchState.player2Score.games}
              </div>

              <div
                className="flex h-20 w-32 items-center justify-center rounded-lg text-4xl font-bold"
                style={{
                  backgroundColor: `${matchState.colors.secondaryColor}40`,
                  color: matchState.colors.textColor
                }}
              >
                {getPointDisplay(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
