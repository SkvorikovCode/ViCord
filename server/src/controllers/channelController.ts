import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import * as channelService from '../services/channelService.js'
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response.js'

export const getServerChannels = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { serverId } = req.params

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    const channels = await channelService.getServerChannels(serverId, userId)

    return sendSuccess(res, channels)
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch channels')
  }
}

export const createChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { serverId } = req.params
    const { name, type } = req.body

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    if (!name || !type) {
      return sendError(res, 'Channel name and type are required')
    }

    if (type !== 'text' && type !== 'voice') {
      return sendError(res, 'Channel type must be "text" or "voice"')
    }

    const channel = await channelService.createChannel(serverId, userId, { name, type })

    return sendCreated(res, channel, 'Channel created successfully')
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create channel')
  }
}

export const updateChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const { name, type } = req.body

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    if (type && type !== 'text' && type !== 'voice') {
      return sendError(res, 'Channel type must be "text" or "voice"')
    }

    const channel = await channelService.updateChannel(id, userId, { name, type })

    return sendSuccess(res, channel, 'Channel updated successfully')
  } catch (error: any) {
    if (error.message === 'Channel not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to update channel')
  }
}

export const deleteChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    await channelService.deleteChannel(id, userId)

    return sendSuccess(res, null, 'Channel deleted successfully')
  } catch (error: any) {
    if (error.message === 'Channel not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to delete channel')
  }
}

