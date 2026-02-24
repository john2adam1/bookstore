'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { BookCard } from '@/components/BookCard'
import { BuyModal } from '@/components/BuyModal'
import { Loader2, BookOpen } from 'lucide-react'

export default function ShopPage() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<any | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchBooks() {
      try {
        const { data, error } = await supabase
          .from('books')
          .select(`
            *,
            book_images (
              image_url,
              sort_order
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        const formattedBooks = data?.map((book: any) => ({
          ...book,
          images: book.book_images
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
            ?.map((img: any) => img.image_url) || []
        })) || []

        setBooks(formattedBooks)
      } catch (error: any) {
        console.error('Error fetching books:', error?.message || 'Unknown error');
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#002B5B]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 text-[#002B5B] text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="h-4 w-4" />
          <span>Premium Collection</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 sm:text-7xl max-w-3xl leading-[1.1]">
          O'qishni<span className="text-[#002B5B]"> boshlang!</span>
        </h1>
        <p className="max-w-xl text-lg text-slate-500 leading-relaxed font-medium">
          Siz qidirgan eng sara kitoblar endi bir joyda!
          <br />Ishonchli va tezkor yetkazib berish xizmati.
        </p>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBuy={(b) => setSelectedBook(b)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-slate-50 p-10 rounded-full mb-8 ring-1 ring-slate-100">
            <BookOpen className="h-20 w-20 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kutubxona bo'sh</h3>
          <p className="mt-3 text-slate-500 font-medium max-w-xs leading-relaxed">Hozirda sotuvda kitoblar mavjud emas. Tez orada yangi kitoblar qo'shiladi.</p>
        </div>
      )}

      {selectedBook && (
        <BuyModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  )
}
