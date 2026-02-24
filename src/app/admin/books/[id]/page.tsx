'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, ArrowLeft, Upload, X, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ExistingImage {
    id: string;
    image_url: string;
}

export default function EditBookPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [realPrice, setRealPrice] = useState('')
    const [discountPrice, setDiscountPrice] = useState('')
    const [isActive, setIsActive] = useState(true)

    const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [newPreviews, setNewPreviews] = useState<string[]>([])
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([])

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const { data: book, error: bookError } = await supabase
                    .from('books')
                    .select('*, book_images(id, image_url)')
                    .eq('id', id)
                    .single()

                if (bookError) throw bookError

                setTitle(book.title)
                setDescription(book.description)
                setRealPrice(book.real_price.toString())
                setDiscountPrice(book.discount_price.toString())
                setIsActive(book.is_active)
                setExistingImages(book.book_images || [])
            } catch (error: any) {
                alert(error.message || 'Error fetching book')
                router.push('/admin/books')
            } finally {
                setLoading(false)
            }
        }

        fetchBook()
    }, [id, supabase, router])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setNewImages((prev) => [...prev, ...newFiles])

            const previews = newFiles.map((file) => URL.createObjectURL(file))
            setNewPreviews((prev) => [...prev, ...previews])
        }
    }

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index))
        setNewPreviews((prev) => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const removeExistingImage = (imageId: string) => {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
        setImagesToRemove((prev) => [...prev, imageId])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // 1. Update book details
            const { error: updateError } = await supabase
                .from('books')
                .update({
                    title,
                    description,
                    real_price: parseFloat(realPrice),
                    discount_price: parseFloat(discountPrice),
                    is_active: isActive,
                })
                .eq('id', id)

            if (updateError) throw updateError

            // 1.1 Sync title in orders
            const { error: syncError } = await supabase
                .from('orders')
                .update({ book_title: title })
                .eq('book_id', id)

            if (syncError) throw syncError

            // 2. Remove selected images
            if (imagesToRemove.length > 0) {
                const { error: removeError } = await supabase
                    .from('book_images')
                    .delete()
                    .in('id', imagesToRemove)

                if (removeError) throw removeError
            }

            // 3. Upload new images
            if (newImages.length > 0) {
                const uploadPromises = newImages.map(async (file, index) => {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${id}/${Math.random()}.${fileExt}`

                    const { error: uploadError } = await supabase.storage
                        .from('books')
                        .upload(fileName, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('books')
                        .getPublicUrl(fileName)

                    return {
                        book_id: id,
                        image_url: publicUrl,
                        sort_order: existingImages.length + index,
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
            alert(error.message || 'Error updating book')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return

        setSaving(true)
        try {
            // Book images will be deleted automatically if CASCADE is set in DB, 
            // but let's be safe and delete them first or trust the DB.
            // According to schema, book_images references books(id) with CASCADE.

            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', id)

            if (error) throw error

            router.push('/admin/books')
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'Error deleting book')
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <Link href="/admin/books" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Inventory
                </Link>
                <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="inline-flex items-center space-x-2 text-rose-500 hover:text-rose-600 font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Book</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 ring-1 ring-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                    <h1 className="text-3xl font-black text-slate-900">Edit Book</h1>
                    <p className="mt-2 text-slate-500 font-medium tracking-tight">Update your masterpiece's details.</p>
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
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 ml-1">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active and visible in store</label>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Gallery</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Existing Images */}
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100 shadow-sm transition-all hover:shadow-md">
                                            <img src={img.image_url} alt="Book" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(img.id)}
                                                className="absolute top-3 right-3 p-2 bg-slate-900/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New Images Previews */}
                                    {newPreviews.map((preview, index) => (
                                        <div key={index} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-emerald-50 ring-1 ring-emerald-100 shadow-sm transition-all hover:shadow-md">
                                            <img src={preview} alt="New Preview" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-3 right-3 p-2 bg-slate-900/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="absolute top-3 left-3 bg-emerald-600 text-[10px] font-black text-white px-2 py-1 rounded-lg uppercase tracking-widest">
                                                New
                                            </div>
                                        </div>
                                    ))}

                                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-4 border-dashed border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-emerald-100 cursor-pointer transition-all px-6 text-center group">
                                        <div className="bg-white p-4 rounded-full shadow-sm group-hover:shadow-md transition-all">
                                            <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Add More</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center space-x-3 rounded-2xl bg-emerald-600 px-10 py-5 text-sm font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-6 w-6" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
