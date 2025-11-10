import bcrypt from 'bcrypt'
import prisma from '../utils/prisma.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenHash,
  JwtPayload,
} from '../utils/jwt.js'

const SALT_ROUNDS = 10

export interface RegisterData {
  email: string
  username: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResult {
  user: {
    id: string
    email: string
    username: string
    avatar: string | null
    status: string
  }
  accessToken: string
  refreshToken: string
}

export const register = async (data: RegisterData): Promise<AuthResult> => {
  const { email, username, password } = data

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email already in use')
    }
    throw new Error('Username already taken')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      status: 'online',
    },
  })

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Store refresh token hash
  const tokenHash = generateTokenHash(refreshToken)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt,
    },
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
    },
    accessToken,
    refreshToken,
  }
}

export const login = async (data: LoginData): Promise<AuthResult> => {
  const { email, password } = data

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    throw new Error('Invalid credentials')
  }

  // Update user status to online
  await prisma.user.update({
    where: { id: user.id },
    data: { status: 'online' },
  })

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Store refresh token hash
  const tokenHash = generateTokenHash(refreshToken)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt,
    },
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
    },
    accessToken,
    refreshToken,
  }
}

export const refresh = async (refreshToken: string): Promise<{ accessToken: string }> => {
  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken)

  if (!payload) {
    throw new Error('Invalid or expired refresh token')
  }

  // Check if token exists in database
  const tokenHash = generateTokenHash(refreshToken)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  })

  if (!storedToken) {
    throw new Error('Invalid refresh token')
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { token: tokenHash },
    })
    throw new Error('Refresh token expired')
  }

  // Generate new access token
  const accessToken = generateAccessToken(payload)

  return { accessToken }
}

export const logout = async (userId: string, refreshToken: string): Promise<void> => {
  // Delete refresh token
  const tokenHash = generateTokenHash(refreshToken)
  await prisma.refreshToken.deleteMany({
    where: {
      token: tokenHash,
      userId,
    },
  })

  // Update user status to offline
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'offline' },
  })
}

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      status: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

