import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import * as messageService from '../services/messageService.js'
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response.js'

export const getChannelMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { channelId } = req.params
    const { limit, before } = req.query

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    const messages = await messageService.getChannelMessages(
      channelId,
      userId,
      limit ? parseInt(limit as string) : 50,
      before as string | undefined
    )

    return sendSuccess(res, messages)
  } catch (error: any) {
    if (error.message === 'Channel not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to fetch messages')
  }
}

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { channelId } = req.params
    const { content } = req.body

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Message content is required')
    }

    const message = await messageService.createMessage(channelId, userId, content)

    return sendCreated(res, message, 'Message sent successfully')
  } catch (error: any) {
    if (error.message === 'Channel not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to send message')
  }
}

export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const { content } = req.body

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Message content is required')
    }

    const message = await messageService.updateMessage(id, userId, content)

    return sendSuccess(res, message, 'Message updated successfully')
  } catch (error: any) {
    if (error.message === 'Message not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to update message')
  }
}

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return sendError(res, 'User not authenticated', 401)
    }

    await messageService.deleteMessage(id, userId)

    return sendSuccess(res, null, 'Message deleted successfully')
  } catch (error: any) {
    if (error.message === 'Message not found') {
      return sendNotFound(res, error.message)
    }
    return sendError(res, error.message || 'Failed to delete message')
  }
}

