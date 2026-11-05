
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, configured } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-center">
          Instructor Login
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Sign in to manage your classroom surveys
        </p>

        {!configured && (
          <p className="mt-4 rounded bg-yellow-100 p-3 text-sm">
            Supabase is not configured yet.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !configured}
            className="w-full rounded bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-5 block text-center text-blue-600"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
