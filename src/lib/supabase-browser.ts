import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // During build or if env vars are missing, we return a client with empty strings
    // to prevent the crash, but log a warning.
    if (typeof window !== 'undefined') {
      console.error('Supabase credentials missing! Check your environment variables.')
    }
    return createBrowserClient(url || '', key || '')
  }

  return createBrowserClient(url, key)
}
