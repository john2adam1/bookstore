import { createClient } from '@/lib/supabase-server'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function AdminBooksPage(props: {
    searchParams: Promise<any>
}) {
    console.log('--- AdminBooksPage start ---')
    try {
        const _params = await props.searchParams
        console.log('--- searchParams awaited ---')

        const supabase = await createClient()
        console.log('--- supabase client created ---')

        const { data: books, error } = await supabase
            .from('books')
            .select(`
          *,
          book_images (image_url)
        `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('--- Supabase fetch error:', error)
        } else {
            console.log('--- Books fetched successfully, count:', books?.length)
        }

        return (
            <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Book Management</h1>
                        <p className="text-slate-500 mt-1 font-medium">Add, edit, or remove books from your store.</p>
                    </div>
                    <Link
                        href="/admin/books/new"
                        className="inline-flex items-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add New Book</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {books?.map((book: any) => (
                        <div key={book.id} className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-emerald-100">
                            <div className="aspect-[3/4] w-full overflow-hidden bg-slate-50">
                                {book.book_images?.[0] ? (
                                    <img
                                        src={book.book_images[0].image_url}
                                        alt={book.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-300 italic">
                                        No images
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="text-lg font-black text-slate-900 line-clamp-1">{book.title}</h3>
                                <div className="mt-2 flex items-center space-x-2">
                                    <span className="text-lg font-black text-emerald-600">${book.discount_price}</span>
                                    <span className="text-sm font-medium text-slate-400 line-through">${book.real_price}</span>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <div className="flex items-center space-x-1">
                                        <Link
                                            href={`/admin/books/${book.id}`}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                            title="Edit Book"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                        <button
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete Book"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!book.is_active && (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!books || books.length === 0) && (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                            <div className="bg-slate-100 p-8 rounded-full mb-6">
                                <Plus className="h-16 w-16 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Your library is empty</h3>
                            <p className="mt-2 text-slate-500 font-medium max-w-xs">Start building your collection by adding your first book.</p>
                            <Link
                                href="/admin/books/new"
                                className="mt-8 inline-flex items-center space-x-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add First Book</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        )
    } catch (err) {
        console.error('--- Critical error in AdminBooksPage:', err)
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="bg-rose-50 p-12 rounded-[3rem] border-2 border-dashed border-rose-100">
                    <h2 className="text-2xl font-black text-rose-600 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 font-medium">We couldn't load the books. Please check the server logs.</p>
                </div>
            </div>
        )
    }
}
