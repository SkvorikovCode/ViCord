export interface Server {
  id: string
  name: string
  icon?: string
  iconColor?: string
}

export interface Channel {
  id: string
  name: string
  type: 'text' | 'voice'
  serverId: string
}

export interface Message {
  id: string
  content: string
  author: User
  timestamp: Date
  channelId: string
}

export interface User {
  id: string
  username: string
  avatar?: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
}

export interface ChannelCategory {
  id: string
  name: string
  channels: Channel[]
  serverId: string
}

