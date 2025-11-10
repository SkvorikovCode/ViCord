import { Request, Response, NextFunction } from 'express'
import { sendServerError } from '../utils/response.js'

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', error)

  if (res.headersSent) {
    return next(error)
  }

  return sendServerError(res, error.message || 'Something went wrong')
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  })
}

