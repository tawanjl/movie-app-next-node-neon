import express from 'express'
import cors from 'cors'
import movieRoutes from './routes/movieRoutes.ts'
import authRoutes from './routes/authRoutes.ts'
import watchlistRoutes from './routes/watchlistRoutes.ts'
import type { NextFunction, Request, Response } from 'express'

const app = express()
const port = 5001
app.use(express.json()) // Body parsing middleware
app.use(cors()) // Enable CORS


// GET , POST , PUT , DELETE
// http://localhost:5001/

// AUTH - signin , signup
// MOVIE - get all movies
// USER - profile
// WATCHLIST

// API ROUTES

app.use('/movies', movieRoutes)
app.use('/auth', authRoutes)
app.use('/watchlist', watchlistRoutes)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("GLOBAL ERROR:", err)

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
