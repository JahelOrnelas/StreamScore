import { MatchState } from '@/app/page'
import { Clock } from 'lucide-react'

interface TennisScoreboardProps {
  matchState: MatchState
}

export function TennisScoreboard({ matchState }: TennisScoreboardProps) {
  const colors = matchState.colors || {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
  }

  const getPointDisplay = (player: 1 | 2) => {
    const score = player === 1 ? matchState.player1Score : matchState.player2Score

    if (matchState.isSuperTieBreak || matchState.isTieBreak) {
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
      return <img src={flag || "/placeholder.svg"} alt="Flag" className="h-8 w-12 rounded object-cover" />
    }
    return <span className="text-3xl">{flag}</span>
  }

  return (
    <div
      className="rounded-lg p-6 shadow-lg"
      style={{
        backgroundColor: colors.backgroundColor,
        color: colors.textColor
      }}
    >
      {(matchState.isTieBreak || matchState.isSuperTieBreak || matchState.isBreakPoint) && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {matchState.isTieBreak && (
            <div
              className="rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide"
              style={{
                backgroundColor: colors.primaryColor,
                color: '#ffffff'
              }}
            >
              Tie Break
            </div>
          )}
          {matchState.isSuperTieBreak && (
            <div
              className="rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide"
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
              className="animate-pulse rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide"
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
      {/* </CHANGE> */}

      <div
        className="mb-4 flex items-center justify-center gap-2 rounded-md py-2"
        style={{ backgroundColor: `${colors.secondaryColor}20` }}
      >
        <Clock className="h-5 w-5" style={{ color: colors.textColor }} />
        <span className="text-xl font-bold tabular-nums" style={{ color: colors.textColor }}>
          {formatTime(matchState.timerSeconds)}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex min-w-[380px] items-center gap-3">
            <div className="w-8 flex items-center justify-center" title={isServing(1) ? 'Saque' : ''}>
              <div className={`rounded-full h-5 w-5 ${isServing(1) ? '' : 'opacity-0'}`} style={{ backgroundColor: colors.accentColor }} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                {renderFlag(matchState.player1Flag)}
                <span className="text-2xl font-bold truncate" style={{ color: colors.textColor }}>
                  {matchState.player1Name}
                </span>
              </div>
              {matchState.isDoubles && matchState.player1PartnerName && (
                <div className="flex items-center gap-2 mt-1">
                  {matchState.player1PartnerFlag && renderFlag(matchState.player1PartnerFlag)}
                  <span className="text-2xl font-bold truncate" style={{ color: colors.textColor }}>
                    {matchState.player1PartnerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 justify-end">
            {/* Previous Sets */}
            {matchState.previousSets.map((set, index) => (
              <div
                key={`p1-set-${index}`}
                className="flex h-16 w-12 items-center justify-center rounded-md text-2xl font-bold opacity-80"
                style={{
                  backgroundColor: `${colors.secondaryColor}20`,
                  color: set.winner === 1 ? colors.primaryColor : colors.textColor
                }}
              >
                {set.player1}
              </div>
            ))}

            {/* Sets */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-md text-3xl font-bold"
              style={{
                backgroundColor: colors.primaryColor,
                color: '#ffffff'
              }}
            >
              {matchState.player1Score.sets}
            </div>

            {/* Games */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-md text-3xl font-bold"
              style={{
                backgroundColor: `${colors.secondaryColor}40`,
                color: colors.textColor
              }}
            >
              {matchState.player1Score.games}
            </div>

            {/* Points */}
            <div
              className="flex h-16 w-20 items-center justify-center rounded-md text-3xl font-bold"
              style={{
                backgroundColor: `${colors.secondaryColor}40`,
                color: colors.textColor
              }}
            >
              {getPointDisplay(1)}
            </div>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: `${colors.textColor}20` }} />

        <div className="flex items-center gap-4">
          <div className="flex min-w-[380px] items-center gap-3">
            <div className="w-8 flex items-center justify-center" title={isServing(2) ? 'Saque' : ''}>
              <div className={`rounded-full h-5 w-5 ${isServing(2) ? '' : 'opacity-0'}`} style={{ backgroundColor: colors.accentColor }} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                {renderFlag(matchState.player2Flag)}
                <span className="text-2xl font-bold truncate" style={{ color: colors.textColor }}>
                  {matchState.player2Name}
                </span>
              </div>
              {matchState.isDoubles && matchState.player2PartnerName && (
                <div className="flex items-center gap-2 mt-1">
                  {matchState.player2PartnerFlag && renderFlag(matchState.player2PartnerFlag)}
                  <span className="text-2xl font-bold truncate" style={{ color: colors.textColor }}>
                    {matchState.player2PartnerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 justify-end">
            {/* Previous Sets */}
            {matchState.previousSets.map((set, index) => (
              <div
                key={`p2-set-${index}`}
                className="flex h-16 w-12 items-center justify-center rounded-md text-2xl font-bold opacity-80"
                style={{
                  backgroundColor: `${colors.secondaryColor}20`,
                  color: set.winner === 2 ? colors.primaryColor : colors.textColor
                }}
              >
                {set.player2}
              </div>
            ))}

            {/* Sets */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-md text-3xl font-bold"
              style={{
                backgroundColor: colors.primaryColor,
                color: '#ffffff'
              }}
            >
              {matchState.player2Score.sets}
            </div>

            {/* Games */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-md text-3xl font-bold"
              style={{
                backgroundColor: `${colors.secondaryColor}40`,
                color: colors.textColor
              }}
            >
              {matchState.player2Score.games}
            </div>

            {/* Points */}
            <div
              className="flex h-16 w-20 items-center justify-center rounded-md text-3xl font-bold"
              style={{
                backgroundColor: `${colors.secondaryColor}40`,
                color: colors.textColor
              }}
            >
              {getPointDisplay(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
