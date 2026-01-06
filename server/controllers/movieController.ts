import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.ts"
import { Prisma } from '../generated/prisma/client.ts'

// Create a movie
const createMovie = async (req: Request, res: Response) => {
  try {
    const { title, overview, releaseYear, genres, runtime } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: "Image file is required" })
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        overview,
        releaseYear: parseInt(releaseYear),
        genres: genres ? (Array.isArray(genres) ? genres : JSON.parse(genres)) : [],
        runtime: runtime ? parseInt(runtime) : null,
        imageUrl: file.path, // Cloudinary URL
        posterUrl: file.path, // Keeping backward compatibility if needed, or just use imageUrl
        createdBy: req.user!.id,
      },
    })

    res.status(201).json({ status: "success", data: movie })
  } catch (error) {
    console.error("Create movie error:", error)
    res.status(500).json({ error: "Failed to create movie" })
  }
}

// Get all movies
const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
    })
    res.json({ status: "success", data: movies })
  } catch (error: any) {
    console.error("Fetch movies error:", error)
    res.status(500).json({
      error: "Failed to fetch movies",
      details: error.message,
      stack: error.stack
    })
  }
}

// Get single movie
const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" })
    }

    res.json({ status: "success", data: movie })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movie" })
  }
}

// Update movie
const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, overview, releaseYear, genres, runtime } = req.body
    const file = req.file

    const existingMovie = await prisma.movie.findUnique({
      where: { id },
    })

    if (!existingMovie) {
      return res.status(404).json({ error: "Movie not found" })
    }

    if (existingMovie.createdBy !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to update this movie" })
    }

    const updateData: Prisma.MovieUpdateInput = {
      title,
      overview,
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      genres: genres ? (Array.isArray(genres) ? genres : JSON.parse(genres)) : undefined,
      runtime: runtime ? parseInt(runtime) : undefined,
    }

    if (file) {
      updateData.imageUrl = file.path
      updateData.posterUrl = file.path
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: updateData,
    })

    res.json({ status: "success", data: updatedMovie })
  } catch (error) {
    console.error("Update movie error:", error)
    res.status(500).json({ error: "Failed to update movie" })
  }
}

// Delete movie
const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existingMovie = await prisma.movie.findUnique({
      where: { id },
    })

    if (!existingMovie) {
      return res.status(404).json({ error: "Movie not found" })
    }

    if (existingMovie.createdBy !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to delete this movie" })
    }

    await prisma.movie.delete({
      where: { id },
    })

    res.json({ status: "success", message: "Movie deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete movie" })
  }
}

export { createMovie, getAllMovies, getMovieById, updateMovie, deleteMovie }
