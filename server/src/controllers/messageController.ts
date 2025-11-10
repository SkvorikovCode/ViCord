import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import * as messageService from '../services/messageService.js'
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response.js'
import { getFileCategory } from '../middleware/upload.js'

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

    // Check if at least content or files are provided
    const files = req.files as Express.Multer.File[]
    if ((!content || content.trim().length === 0) && (!files || files.length === 0)) {
      return sendError(res, 'Message content or attachments are required')
    }

    // Process file attachments
    let attachments: Array<{ filename: string; url: string; type: string; size: number }> | undefined
    if (files && files.length > 0) {
      attachments = files.map((file) => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        type: getFileCategory(file.mimetype),
        size: file.size,
      }))
    }

    const message = await messageService.createMessage(
      channelId,
      userId,
      content || '',
      attachments
    )

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

