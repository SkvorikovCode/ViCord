import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)

// Protected routes
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.me)

export default router

