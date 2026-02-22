'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, ArrowLeft, Upload, X, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewBookPage() {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [realPrice, setRealPrice] = useState('')
    const [discountPrice, setDiscountPrice] = useState('')
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const router = useRouter()
    const supabase = createClient()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setImages((prev) => [...prev, ...newFiles])

            const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
            setPreviews((prev) => [...prev, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Insert book
            const { data: book, error: bookError } = await supabase
                .from('books')
                .insert({
                    title,
                    description,
                    real_price: parseFloat(realPrice),
                    discount_price: parseFloat(discountPrice),
                })
                .select()
                .single()

            if (bookError) throw bookError

            // 2. Upload images and insert records
            if (images.length > 0) {
                const uploadPromises = images.map(async (file, index) => {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${book.id}/${Math.random()}.${fileExt}`

                    const { error: uploadError, data } = await supabase.storage
                        .from('books')
                        .upload(fileName, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('books')
                        .getPublicUrl(fileName)

                    return {
                        book_id: book.id,
                        image_url: publicUrl,
                        sort_order: index,
                    }
                })

                const imageRecords = await Promise.all(uploadPromises)
                const { error: imagesError } = await supabase
                    .from('book_images')
                    .insert(imageRecords)

                if (imagesError) throw imagesError
            }

            router.push('/admin/books')
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'Error creating book')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <Link href="/admin/books" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-emerald-600 transition-colors mb-8 uppercase tracking-widest">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inventory
            </Link>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 ring-1 ring-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                    <h1 className="text-3xl font-black text-slate-900">Add New Book</h1>
                    <p className="mt-2 text-slate-500 font-medium tracking-tight">List a new masterpiece in your collection.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Book Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                    placeholder="The Art of Coding"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Description</label>
                                <textarea
                                    rows={5}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none"
                                    placeholder="What's this story about?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={realPrice}
                                        onChange={(e) => setRealPrice(e.target.value)}
                                        className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                        placeholder="29.99"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Discount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={discountPrice}
                                        onChange={(e) => setDiscountPrice(e.target.value)}
                                        className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
                                        placeholder="19.99"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Gallery</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100 shadow-sm transition-all hover:shadow-md">
                                            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-3 right-3 p-2 bg-slate-900/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-3 left-3 bg-emerald-600 text-[10px] font-black text-white px-2 py-1 rounded-lg uppercase tracking-widest">
                                                    Cover
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-4 border-dashed border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-emerald-100 cursor-pointer transition-all px-6 text-center group">
                                        <div className="bg-white p-4 rounded-full shadow-sm group-hover:shadow-md transition-all">
                                            <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Images</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Drag files to reorder (Coming soon)</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center space-x-3 rounded-2xl bg-emerald-600 px-10 py-5 text-sm font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Syncing Library...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-6 w-6" />
                                    <span>List in Store</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
