export interface User {
  id: string
  name: string
  email: string
}

export interface Movie {
  id: string
  title: string
  overview: string | null
  releaseYear: number
  genres: string[]
  runtime: number | null
  posterUrl: string | null
  imageUrl: string | null
  createdBy: string
  createdAt: string
  // creator relationship might be included if requested
  creator?: {
    id: string
    name: string
  }
}

export interface ApiResponse<T> {
  status: string
  data: T
}
