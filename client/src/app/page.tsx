'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import api from '@/lib/api'
import { Movie } from '@/types'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies')
      setMovies(res.data.data)
    } catch (error) {
      console.error('Failed to fetch movies', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Movies</h1>
        {user && (
          <Link href="/movies/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Movie
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-[350px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {movies.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <Card className="h-full overflow-hidden hover:opacity-90 transition-opacity cursor-pointer flex flex-col">
                <div className="aspect-[2/3] w-full relative bg-muted">
                  {movie.imageUrl ? (
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {movie.releaseYear}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No movies found.</p>
        </div>
      )}
    </div>
  )
}
