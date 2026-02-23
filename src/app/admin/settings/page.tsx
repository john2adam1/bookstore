'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Upload, Image as ImageIcon, Trash2, Loader2, CheckCircle2, AlertCircle, Plus, Eye, EyeOff } from 'lucide-react'

interface BannerRecord {
    id: string
    image_url: string
    title: string | null
    is_active: boolean
    sort_order: number
}

export default function AdminSettingsPage() {
    const [banners, setBanners] = useState<BannerRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchBanners()
    }, [])

    async function fetchBanners() {
        const { data } = await supabase
            .from('banners')
            .select('*')
            .order('sort_order', { ascending: true })

        if (data) setBanners(data)
        setLoading(false)
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setMessage(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `banner-${Math.random()}.${fileExt}`
            const filePath = `banners/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('books')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('books')
                .getPublicUrl(filePath)

            // Add to banners table
            const { data: newBanner, error: insertError } = await supabase
                .from('banners')
                .insert({
                    image_url: publicUrl,
                    title: file.name.split('.')[0],
                    sort_order: banners.length
                })
                .select()
                .single()

            if (insertError) throw insertError

            setBanners([...banners, newBanner])
            setMessage({ type: 'success', text: 'Banner added successfully!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload banner' })
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    async function toggleActive(id: string, currentStatus: boolean) {
        const { error } = await supabase
            .from('banners')
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setBanners(banners.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b))
        }
    }

    async function deleteBanner(id: string) {
        if (!confirm('Are you sure you want to delete this banner?')) return

        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id)

        if (!error) {
            setBanners(banners.filter(b => b.id !== id))
            setMessage({ type: 'success', text: 'Banner deleted' })
        } else {
            setMessage({ type: 'error', text: 'Failed to delete banner' })
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">Banner Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Add and manage multiple announcement banners.</p>
                </div>

                <label className={`inline-flex items-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    <span>Add New Banner</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {message && (
                <div className={`mb-8 flex items-center space-x-3 p-4 rounded-2xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {banners.map((banner) => (
                    <div key={banner.id} className={`group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 transition-all hover:shadow-xl ${banner.is_active ? 'ring-slate-200' : 'ring-slate-100 opacity-60'}`}>
                        <div className="aspect-[21/9] w-full overflow-hidden bg-slate-50">
                            <img src={banner.image_url} alt={banner.title || ''} className="h-full w-full object-cover" />
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-slate-900 truncate">{banner.title || 'Untitled Banner'}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    {banner.is_active ? 'Active' : 'Hidden'}
                                </p>
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => toggleActive(banner.id, banner.is_active)}
                                    className={`p-2 rounded-xl transition-all ${banner.is_active ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-emerald-600 bg-emerald-50'}`}
                                    title={banner.is_active ? 'Hide Banner' : 'Show Banner'}
                                >
                                    {banner.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={() => deleteBanner(banner.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete Banner"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                        <div className="bg-slate-100 p-8 rounded-full mb-6">
                            <ImageIcon className="h-16 w-16 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">No banners yet</h3>
                        <p className="mt-2 text-slate-500 font-medium">Upload announcement images to show them on the homepage.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
