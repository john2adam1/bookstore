'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BannerRecord {
    id: string
    image_url: string
    title: string | null
}

export function Banner() {
    const pathname = usePathname()
    const [banners, setBanners] = useState<BannerRecord[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchBanners() {
            const { data } = await supabase
                .from('banners')
                .select('id, image_url, title')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            if (data) setBanners(data)
            setLoading(false)
        }
        fetchBanners()
    }, [])

    useEffect(() => {
        if (banners.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [banners])

    if (pathname?.startsWith('/admin') || pathname === '/admin-login') return null
    if (loading || banners.length === 0) return null

    return (
        <div className="w-full bg-transparent pt-6 pb-2">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative w-full overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-blue-900/5 group ring-1 ring-slate-300">
                    <div className="w-full flex items-center justify-center bg-black/5">
                        <img
                            src={banners[currentIndex].image_url}
                            alt={banners[currentIndex].title || "Announcement Banner"}
                            className="w-full h-auto max-h-[500px] object-contain transition-opacity duration-500"
                        />
                    </div>

                    {banners.length > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-white/60 backdrop-blur-md border border-black/5 rounded-full text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-white/60 backdrop-blur-md border border-black/5 rounded-full text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2 px-3 py-1.5 bg-white/40 backdrop-blur-md rounded-full border border-black/5">
                                {banners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-5 bg-[#002B5B]' : 'bg-black/20 hover:bg-black/40'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
