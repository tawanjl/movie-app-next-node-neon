import express from 'express'
import { addToWatchlist, removeFromWatchlist, updateWatchlistItem, getWatchlist } from '../controllers/watchlistController.ts'
import { authMiddleware } from '../middleware/authMiddleware.ts'


const router = express.Router()

router.use(authMiddleware)

router.get('/', getWatchlist)
router.post('/', addToWatchlist)

router.put('/:id', updateWatchlistItem)

router.delete('/:id', removeFromWatchlist)


export default router