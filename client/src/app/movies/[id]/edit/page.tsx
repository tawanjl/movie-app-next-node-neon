'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Movie } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  overview: z.string().optional(),
  releaseYear: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Must be a number',
  }),
  runtime: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Must be a number',
  }).optional(),
  genres: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EditMoviePage() {
  const router = useRouter()
  const { id } = useParams()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (id) fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    try {
      const res = await api.get(`/movies/${id}`)
      const movie: Movie = res.data.data

      reset({
        title: movie.title,
        overview: movie.overview || '',
        releaseYear: movie.releaseYear.toString(),
        runtime: movie.runtime ? movie.runtime.toString() : '',
        genres: movie.genres.join(', '),
      })
    } catch (error) {
      console.error('Failed to fetch movie', error)
      router.push('/')
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('title', data.title)
    if (data.overview) formData.append('overview', data.overview)
    formData.append('releaseYear', data.releaseYear)
    if (data.runtime) formData.append('runtime', data.runtime)

    if (data.genres) {
      const genresArray = data.genres.split(',').map(g => g.trim()).filter(Boolean)
      formData.append('genres', JSON.stringify(genresArray))
    }

    if (file) {
      formData.append('image', file)
    }

    try {
      await api.put(`/movies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      router.push(`/movies/${id}`)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update movie')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Movie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <span className="text-sm text-red-500">{errors.title.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <Input id="overview" {...register('overview')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseYear">Release Year</Label>
                <Input id="releaseYear" type="number" {...register('releaseYear')} />
                {errors.releaseYear && (
                  <span className="text-sm text-red-500">{errors.releaseYear.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="runtime">Runtime (min)</Label>
                <Input id="runtime" type="number" {...register('runtime')} />
                {errors.runtime && (
                  <span className="text-sm text-red-500">{errors.runtime.message}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genres">Genres (comma separated)</Label>
              <Input id="genres" placeholder="Action, Drama, Sci-Fi" {...register('genres')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">New Poster Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Leave blank to keep existing image</p>
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Movie'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
