'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, User, LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

export function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setRole(profile?.role || 'user')
            }
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null)
            if (!session) {
                setRole(null)
            } else {
                getUser()
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="bg-emerald-600 p-1.5 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">BookStore</span>
                </Link>

                <div className="flex items-center space-x-4">
                    {/* Admin links removed for security */}
                </div>
            </div>
        </nav>
    )
}
