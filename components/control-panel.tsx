import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchState } from '@/app/page'
import { Minus, Plus, RotateCcw, Play, Pause, Timer, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ControlPanelProps {
  matchState: MatchState
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>
}

export function ControlPanel({ matchState, setMatchState }: ControlPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const updateState = (updater: (prev: MatchState) => MatchState) => {
    setMatchState((prev) => {
      const newState = updater(prev)
      localStorage.setItem('tennis-match-state', JSON.stringify(newState))
      return newState
    })
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (matchState.timerRunning) {
      interval = setInterval(() => {
        updateState((prev) => ({
          ...prev,
          timerSeconds: prev.timerSeconds + 1,
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [matchState.timerRunning])

  const toggleTimer = () => {
    updateState((prev) => ({
      ...prev,
      timerRunning: !prev.timerRunning,
    }))
  }

  const resetTimer = () => {
    updateState((prev) => ({
      ...prev,
      timerSeconds: 0,
      timerRunning: false,
    }))
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const cloneScores = (state: MatchState) => ({
    ...state,
    player1Score: { ...state.player1Score },
    player2Score: { ...state.player2Score },
    previousSets: [...state.previousSets],
  })

  const normalizePoints = (state: MatchState, resetOnly = false) => {
    const cloned = cloneScores(state)
    cloned.player1Score.points = resetOnly ? 0 : cloned.player1Score.points
    cloned.player2Score.points = resetOnly ? 0 : cloned.player2Score.points
    return cloned
  }

  const completeSet = (
    state: MatchState,
    winnerScore: MatchState['player1Score'],
    loserScore: MatchState['player1Score']
  ) => {
    // Agregar el set actual al historial
    state.previousSets.push({
      player1: state.player1Score.games,
      player2: state.player2Score.games,
      winner: state.player1Score.games > state.player2Score.games ? 1 : 2
    })

    winnerScore.sets++
    winnerScore.games = 0
    loserScore.games = 0
    winnerScore.points = 0
    loserScore.points = 0
    state.isDeuce = false
    state.advantage = null
  }

  const completeGame = (
    state: MatchState,
    winnerScore: MatchState['player1Score'],
    loserScore: MatchState['player1Score']
  ) => {
    winnerScore.games++
    winnerScore.points = 0
    loserScore.points = 0
    state.isDeuce = false
    state.advantage = null

    if (winnerScore.games >= 6 && winnerScore.games - loserScore.games >= 2) {
      completeSet(state, winnerScore, loserScore)
    }
  }

  const toggleTieBreak = () => {
    updateState((prev) => {
      const nextIsTieBreak = !prev.isTieBreak
      const baseState = normalizePoints(prev, true)

      return {
        ...baseState,
        isTieBreak: nextIsTieBreak,
        isSuperTieBreak: nextIsTieBreak ? false : prev.isSuperTieBreak,
        isDeuce: false,
        advantage: null,
      }
    })
  }

  const toggleSuperTieBreak = () => {
    updateState((prev) => {
      const nextIsSuperTieBreak = !prev.isSuperTieBreak
      const baseState = normalizePoints(prev, true)

      return {
        ...baseState,
        isSuperTieBreak: nextIsSuperTieBreak,
        isTieBreak: nextIsSuperTieBreak ? false : prev.isTieBreak,
        isDeuce: false,
        advantage: null,
      }
    })
  }

  const calculateBreakPoint = (state: MatchState): boolean => {
    if (state.isTieBreak || state.isSuperTieBreak) return false

    const server = state.server
    const receiver = server === 1 ? 2 : 1
    const serverScore = server === 1 ? state.player1Score : state.player2Score
    const receiverScore = server === 1 ? state.player2Score : state.player1Score

    if (state.isDeuce) {
      return state.advantage === receiver
    }

    // En dobles sin ventaja (No-Ad), 40-40 es punto decisivo (Break Point)
    if (state.isDoubles && state.player1Score.points === 40 && state.player2Score.points === 40) {
      return true
    }

    // Puntuación normal: Receptor tiene 40 y Servidor tiene menos de 40
    if (receiverScore.points === 40 && serverScore.points < 40) {
      return true
    }

    return false
  }

  const addPoint = (player: 1 | 2) => {
    updateState((prev) => {
      const newState = cloneScores(prev)
      const playerScore = player === 1 ? newState.player1Score : newState.player2Score
      const opponentScore = player === 1 ? newState.player2Score : newState.player1Score

      // Modos especiales primero
      if (newState.isSuperTieBreak) {
        playerScore.points = (typeof playerScore.points === 'number' ? playerScore.points : 0) + 1
        if (playerScore.points >= 10 && playerScore.points - opponentScore.points >= 2) {
          completeSet(newState, playerScore, opponentScore)
          newState.isSuperTieBreak = false
        }
        newState.isBreakPoint = false // No break points in tie break
        return newState
      }

      if (newState.isTieBreak) {
        playerScore.points = (typeof playerScore.points === 'number' ? playerScore.points : 0) + 1
        if (playerScore.points >= 7 && playerScore.points - opponentScore.points >= 2) {
          completeSet(newState, playerScore, opponentScore)
          newState.isTieBreak = false
        }
        newState.isBreakPoint = false // No break points in tie break
        return newState
      }

      // Manejo de deuce y ventaja
      if (newState.isDeuce) {
        if (newState.advantage === player) {
          completeGame(newState, playerScore, opponentScore)
          newState.isBreakPoint = false
          return newState
        } else if (newState.advantage !== null && newState.advantage !== player) {
          // El oponente tiene ventaja, vuelve a deuce
          newState.advantage = null
          newState.isBreakPoint = calculateBreakPoint(newState)
          return newState
        } else {
          // Están en deuce sin ventaja, este jugador toma ventaja
          newState.advantage = player
          newState.isBreakPoint = calculateBreakPoint(newState)
          return newState
        }
      }

      // Progresión normal de puntos: 0 -> 15 -> 30 -> 40
      const currentPoints = playerScore.points

      if (currentPoints === 0) {
        playerScore.points = 15
        newState.isBreakPoint = calculateBreakPoint(newState)
        return newState
      }

      if (currentPoints === 15) {
        playerScore.points = 30
        newState.isBreakPoint = calculateBreakPoint(newState)
        return newState
      }

      if (currentPoints === 30) {
        playerScore.points = 40
        newState.isBreakPoint = calculateBreakPoint(newState)
        return newState
      }

      if (currentPoints === 40) {
        // El jugador tiene 40, verificar situación del oponente
        if (opponentScore.points === 40) {
          // Ambos tienen 40
          if (newState.isDoubles) {
            // En dobles: el siguiente punto gana el juego (no hay ventaja)
            completeGame(newState, playerScore, opponentScore)
            newState.isBreakPoint = false
          } else {
            // En singles: ir a deuce
            newState.isDeuce = true
            newState.advantage = null
            newState.isBreakPoint = calculateBreakPoint(newState)
          }
        } else {
          // El oponente tiene menos de 40, este jugador gana el juego
          completeGame(newState, playerScore, opponentScore)
          newState.isBreakPoint = false
        }
        return newState
      }

      return newState
    })
  }

  const removePoint = (player: 1 | 2) => {
    updateState((prev) => {
      const newState = cloneScores(prev)
      const playerScore = player === 1 ? newState.player1Score : newState.player2Score

      if (newState.isSuperTieBreak || newState.isTieBreak) {
        playerScore.points = Math.max(0, playerScore.points - 1)
        newState.isBreakPoint = false
        return newState
      }

      if (newState.isDeuce && newState.advantage === player) {
        newState.advantage = null
        newState.isBreakPoint = calculateBreakPoint(newState)
        return newState
      }

      if (newState.isDeuce && newState.advantage !== null && newState.advantage !== player) {
        newState.advantage = player === 1 ? 2 : 1
        newState.isBreakPoint = calculateBreakPoint(newState)
        return newState
      }

      if (playerScore.points === 15) {
        playerScore.points = 0
      } else if (playerScore.points === 30) {
        playerScore.points = 15
      } else if (playerScore.points === 40) {
        playerScore.points = 30
        newState.isDeuce = false
        newState.advantage = null
      }

      newState.isBreakPoint = calculateBreakPoint(newState)
      return newState
    })
  }

  const adjustGames = (player: 1 | 2, delta: number) => {
    updateState((prev) => {
      const newState = cloneScores(prev)
      const playerScore = player === 1 ? newState.player1Score : newState.player2Score
      playerScore.games = Math.max(0, playerScore.games + delta)
      return newState
    })
  }

  const adjustSets = (player: 1 | 2, delta: number) => {
    updateState((prev) => {
      const newState = cloneScores(prev)
      const playerScore = player === 1 ? newState.player1Score : newState.player2Score
      playerScore.sets = Math.max(0, playerScore.sets + delta)
      return newState
    })
  }

  const toggleServer = () => {
    updateState((prev) => {
      const newState = cloneScores(prev)
      newState.server = prev.server === 1 ? 2 : 1
      newState.isBreakPoint = calculateBreakPoint(newState)
      return newState
    })
  }

  const resetMatch = () => {
    updateState((prev) => {
      const newState: MatchState = {
        player1Name: prev.player1Name,
        player2Name: prev.player2Name,
        player1Flag: prev.player1Flag || '',
        player2Flag: prev.player2Flag || '',
        player1Score: { points: 0, games: 0, sets: 0 },
        player2Score: { points: 0, games: 0, sets: 0 },
        previousSets: [],
        server: 1,
        isDeuce: false,
        advantage: null,
        timerSeconds: prev.timerSeconds,
        timerRunning: prev.timerRunning,
        isTieBreak: false,
        isSuperTieBreak: false,
        isBreakPoint: false,
        colors: prev.colors || {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          primaryColor: '#3b82f6',
          secondaryColor: '#f59e0b',
          accentColor: '#10b981',
        },
      }
      return newState
    })
  }

  const updatePlayerName = (player: 1 | 2, name: string) => {
    updateState((prev) => ({
      ...prev,
      [player === 1 ? 'player1Name' : 'player2Name']: name,
    }))
  }

  const updatePlayerFlag = (player: 1 | 2, flag: string) => {
    updateState((prev) => ({
      ...prev,
      [player === 1 ? 'player1Flag' : 'player2Flag']: flag,
    }))
  }

  const updateColor = (colorKey: keyof MatchState['colors'], value: string) => {
    updateState((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  useEffect(() => {
    const savedState = localStorage.getItem('tennis-match-state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setMatchState((prev) => ({
          ...prev,
          ...parsed,
          colors: parsed.colors || prev.colors,
        }))
      } catch (e) {
        console.error('Error parsing saved match state', e)
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel de Control</CardTitle>
        <CardDescription>
          Gestiona todos los aspectos del marcador del partido
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Temporizador del Partido</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-16 flex-1 items-center justify-center rounded-lg bg-muted text-3xl font-bold tabular-nums text-foreground">
              {formatTime(matchState.timerSeconds)}
            </div>
            <Button
              onClick={toggleTimer}
              size="lg"
              variant={matchState.timerRunning ? 'secondary' : 'default'}
            >
              {matchState.timerRunning ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar
                </>
              )}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <Timer className="mr-2 h-5 w-5" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Indicadores Especiales */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Indicadores Especiales</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              onClick={toggleTieBreak}
              variant={matchState.isTieBreak ? 'default' : 'outline'}
              size="lg"
              className="h-auto flex-col gap-1 py-4"
            >
              <span className="text-lg font-bold">Tie Break</span>
              <span className="text-xs opacity-80">
                {matchState.isTieBreak ? 'Activado' : 'Desactivado'}
              </span>
            </Button>

            <Button
              onClick={toggleSuperTieBreak}
              variant={matchState.isSuperTieBreak ? 'default' : 'outline'}
              size="lg"
              className="h-auto flex-col gap-1 py-4"
            >
              <span className="text-lg font-bold">Súper Tie-Break</span>
              <span className="text-xs opacity-80">
                {matchState.isSuperTieBreak ? 'Activado' : 'Desactivado'}
              </span>
            </Button>

            <Button
              onClick={() => updateState((prev) => ({ ...prev, isBreakPoint: !prev.isBreakPoint }))}
              variant={matchState.isBreakPoint ? 'destructive' : 'outline'}
              size="lg"
              className="h-auto flex-col gap-1 py-4"
            >
              <span className="text-lg font-bold">Break Point</span>
              <span className="text-xs opacity-80">
                {matchState.isBreakPoint ? 'Activado' : 'Desactivado'}
              </span>
            </Button>
          </div>
        </div>

        {/* Personalización de Colores */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Personalización de Colores</h3>
            <Button
              onClick={() => setShowColorPicker(!showColorPicker)}
              variant="outline"
              size="sm"
            >
              <Palette className="mr-2 h-4 w-4" />
              {showColorPicker ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          {showColorPicker && (
            <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Color de Fondo</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={matchState.colors?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateColor('backgroundColor', e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={matchState.colors?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateColor('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-color">Color de Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={matchState.colors?.textColor || '#000000'}
                    onChange={(e) => updateColor('textColor', e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={matchState.colors?.textColor || '#000000'}
                    onChange={(e) => updateColor('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color">Color Primario (Sets)</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={matchState.colors?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateColor('primaryColor', e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={matchState.colors?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateColor('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Color Secundario (Juegos/Puntos)</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={matchState.colors?.secondaryColor || '#f59e0b'}
                    onChange={(e) => updateColor('secondaryColor', e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={matchState.colors?.secondaryColor || '#f59e0b'}
                    onChange={(e) => updateColor('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Color de Acento (Indicador Saque)</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={matchState.colors?.accentColor || '#10b981'}
                    onChange={(e) => updateColor('accentColor', e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={matchState.colors?.accentColor || '#10b981'}
                    onChange={(e) => updateColor('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información de Jugadores */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Información de Jugadores</h3>
          <div className="mb-3">
            <Button
              onClick={() => updateState((prev) => ({ ...prev, isDoubles: !prev.isDoubles }))}
              variant={matchState.isDoubles ? 'default' : 'outline'}
              size="sm"
            >
              {matchState.isDoubles ? 'Modo Dobles' : 'Modo Singles'}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="player1">Jugador 1</Label>
                <Input
                  id="player1"
                  value={matchState.player1Name || ''}
                  onChange={(e) => updatePlayerName(1, e.target.value)}
                  placeholder="Nombre del jugador 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag1">Bandera (emoji o URL)</Label>
                <Input
                  id="flag1"
                  value={matchState.player1Flag || ''}
                  onChange={(e) => updatePlayerFlag(1, e.target.value)}
                  placeholder="🇦🇷 o https://..."
                />
              </div>
              {matchState.isDoubles && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="player1partner">Pareja Jugador 1</Label>
                    <Input
                      id="player1partner"
                      value={matchState.player1PartnerName || ''}
                      onChange={(e) => updateState((prev) => ({ ...prev, player1PartnerName: e.target.value }))}
                      placeholder="Nombre de la pareja"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flag1partner">Bandera Pareja (emoji o URL)</Label>
                    <Input
                      id="flag1partner"
                      value={matchState.player1PartnerFlag || ''}
                      onChange={(e) => updateState((prev) => ({ ...prev, player1PartnerFlag: e.target.value }))}
                      placeholder="🇺🇸 o https://..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="player2">Jugador 2</Label>
                <Input
                  id="player2"
                  value={matchState.player2Name || ''}
                  onChange={(e) => updatePlayerName(2, e.target.value)}
                  placeholder="Nombre del jugador 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag2">Bandera (emoji o URL)</Label>
                <Input
                  id="flag2"
                  value={matchState.player2Flag || ''}
                  onChange={(e) => updatePlayerFlag(2, e.target.value)}
                  placeholder="🇪🇸 o https://..."
                />
              </div>
              {matchState.isDoubles && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="player2partner">Pareja Jugador 2</Label>
                    <Input
                      id="player2partner"
                      value={matchState.player2PartnerName || ''}
                      onChange={(e) => updateState((prev) => ({ ...prev, player2PartnerName: e.target.value }))}
                      placeholder="Nombre de la pareja"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flag2partner">Bandera Pareja (emoji o URL)</Label>
                    <Input
                      id="flag2partner"
                      value={matchState.player2PartnerFlag || ''}
                      onChange={(e) => updateState((prev) => ({ ...prev, player2PartnerFlag: e.target.value }))}
                      placeholder="🇫🇷 o https://..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Points Control */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Puntos</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-2">
              <Button
                onClick={() => addPoint(1)}
                className="flex-1"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Punto {matchState.player1Name}
              </Button>
              <Button
                onClick={() => removePoint(1)}
                variant="outline"
                size="lg"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => addPoint(2)}
                className="flex-1"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Punto {matchState.player2Name}
              </Button>
              <Button
                onClick={() => removePoint(2)}
                variant="outline"
                size="lg"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Games Control */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Juegos</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => adjustGames(1, -1)}
                variant="outline"
                size="icon"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex-1 text-center text-lg font-semibold text-foreground">
                {matchState.player1Name}: {matchState.player1Score.games}
              </span>
              <Button
                onClick={() => adjustGames(1, 1)}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => adjustGames(2, -1)}
                variant="outline"
                size="icon"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex-1 text-center text-lg font-semibold text-foreground">
                {matchState.player2Name}: {matchState.player2Score.games}
              </span>
              <Button
                onClick={() => adjustGames(2, 1)}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sets Control */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Sets</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => adjustSets(1, -1)}
                variant="outline"
                size="icon"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex-1 text-center text-lg font-semibold text-foreground">
                {matchState.player1Name}: {matchState.player1Score.sets}
              </span>
              <Button
                onClick={() => adjustSets(1, 1)}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => adjustSets(2, -1)}
                variant="outline"
                size="icon"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex-1 text-center text-lg font-semibold text-foreground">
                {matchState.player2Name}: {matchState.player2Score.sets}
              </span>
              <Button
                onClick={() => adjustSets(2, 1)}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Server and Reset */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={toggleServer} variant="secondary" className="flex-1">
            Cambiar Saque (Actual: {matchState.server === 1 ? matchState.player1Name : matchState.player2Name})
          </Button>
          <Button onClick={resetMatch} variant="destructive">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar Partido
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
