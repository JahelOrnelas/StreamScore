'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Palette, Plus, Trash2, User } from 'lucide-react'

export type LowerThirdState = {
  title: string
  subtitle: string
  visible: boolean
  style: 'player' | 'commentator' | 'custom' | 'match'
  colors: {
    backgroundColor: string
    textColor: string
  }
}

export type TeamInfo = {
  playerAName?: string
  playerAFlag?: string
  playerBName?: string
  playerBFlag?: string
}

type LowerThirdControlProps = {
  lowerThirdState: LowerThirdState
  setLowerThirdState: (state: LowerThirdState) => void
}

type Person = {
  id: string
  name: string
  info: string
}

export function LowerThirdControl({ lowerThirdState, setLowerThirdState }: LowerThirdControlProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [players, setPlayers] = useState<Person[]>([])
  const [commentators, setCommentators] = useState<Person[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerInfo, setNewPlayerInfo] = useState('')
  const [newCommentatorName, setNewCommentatorName] = useState('')
  const [newCommentatorInfo, setNewCommentatorInfo] = useState('')
  const [showPlayerList, setShowPlayerList] = useState(false)
  const [showCommentatorList, setShowCommentatorList] = useState(false)

  useEffect(() => {
    const savedPlayers = localStorage.getItem('tennis-players')
    const savedCommentators = localStorage.getItem('tennis-commentators')
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers))
    if (savedCommentators) setCommentators(JSON.parse(savedCommentators))
  }, [])

  useEffect(() => {
    localStorage.setItem('tennis-players', JSON.stringify(players))
  }, [players])

  useEffect(() => {
    localStorage.setItem('tennis-commentators', JSON.stringify(commentators))
  }, [commentators])

  const updateField = (field: keyof LowerThirdState, value: string | boolean) => {
    setLowerThirdState({
      ...lowerThirdState,
      [field]: value,
    })
  }

  const updateColor = (colorKey: keyof LowerThirdState['colors'], value: string) => {
    setLowerThirdState({
      ...lowerThirdState,
      colors: {
        ...lowerThirdState.colors,
        [colorKey]: value,
      },
    })
  }

  const toggleVisibility = () => {
    updateField('visible', !lowerThirdState.visible)
  }

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Person = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        info: newPlayerInfo.trim(),
      }
      setPlayers([...players, newPlayer])
      setNewPlayerName('')
      setNewPlayerInfo('')
    }
  }

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id))
  }

  const selectPlayer = (player: Person) => {
    setLowerThirdState({
      ...lowerThirdState,
      title: player.name,
      subtitle: player.info,
      style: 'player',
      colors: {
        backgroundColor: '#1e40af',
        textColor: '#ffffff',
      },
    })
  }

  const addCommentator = () => {
    if (newCommentatorName.trim()) {
      const newCommentator: Person = {
        id: Date.now().toString(),
        name: newCommentatorName.trim(),
        info: newCommentatorInfo.trim(),
      }
      setCommentators([...commentators, newCommentator])
      setNewCommentatorName('')
      setNewCommentatorInfo('')
    }
  }

  const removeCommentator = (id: string) => {
    setCommentators(commentators.filter(c => c.id !== id))
  }

  const selectCommentator = (commentator: Person) => {
    setLowerThirdState({
      ...lowerThirdState,
      title: commentator.name,
      subtitle: commentator.info,
      style: 'commentator',
      colors: {
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
      },
    })
  }

  const presets = [
    { label: 'Jugadores', style: 'player' as const, bg: '#1e40af', text: '#ffffff' },
    { label: 'Comentaristas', style: 'commentator' as const, bg: '#7c3aed', text: '#ffffff' },
    { label: 'Personalizado', style: 'custom' as const, bg: '#059669', text: '#ffffff' },
    { label: 'Próximo Enfrentamiento', style: 'match' as const, bg: '#111827', text: '#ffffff' },
  ]

  const selectPreset = (preset: typeof presets[0]) => {
    setLowerThirdState({
      ...lowerThirdState,
      style: preset.style,
      colors: {
        backgroundColor: preset.bg,
        textColor: preset.text,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lower Thirds (Plecas)</CardTitle>
        <CardDescription>
          Configura las plecas para mostrar información antes del partido
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Lista de Jugadores</Label>
            <Button
              onClick={() => setShowPlayerList(!showPlayerList)}
              variant="outline"
              size="sm"
            >
              <User className="mr-2 h-4 w-4" />
              {showPlayerList ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          {showPlayerList && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <Input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Nombre del jugador"
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                />
                <Input
                  value={newPlayerInfo}
                  onChange={(e) => setNewPlayerInfo(e.target.value)}
                  placeholder="Info (ej: España - 22 Grand Slams)"
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                />
                <Button onClick={addPlayer} className="w-full" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Jugador
                </Button>
              </div>

              {players.length > 0 && (
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
                    >
                      <button
                        onClick={() => selectPlayer(player)}
                        className="flex-1 text-left hover:opacity-80"
                      >
                        <div className="font-medium text-sm">{player.name}</div>
                        {player.info && (
                          <div className="text-xs text-muted-foreground">{player.info}</div>
                        )}
                      </button>
                      <Button
                        onClick={() => removePlayer(player.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Lista de Comentaristas</Label>
            <Button
              onClick={() => setShowCommentatorList(!showCommentatorList)}
              variant="outline"
              size="sm"
            >
              <User className="mr-2 h-4 w-4" />
              {showCommentatorList ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          {showCommentatorList && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <Input
                  value={newCommentatorName}
                  onChange={(e) => setNewCommentatorName(e.target.value)}
                  placeholder="Nombre del comentarista"
                  onKeyPress={(e) => e.key === 'Enter' && addCommentator()}
                />
                <Input
                  value={newCommentatorInfo}
                  onChange={(e) => setNewCommentatorInfo(e.target.value)}
                  placeholder="Info (ej: Ex tenista profesional)"
                  onKeyPress={(e) => e.key === 'Enter' && addCommentator()}
                />
                <Button onClick={addCommentator} className="w-full" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Comentarista
                </Button>
              </div>

              {commentators.length > 0 && (
                <div className="space-y-2">
                  {commentators.map((commentator) => (
                    <div
                      key={commentator.id}
                      className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
                    >
                      <button
                        onClick={() => selectCommentator(commentator)}
                        className="flex-1 text-left hover:opacity-80"
                      >
                        <div className="font-medium text-sm">{commentator.name}</div>
                        {commentator.info && (
                          <div className="text-xs text-muted-foreground">{commentator.info}</div>
                        )}
                      </button>
                      <Button
                        onClick={() => removeCommentator(commentator.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lt-title">Título Principal</Label>
            <Input
              id="lt-title"
              value={lowerThirdState.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ej: Rafael Nadal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lt-subtitle">Subtítulo</Label>
            <Input
              id="lt-subtitle"
              value={lowerThirdState.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Ej: España - 22 Grand Slams"
            />
          </div>

          {/* Match lower-third configuration */}
          <div className="space-y-2">
            <Label>Próximo Enfrentamiento</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Equipo 1 (izquierda → derecha)</Label>
                <Input
                  placeholder="Jugador A"
                  value={(lowerThirdState as any).team1?.playerAName || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    // ensure nested object exists
                    team1: {
                      ...(lowerThirdState as any).team1,
                      playerAName: e.target.value,
                    },
                  })}
                />
                <Input
                  placeholder="Bandera Jugador A (emoji o URL)"
                  value={(lowerThirdState as any).team1?.playerAFlag || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team1: {
                      ...(lowerThirdState as any).team1,
                      playerAFlag: e.target.value,
                    },
                  })}
                />
                <Input
                  placeholder="Jugador B (opcional)"
                  value={(lowerThirdState as any).team1?.playerBName || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team1: {
                      ...(lowerThirdState as any).team1,
                      playerBName: e.target.value,
                    },
                  })}
                />
                <Input
                  placeholder="Bandera Jugador B (emoji o URL)"
                  value={(lowerThirdState as any).team1?.playerBFlag || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team1: {
                      ...(lowerThirdState as any).team1,
                      playerBFlag: e.target.value,
                    },
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Equipo 2 (derecha ← izquierda)</Label>
                <Input
                  placeholder="Jugador A"
                  value={(lowerThirdState as any).team2?.playerAName || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team2: {
                      ...(lowerThirdState as any).team2,
                      playerAName: e.target.value,
                    },
                  })}
                />
                <Input
                  placeholder="Bandera Jugador A (emoji o URL)"
                  value={(lowerThirdState as any).team2?.playerAFlag || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team2: {
                      ...(lowerThirdState as any).team2,
                      playerAFlag: e.target.value,
                    },
                  })}
                />
                <Input
                  placeholder="Jugador B (opcional)"
                  value={(lowerThirdState as any).team2?.playerBName || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team2: {
                      ...(lowerThirdState as any).team2,
                      playerBName: e.target.value,
                    },
                  })}
                />
                <Input
                  placeholder="Bandera Jugador B (emoji o URL)"
                  value={(lowerThirdState as any).team2?.playerBFlag || ''}
                  onChange={(e) => setLowerThirdState({
                    ...lowerThirdState,
                    style: 'match',
                    team2: {
                      ...(lowerThirdState as any).team2,
                      playerBFlag: e.target.value,
                    },
                  })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Label className="whitespace-nowrap">Modalidad</Label>
              <Button
                variant={(lowerThirdState as any).isDoubles ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLowerThirdState({ ...lowerThirdState, style: 'match', isDoubles: false })}
              >
                Singles
              </Button>
              <Button
                variant={(lowerThirdState as any).isDoubles ? 'outline' : 'default'}
                size="sm"
                onClick={() => setLowerThirdState({ ...lowerThirdState, style: 'match', isDoubles: true })}
              >
                Dobles
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estilo de Pleca</Label>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.style}
                  variant={lowerThirdState.style === preset.style ? 'default' : 'outline'}
                  onClick={() => selectPreset(preset)}
                  className="flex-1"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label>Personalizar Colores</Label>
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
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-2">
                  <Label htmlFor="lt-bg-color">Color de Fondo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="lt-bg-color"
                      type="color"
                      value={lowerThirdState.colors.backgroundColor}
                      onChange={(e) => updateColor('backgroundColor', e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={lowerThirdState.colors.backgroundColor}
                      onChange={(e) => updateColor('backgroundColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lt-text-color">Color de Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="lt-text-color"
                      type="color"
                      value={lowerThirdState.colors.textColor}
                      onChange={(e) => updateColor('textColor', e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={lowerThirdState.colors.textColor}
                      onChange={(e) => updateColor('textColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={toggleVisibility}
              variant={lowerThirdState.visible ? 'destructive' : 'default'}
              className="flex-1"
            >
              {lowerThirdState.visible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Ocultar Pleca
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Mostrar Pleca
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Vista previa:</strong> La pleca aparecerá en la parte inferior izquierda
            con animación de entrada. Los colores se aplicarán automáticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
