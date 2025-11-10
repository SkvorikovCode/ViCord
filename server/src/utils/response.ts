import { Response } from 'express'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  return res.status(statusCode).json(response)
}

export const sendError = (res: Response, error: string, statusCode = 400) => {
  const response: ApiResponse = {
    success: false,
    error,
  }
  return res.status(statusCode).json(response)
}

export const sendCreated = <T>(res: Response, data: T, message?: string) => {
  return sendSuccess(res, data, message, 201)
}

export const sendNotFound = (res: Response, message = 'Resource not found') => {
  return sendError(res, message, 404)
}

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => {
  return sendError(res, message, 401)
}

export const sendForbidden = (res: Response, message = 'Forbidden') => {
  return sendError(res, message, 403)
}

export const sendServerError = (res: Response, message = 'Internal server error') => {
  return sendError(res, message, 500)
}

