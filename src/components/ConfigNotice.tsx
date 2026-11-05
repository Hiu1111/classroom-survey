import { isSupabaseConfigured } from '../lib/supabase.ts'

export function ConfigNotice() {
  if (isSupabaseConfigured) return null
  return (
    <p role="status" className="rounded-md border border-amber-500 bg-amber-50 px-3 py-2 text-amber-950">
      Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file,
      then restart the dev server.
    </p>
  )
}
