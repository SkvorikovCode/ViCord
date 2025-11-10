import { Router } from 'express'
import * as serverController from '../controllers/serverController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes are protected
router.use(authenticate)

router.get('/', serverController.getUserServers)
router.post('/', serverController.createServer)
router.get('/:id', serverController.getServerById)
router.patch('/:id', serverController.updateServer)
router.delete('/:id', serverController.deleteServer)
router.post('/:id/join', serverController.joinServer)

export default router

