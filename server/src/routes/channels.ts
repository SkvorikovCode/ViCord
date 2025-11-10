import { Router } from 'express'
import * as channelController from '../controllers/channelController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes are protected
router.use(authenticate)

router.get('/server/:serverId', channelController.getServerChannels)
router.post('/server/:serverId', channelController.createChannel)
router.patch('/:id', channelController.updateChannel)
router.delete('/:id', channelController.deleteChannel)

export default router

