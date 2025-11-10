import { io, Socket } from 'socket.io-client'
import { Message } from '@/lib/types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect(token: string) {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected')
      this.socket?.emit('authenticate', token)
    })

    this.socket.on('authenticated', (data: { userId: string }) => {
      console.log('✅ Socket authenticated:', data.userId)
    })

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
    })

    this.socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error)
    })

    // Setup event listeners
    this.setupEventListeners()
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Message events
    this.socket.on('message:new', (message: Message) => {
      this.emit('message:new', message)
    })

    this.socket.on('message:update', (message: Message) => {
      this.emit('message:update', message)
    })

    this.socket.on('message:delete', (data: { channelId: string; messageId: string }) => {
      this.emit('message:delete', data)
    })

    // Typing events
    this.socket.on('typing:start', (data: { userId: string; username: string }) => {
      this.emit('typing:start', data)
    })

    this.socket.on('typing:stop', (data: { userId: string }) => {
      this.emit('typing:stop', data)
    })

    // User events
    this.socket.on('user:online', (data: { userId: string; username: string }) => {
      this.emit('user:online', data)
    })

    this.socket.on('user:offline', (data: { userId: string; username: string }) => {
      this.emit('user:offline', data)
    })
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

  // Socket emit methods
  joinChannel(channelId: string) {
    this.socket?.emit('channel:join', channelId)
  }

  leaveChannel(channelId: string) {
    this.socket?.emit('channel:leave', channelId)
  }

  sendMessage(channelId: string, message: Message) {
    this.socket?.emit('message:new', { channelId, message })
  }

  updateMessage(channelId: string, message: Message) {
    this.socket?.emit('message:update', { channelId, message })
  }

  deleteMessage(channelId: string, messageId: string) {
    this.socket?.emit('message:delete', { channelId, messageId })
  }

  startTyping(channelId: string, userId: string, username: string) {
    this.socket?.emit('typing:start', { channelId, userId, username })
  }

  stopTyping(channelId: string, userId: string) {
    this.socket?.emit('typing:stop', { channelId, userId })
  }
}

export const socketService = new SocketService()

