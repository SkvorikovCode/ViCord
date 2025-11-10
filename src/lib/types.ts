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

export interface MessageAttachment {
  filename: string
  url: string
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'archive' | 'text' | 'other'
  size: number
}

export interface Message {
  id: string
  content: string
  author: User
  timestamp: Date
  channelId: string
  createdAt?: string
  updatedAt?: string
  attachments?: MessageAttachment[]
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

