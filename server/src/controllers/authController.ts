import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import * as authService from '../services/authService.js'
import { sendSuccess, sendError, sendCreated, sendUnauthorized } from '../utils/response.js'

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password } = req.body

    // Validation
    if (!email || !username || !password) {
      return sendError(res, 'Email, username, and password are required')
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters')
    }

    const result = await authService.register({ email, username, password })

    return sendCreated(res, result, 'User registered successfully')
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed')
  }
}

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required')
    }

    const result = await authService.login({ email, password })

    return sendSuccess(res, result, 'Login successful')
  } catch (error: any) {
    return sendUnauthorized(res, error.message || 'Login failed')
  }
}

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required')
    }

    const result = await authService.refresh(refreshToken)

    return sendSuccess(res, result)
  } catch (error: any) {
    return sendUnauthorized(res, error.message || 'Token refresh failed')
  }
}

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required')
    }

    await authService.logout(userId, refreshToken)

    return sendSuccess(res, null, 'Logout successful')
  } catch (error: any) {
    return sendError(res, error.message || 'Logout failed')
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const user = await authService.getCurrentUser(userId)

    return sendSuccess(res, user)
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user')
  }
}

