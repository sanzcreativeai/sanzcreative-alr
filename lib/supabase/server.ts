import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

type CookieToSet = {
  name: string
  value: string
  options?: Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2]
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Cookie updates can fail in Server Components.
            // This is safe when middleware handles session refresh.
          }
        },
      },
    }
  )
}

/**
 * Admin client — uses the service role key.
 * ONLY use in server-side API routes, NEVER in client components.
 * The service role key bypasses RLS.
 * Use sparingly: prefer the regular client + RLS for most operations.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Cookie updates can fail in Server Components.
            // This is safe when middleware handles session refresh.
          }
        },
      },
    }
  )
}