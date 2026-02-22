'use client'

import { ImageCarousel } from './ImageCarousel'
import { ShoppingCart } from 'lucide-react'

interface Book {
    id: string
    title: string
    description: string
    real_price: number
    discount_price: number
    sold_count: number
    is_active: boolean
    images: string[]
}

interface BookCardProps {
    book: Book
    onBuy: (book: Book) => void
}

export function BookCard({ book, onBuy }: BookCardProps) {
    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-emerald-100">
            <div className="aspect-[3/4] w-full shrink-0">
                <ImageCarousel images={book.images} alt={book.title} />
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{book.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {book.sold_count} sold
                    </span>
                </div>

                <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {book.description}
                </p>

                <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-rose-600">${book.discount_price}</span>
                        <span className="text-sm font-medium text-slate-400 line-through">${book.real_price}</span>
                    </div>

                    <button
                        onClick={() => onBuy(book)}
                        className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Buy</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
