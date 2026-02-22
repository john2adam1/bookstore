'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) throw loginError

            router.push('/admin') // Redirect to admin dashboard on success
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4 bg-[hsl(var(--background))]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-12 shadow-2xl shadow-slate-200 ring-1 ring-slate-100"
            >
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                        <LogIn className="h-8 w-8" />
                    </div>
                    <h2 className="mt-8 text-4xl font-black text-slate-900">Staff Login</h2>
                    <p className="mt-3 text-sm text-slate-500 font-bold uppercase tracking-widest">
                        Identity Required
                    </p>
                </div>

                <form className="mt-10 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                    placeholder="admin@bookstore.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-center text-sm font-bold text-rose-600 bg-rose-50 p-4 rounded-2xl"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-5 font-black text-white shadow-xl transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <span className="flex items-center space-x-2">
                                <span>Authorize Access</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

