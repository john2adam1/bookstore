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
        console.dir(error);
        if (error?.code) console.error('Error Code:', error.code);
        if (error?.details) console.error('Error Details:', error.details);
        if (error?.hint) console.error('Error Hint:', error.hint);
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6 mb-20">
        <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
          <BookOpen className="h-10 w-10" />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl max-w-3xl">
          Discover Your Next <span className="text-emerald-600">Great Read</span>
        </h1>
        <p className="max-w-xl text-lg text-slate-500 leading-relaxed font-medium">
          Explore our curated collection of bestselling books. Premium quality, best prices, delivered to your door.
        </p>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBuy={(b) => setSelectedBook(b)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-50 p-8 rounded-full mb-6">
            <BookOpen className="h-20 w-20 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No books found</h3>
          <p className="mt-2 text-slate-500 font-medium max-w-xs">Our library is currently resting. Check back soon for new arrivals.</p>
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
