'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import api, { addToWatchlist } from '@/lib/api'
import { Movie } from '@/types'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Card,
} from '@/components/ui/card'


export default function MoviePage() {
  const { id } = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToWatchlist, setAddingToWatchlist] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    try {
      const res = await api.get(`/movies/${id}`)
      setMovie(res.data.data)
    } catch (error) {
      console.error('Failed to fetch movie', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this movie?')) return

    try {
      await api.delete(`/movies/${id}`)
      router.push('/')
    } catch (error) {
      console.error('Failed to delete movie', error)
      alert('Failed to delete movie')
    }
  }

  const handleAddToWatchlist = async () => {
    setAddingToWatchlist(true)
    try {
      await addToWatchlist({ movieId: id as string })
      router.push('/watchlist')
    } catch (error: any) {
      console.error('Failed to add to watchlist', error)
      const msg = error.response?.data?.error || 'Failed to add to watchlist'
      alert(msg)
    } finally {
      setAddingToWatchlist(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (!movie) {
    return <div className="text-center py-10">Movie not found</div>
  }

  const isOwner = user?.id === movie.createdBy

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="aspect-[2/3] relative bg-muted h-full">
              {movie.imageUrl ? (
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="object-cover w-full h-full rounded-l-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground min-h-[400px]">
                  No Image
                </div>
              )}
            </div>
          </div>
          <div className="md:w-2/3 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                  <p className="text-muted-foreground mb-4">
                    {movie.releaseYear} • {movie.runtime ? `${movie.runtime} min` : 'N/A'}
                  </p>
                </div>
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link href={`/movies/${id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Overview</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {movie.creator && (
                  <div>
                    <h3 className="font-semibold mb-1">Added By</h3>
                    <p className="text-sm text-muted-foreground">{movie.creator.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button onClick={handleAddToWatchlist} disabled={addingToWatchlist}>
                {addingToWatchlist ? 'Adding...' : 'Add to Watchlist'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
