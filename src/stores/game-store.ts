import { create } from 'zustand'

export type RoomStatus = 'waiting' | 'playing' | 'showing_stats' | 'leaderboard' | 'finished'

export interface Player {
  id: string
  username: string
  avatar: string
  score: number
}

interface GameState {
  // Room state
  roomId: string | null
  status: RoomStatus
  isHost: boolean
  
  // Game data
  currentQuestionIndex: number
  totalQuestions: number
  players: Player[]
  
  // Actions
  setRoom: (roomId: string, isHost: boolean) => void
  updateRoomState: (updates: Partial<{ status: RoomStatus, currentQuestionIndex: number, totalQuestions: number }>) => void
  setPlayers: (players: Player[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  status: 'waiting',
  isHost: false,
  
  currentQuestionIndex: 0,
  totalQuestions: 20,
  players: [],
  
  setRoom: (roomId, isHost) => set({ roomId, isHost, status: 'waiting' }),
  
  updateRoomState: (updates) => set((state) => ({ ...state, ...updates })),
  
  setPlayers: (players) => set({ players }),
  
  addPlayer: (player) => set((state) => ({ 
    players: [...state.players.filter(p => p.id !== player.id), player] 
  })),
  
  removePlayer: (playerId) => set((state) => ({ 
    players: state.players.filter(p => p.id !== playerId) 
  })),
  
  reset: () => set({
    roomId: null,
    status: 'waiting',
    isHost: false,
    currentQuestionIndex: 0,
    players: [],
  })
}))
