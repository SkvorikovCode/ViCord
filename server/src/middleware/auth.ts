import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../utils/jwt.js'
import { sendUnauthorized } from '../utils/response.js'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided')
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token)

    if (!payload) {
      sendUnauthorized(res, 'Invalid or expired token')
      return
    }

    req.user = payload
    next()
  } catch (error) {
    sendUnauthorized(res, 'Authentication failed')
  }
}

