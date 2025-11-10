import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import * as serverService from '../services/serverService.js'
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response.js'

export const getUserServers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    const servers = await serverService.getUserServers(userId)

    return sendSuccess(res, servers)
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch servers')
  }
}

export const getServerById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    const server = await serverService.getServerById(id, userId)

    return sendSuccess(res, server)
  } catch (error: any) {
    if (error.message === 'Server not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to fetch server')
  }
}

export const createServer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { name, iconColor } = req.body

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    if (!name) {
      return sendError(res, 'Server name is required')
    }

    const server = await serverService.createServer(userId, name, iconColor)

    return sendCreated(res, server, 'Server created successfully')
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create server')
  }
}

export const updateServer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const { name, icon, iconColor } = req.body

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    const server = await serverService.updateServer(id, userId, { name, icon, iconColor })

    return sendSuccess(res, server, 'Server updated successfully')
  } catch (error: any) {
    if (error.message === 'Server not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to update server')
  }
}

export const deleteServer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    await serverService.deleteServer(id, userId)

    return sendSuccess(res, null, 'Server deleted successfully')
  } catch (error: any) {
    if (error.message === 'Server not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to delete server')
  }
}

export const joinServer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    const member = await serverService.joinServer(id, userId)

    return sendCreated(res, member, 'Joined server successfully')
  } catch (error: any) {
    if (error.message === 'Server not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to join server')
  }
}

