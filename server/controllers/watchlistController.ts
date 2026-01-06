import type { Response, Request } from "express"
import { prisma } from "../lib/prisma.ts"
import { Prisma } from '../generated/prisma/client.ts'



const addToWatchlist = async (req: Request, res: Response) => {
  const { movieId, status, rating, notes } = req.body

  // Verify movie exists
  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  })

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" })
  }

  const existingInWatchlist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: req.user!.id,
        movieId,
      },
    },
  })

  if (existingInWatchlist) {
    return res.status(400).json({ error: "Movie already in watchlist" })
  }

  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: req.user!.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  })

  return res.status(201).json({ status: "success", data: watchlistItem })
}


const updateWatchlistItem = async (req: Request, res: Response) => {
  const { status, rating, notes } = req.body;

  // Find watchlist item and verify ownership
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id },
  });

  if (!watchlistItem) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }

  // Ensure only owner can update
  if (watchlistItem.userId !== req.user!.id) {
    return res
      .status(403)
      .json({ error: "Not allowed to update this watchlist item" });
  }

  // Build update data
  const updateData: Prisma.WatchlistItemUpdateInput = {};
  if (status !== undefined) updateData.status = status.toUpperCase();
  if (rating !== undefined) updateData.rating = rating;
  if (notes !== undefined) updateData.notes = notes;

  // Update watchlist item
  const updatedItem = await prisma.watchlistItem.update({
    where: { id: req.params.id },
    data: updateData,
  });

  res.status(200).json({
    status: "success",
    data: {
      watchlistItem: updatedItem,
    },
  });
};




const removeFromWatchlist = async (req: Request, res: Response) => {
  // Find watchlist item and verify ownership
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id },
  });

  if (!watchlistItem) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }

  // Ensure only owner can delete
  if (watchlistItem.userId !== req.user!.id) {
    return res
      .status(403)
      .json({ error: "Not allowed to update this watchlist item" });
  }

  await prisma.watchlistItem.delete({
    where: { id: req.params.id },
  });

  res.status(200).json({
    status: "success",
    message: "Movie removed from watchlist",
  });
};

const getWatchlist = async (req: Request, res: Response) => {
  const watchlist = await prisma.watchlistItem.findMany({
    where: {
      userId: req.user!.id,
    },
    include: {
      movie: true,
    },
  })

  res.status(200).json({
    status: "success",
    data: watchlist,
  })
}

export { addToWatchlist, removeFromWatchlist, updateWatchlistItem, getWatchlist }