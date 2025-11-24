'use client'

import type { LowerThirdState, TeamInfo } from '@/components/lower-third-control'

type Props = LowerThirdState

export function LowerThird(props: Props) {
  if (!props.visible) return null

  const { style, colors } = props

  const renderFlag = (flag?: string) => {
    if (!flag) return null
    if (flag.startsWith('http://') || flag.startsWith('https://')) {
      return <img src={flag} alt="flag" className="h-6 w-10 rounded object-cover" />
    }
    return <span className="text-2xl">{flag}</span>
  }

  // Render match lower-third
  if (style === 'match') {
    const team1: TeamInfo = (props as any).team1 || {}
    const team2: TeamInfo = (props as any).team2 || {}
    const isDoubles = Boolean((props as any).isDoubles)

    return (
      <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl px-8">
          <div
            className="rounded-lg shadow-2xl px-6 py-4 bg-opacity-95 pointer-events-auto"
            style={{ backgroundColor: colors.backgroundColor, color: colors.textColor }}
          >
            <div className="flex items-center justify-between">
              {/* Team 1: left-to-right */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-3">
                    {renderFlag(team1.playerAFlag)}
                    <span className="font-bold text-xl truncate">{team1.playerAName}</span>
                  </div>
                  {isDoubles && team1.playerBName && (
                    <div className="flex items-center gap-3 mt-1">
                      {renderFlag(team1.playerBFlag)}
                      <span className="font-bold text-xl truncate">{team1.playerBName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center label */}
              <div className="flex-shrink-0 px-6">
                <span className="text-lg font-semibold">PRÓXIMO ENFRENTAMIENTO</span>
              </div>

              {/* Team 2: right-to-left */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col items-end truncate">
                  <div className="flex items-center gap-3 justify-end">
                    <span className="font-bold text-xl truncate">{team2.playerAName}</span>
                    {renderFlag(team2.playerAFlag)}
                  </div>
                  {isDoubles && team2.playerBName && (
                    <div className="flex items-center gap-3 mt-1 justify-end">
                      <span className="font-bold text-xl truncate">{team2.playerBName}</span>
                      {renderFlag(team2.playerBFlag)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default simple lower-third (player/commentator/custom)
  return (
    <div className="fixed bottom-20 left-8 animate-in slide-in-from-left duration-500">
      <div
        className="rounded-r-lg shadow-2xl"
        style={{ backgroundColor: colors.backgroundColor }}
      >
        <div className="px-8 py-4">
          <h2
            className="text-2xl font-bold leading-tight"
            style={{ color: colors.textColor }}
          >
            {props.title}
          </h2>
          <p
            className="mt-1 text-lg leading-tight"
            style={{ color: colors.textColor, opacity: 0.9 }}
          >
            {props.subtitle}
          </p>
        </div>
      </div>
      <div
        className="h-1"
        style={{ backgroundColor: colors.backgroundColor }}
      />
    </div>
  )
}
