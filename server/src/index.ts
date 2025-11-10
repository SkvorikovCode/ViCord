import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import serverRoutes from './routes/servers.js'
import channelRoutes from './routes/channels.js'
import messageRoutes from './routes/messages.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { verifyAccessToken } from './utils/jwt.js'
import prisma from './utils/prisma.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Create Express app
const app = express()
const httpServer = createServer(app)

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/servers', serverRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/messages', messageRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Socket.IO connection handling
interface ConnectedUser {
  userId: string
  username: string
  socketId: string
}

const connectedUsers = new Map<string, ConnectedUser>()

io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id)

  // Authenticate socket connection
  socket.on('authenticate', async (token: string) => {
    try {
      const payload = verifyAccessToken(token)

      if (!payload) {
        socket.emit('error', { message: 'Authentication failed' })
        socket.disconnect()
        return
      }

      // Store user connection
      connectedUsers.set(socket.id, {
        userId: payload.userId,
        username: payload.username,
        socketId: socket.id,
      })

      // Update user status to online
      await prisma.user.update({
        where: { id: payload.userId },
        data: { status: 'online' },
      })

      socket.emit('authenticated', { userId: payload.userId })

      // Notify others that user is online
      socket.broadcast.emit('user:online', {
        userId: payload.userId,
        username: payload.username,
      })

      console.log('✅ User authenticated:', payload.username)
    } catch (error) {
      console.error('❌ Authentication error:', error)
      socket.emit('error', { message: 'Authentication failed' })
      socket.disconnect()
    }
  })

  // Join a channel room
  socket.on('channel:join', (channelId: string) => {
    socket.join(`channel:${channelId}`)
    console.log(`📥 Socket ${socket.id} joined channel ${channelId}`)
  })

  // Leave a channel room
  socket.on('channel:leave', (channelId: string) => {
    socket.leave(`channel:${channelId}`)
    console.log(`📤 Socket ${socket.id} left channel ${channelId}`)
  })

  // New message
  socket.on('message:new', (data: { channelId: string; message: any }) => {
    io.to(`channel:${data.channelId}`).emit('message:new', data.message)
    console.log('💬 New message in channel:', data.channelId)
  })

  // Message updated
  socket.on('message:update', (data: { channelId: string; message: any }) => {
    io.to(`channel:${data.channelId}`).emit('message:update', data.message)
    console.log('✏️ Message updated in channel:', data.channelId)
  })

  // Message deleted
  socket.on('message:delete', (data: { channelId: string; messageId: string }) => {
    io.to(`channel:${data.channelId}`).emit('message:delete', data)
    console.log('🗑️ Message deleted in channel:', data.channelId)
  })

  // Typing indicators
  socket.on('typing:start', (data: { channelId: string; userId: string; username: string }) => {
    socket.to(`channel:${data.channelId}`).emit('typing:start', {
      userId: data.userId,
      username: data.username,
    })
  })

  socket.on('typing:stop', (data: { channelId: string; userId: string }) => {
    socket.to(`channel:${data.channelId}`).emit('typing:stop', {
      userId: data.userId,
    })
  })

  // Disconnect
  socket.on('disconnect', async () => {
    const user = connectedUsers.get(socket.id)

    if (user) {
      // Update user status to offline
      try {
        await prisma.user.update({
          where: { id: user.userId },
          data: { status: 'offline' },
        })

        // Notify others that user is offline
        socket.broadcast.emit('user:offline', {
          userId: user.userId,
          username: user.username,
        })

        console.log('👋 User disconnected:', user.username)
      } catch (error) {
        console.error('❌ Error updating user status:', error)
      }

      connectedUsers.delete(socket.id)
    }

    console.log('🔌 Socket disconnected:', socket.id)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log('🚀 ViCord Server is running!')
  console.log(`📡 HTTP Server: http://localhost:${PORT}`)
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`)
  console.log(`🌍 CORS Origin: ${CORS_ORIGIN}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    prisma.$disconnect()
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    prisma.$disconnect()
  })
})

