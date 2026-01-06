'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from './ui/button'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-2xl">
          MovieApp
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Hi, {user.name}
              </span>
              <Link href="/watchlist">
                <Button variant="ghost" size="sm">
                  Watchlist
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
