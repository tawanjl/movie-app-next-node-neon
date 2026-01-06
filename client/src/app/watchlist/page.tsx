'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getWatchlist, removeFromWatchlist, updateWatchlistItem } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface WatchlistItem {
  id: string
  movieId: string
  status: string
  rating: number | null
  notes: string | null
  movie: {
    id: string
    title: string
    imageUrl: string
  }
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await getWatchlist()
      setWatchlist(res.data.data)
    } catch (err) {
      setError('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeFromWatchlist(id)
      setWatchlist((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error('Failed to remove item', err)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setWatchlist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    )

    try {
      await updateWatchlistItem(id, { status: newStatus })
    } catch (err) {
      console.error('Failed to update status', err)
      // Revert on failure
      fetchWatchlist()
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Your watchlist is empty</h2>
        <Link href="/">
          <Button>Browse Movies</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {watchlist.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-zinc-900 border-zinc-800">
            <div className="aspect-[2/3] relative">
              <img
                src={item.movie.imageUrl}
                alt={item.movie.title}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle className="truncate text-white">{item.movie.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400">Status</label>
                <select
                  className="bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="WATCHING">Watching</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DROPPED">Dropped</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
