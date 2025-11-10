import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Server, Channel, Message, User } from '@/lib/types'
import { authService } from '@/services/authService'
import { serverService } from '@/services/serverService'
import { channelService } from '@/services/channelService'
import { messageService } from '@/services/messageService'
import { socketService } from '@/services/socketService'

interface AppContextType {
  currentServer: Server | null
  setCurrentServer: (server: Server | null) => void
  currentChannel: Channel | null
  setCurrentChannel: (channel: Channel | null) => void
  servers: Server[]
  setServers: (servers: Server[]) => void
  channels: Channel[]
  setChannels: (channels: Channel[]) => void
  messages: Message[]
  setMessages: (messages: Message[]) => void
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  isAuthenticated: boolean
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  loadServers: () => Promise<void>
  loadChannels: (serverId: string) => Promise<void>
  loadMessages: (channelId: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentServer, setCurrentServer] = useState<Server | null>(null)
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [servers, setServers] = useState<Server[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize app - check auth and load data
  useEffect(() => {
    const initApp = async () => {
      try {
        const token = authService.getAccessToken()
        
        if (!token) {
          setIsLoading(false)
          return
        }

        // Get current user
        const user = await authService.getCurrentUser()
        setCurrentUser(user)
        setIsAuthenticated(true)

        // Connect socket
        socketService.connect(token)

        // Load servers
        await loadServers()

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    }

    initApp()

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  // Load servers
  const loadServers = async () => {
    try {
      const fetchedServers = await serverService.getUserServers()
      setServers(fetchedServers)

      // Set first server as current if none selected
      if (!currentServer && fetchedServers.length > 0) {
        setCurrentServer(fetchedServers[0])
      }
    } catch (error) {
      console.error('Failed to load servers:', error)
    }
  }

  // Load channels when server changes
  useEffect(() => {
    if (currentServer) {
      loadChannels(currentServer.id)
    }
  }, [currentServer])

  const loadChannels = async (serverId: string) => {
    try {
      const fetchedChannels = await channelService.getServerChannels(serverId)
      setChannels(fetchedChannels)

      // Set first text channel as current
      const firstTextChannel = fetchedChannels.find((ch) => ch.type === 'text')
      if (firstTextChannel) {
        setCurrentChannel(firstTextChannel)
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    }
  }

  // Load messages when channel changes
  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel.id)
      
      // Join channel room
      socketService.joinChannel(currentChannel.id)

      return () => {
        socketService.leaveChannel(currentChannel.id)
      }
    }
  }, [currentChannel])

  const loadMessages = async (channelId: string) => {
    try {
      const fetchedMessages = await messageService.getChannelMessages(channelId)
      
      // Convert timestamp strings to Date objects
      const messagesWithDates = fetchedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.createdAt || msg.timestamp),
      }))
      
      setMessages(messagesWithDates)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // Setup socket listeners
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      if (message.channelId === currentChannel?.id) {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            timestamp: new Date(message.createdAt || message.timestamp),
          },
        ])
      }
    }

    const handleMessageUpdate = (message: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? {
                ...message,
                timestamp: new Date(message.createdAt || message.timestamp),
              }
            : msg
        )
      )
    }

    const handleMessageDelete = (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
    }

    socketService.on('message:new', handleNewMessage)
    socketService.on('message:update', handleMessageUpdate)
    socketService.on('message:delete', handleMessageDelete)

    return () => {
      socketService.off('message:new', handleNewMessage)
      socketService.off('message:update', handleMessageUpdate)
      socketService.off('message:delete', handleMessageDelete)
    }
  }, [currentChannel])

  // Send message
  const sendMessage = async (content: string) => {
    if (!currentChannel) {
      throw new Error('No channel selected')
    }

    try {
      const message = await messageService.sendMessage(currentChannel.id, content)
      
      // Broadcast via socket
      socketService.sendMessage(currentChannel.id, {
        ...message,
        timestamp: new Date(message.createdAt || message.timestamp),
      } as Message)
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  const value = {
    currentServer,
    setCurrentServer,
    currentChannel,
    setCurrentChannel,
    servers,
    setServers,
    channels,
    setChannels,
    messages,
    setMessages,
    currentUser,
    setCurrentUser,
    isAuthenticated,
    isLoading,
    sendMessage,
    loadServers,
    loadChannels,
    loadMessages,
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
