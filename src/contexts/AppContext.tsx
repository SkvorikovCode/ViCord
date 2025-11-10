import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Server, Channel, Message, User, ChannelCategory } from '@/lib/types'

interface AppContextType {
  currentServer: Server | null
  setCurrentServer: (server: Server | null) => void
  currentChannel: Channel | null
  setCurrentChannel: (channel: Channel | null) => void
  servers: Server[]
  channels: Channel[]
  messages: Message[]
  currentUser: User
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mock data
const mockUser: User = {
  id: '1',
  username: 'ViCordUser',
  status: 'online',
}

const mockServers: Server[] = [
  { id: '1', name: 'Мой сервер', iconColor: '#5865f2' },
  { id: '2', name: 'Геймеры', iconColor: '#23a559' },
  { id: '3', name: 'Разработка', iconColor: '#f23f43' },
]

const mockChannels: Channel[] = [
  { id: '1', name: 'общий', type: 'text', serverId: '1' },
  { id: '2', name: 'рандом', type: 'text', serverId: '1' },
  { id: '3', name: 'голосовой', type: 'voice', serverId: '1' },
  { id: '4', name: 'музыка', type: 'voice', serverId: '1' },
]

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Привет! Добро пожаловать в ViCord! 🎉',
    author: { id: '2', username: 'Бот', status: 'online' },
    timestamp: new Date(Date.now() - 3600000),
    channelId: '1',
  },
  {
    id: '2',
    content: 'Это легкий и красивый аналог Discord, созданный с использованием React, TypeScript и Tailwind CSS.',
    author: { id: '2', username: 'Бот', status: 'online' },
    timestamp: new Date(Date.now() - 3500000),
    channelId: '1',
  },
  {
    id: '3',
    content: 'Круто! Мне нравится интерфейс 😍',
    author: mockUser,
    timestamp: new Date(Date.now() - 1800000),
    channelId: '1',
  },
]

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentServer, setCurrentServer] = useState<Server | null>(mockServers[0])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(mockChannels[0])

  const value = {
    currentServer,
    setCurrentServer,
    currentChannel,
    setCurrentChannel,
    servers: mockServers,
    channels: mockChannels,
    messages: mockMessages,
    currentUser: mockUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

