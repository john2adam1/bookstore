'use client'

import { useState } from 'react'
import { X, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { motion, AnimatePresence } from 'framer-motion'

interface Book {
    id: string
    title: string
    discount_price: number
    images: string[]
}

interface BuyModalProps {
    book: Book
    onClose: () => void
}

export function BuyModal({ book, onClose }: BuyModalProps) {
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from('orders')
                .insert({
                    book_id: book.id,
                    book_title: book.title,
                    full_name: fullName,
                    phone: phone,
                })

            if (insertError) throw insertError

            // Synchronize with Google Sheets
            const sheetsUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL
            if (sheetsUrl) {
                fetch(sheetsUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({
                        book_title: book.title,
                        full_name: fullName,
                        phone: phone,
                    }),
                }).catch(err => console.error('Google Sheets sync error:', err))
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black text-slate-900">Order Received!</h2>
                        <p className="mt-2 text-slate-500">We'll contact you shortly to confirm your delivery.</p>
                        <button
                            onClick={onClose}
                            className="mt-8 w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition-all hover:bg-slate-800"
                        >
                            Wonderful
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center space-x-4 mb-8">
                            <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100 shrink-0">
                                {book.images?.[0] ? (
                                    <img src={book.images[0]} alt={book.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl font-black text-slate-900 truncate">{book.title}</h2>
                                <p className="text-emerald-600 font-bold">${book.discount_price}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all font-medium"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all font-medium"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            {error && (
                                <p className="text-sm font-bold text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-emerald-600 py-4 font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        <ShoppingBag className="h-5 w-5" />
                                        <span>Confirm Purchase</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

