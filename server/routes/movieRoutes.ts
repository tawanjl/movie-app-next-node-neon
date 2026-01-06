import express from "express"
import {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.ts"
import { authMiddleware } from "../middleware/authMiddleware.ts"
import upload from "../middleware/uploadMiddleware.ts"

const router = express.Router()

router.get("/", getAllMovies)
router.get("/:id", getMovieById)

// Protected routes
router.use(authMiddleware)

router.post("/", upload.single("image"), createMovie)
router.put("/:id", upload.single("image"), updateMovie)
router.delete("/:id", deleteMovie)

export default router
