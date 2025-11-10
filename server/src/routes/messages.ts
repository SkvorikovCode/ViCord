import { Router } from 'express'
import * as messageController from '../controllers/messageController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes are protected
router.use(authenticate)

router.get('/channel/:channelId', messageController.getChannelMessages)
router.post('/channel/:channelId', messageController.createMessage)
router.patch('/:id', messageController.updateMessage)
router.delete('/:id', messageController.deleteMessage)

export default router

