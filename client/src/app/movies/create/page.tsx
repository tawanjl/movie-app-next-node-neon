'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  overview: z.string().optional(),
  releaseYear: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Must be a number',
  }),
  runtime: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Must be a number',
  }).optional(),
  genres: z.string().optional(), // Comma separated
  // File validation is tricky with zod+react-hook-form, handling manually or loose check
})

type FormData = z.infer<typeof schema>

export default function CreateMoviePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!file) {
      setError('Image is required')
      return
    }

    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('title', data.title)
    if (data.overview) formData.append('overview', data.overview)
    formData.append('releaseYear', data.releaseYear)
    if (data.runtime) formData.append('runtime', data.runtime)

    // Handle genres: split by comma if string
    if (data.genres) {
      // แปลง input genres จาก string → array
      const genresArray = data.genres.split(',').map(g => g.trim()).filter(Boolean)

      // แปลง array → stringified array
      formData.append('genres', JSON.stringify(genresArray))
    }

    formData.append('image', file)

    try {
      await api.post('/movies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      router.push('/')
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create movie')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Movie</CardTitle>
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
              <Label htmlFor="image">Poster Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Movie'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
