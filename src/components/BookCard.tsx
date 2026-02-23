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
        <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:shadow-blue-900/5 hover:ring-blue-900/10">
            <div className="aspect-square w-full shrink-0">
                <ImageCarousel images={book.images} alt={book.title} />
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{book.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {book.sold_count} sold
                    </span>
                </div>

                <p className="mt-1 text-xs text-slate-500 line-clamp-1 font-medium">
                    {book.description}
                </p>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-rose-600">${book.discount_price}</span>
                        <span className="text-[10px] font-medium text-slate-400 line-through">${book.real_price}</span>
                    </div>

                    <button
                        onClick={() => onBuy(book)}
                        className="inline-flex items-center space-x-1.5 rounded-lg bg-[#002B5B] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#003d7a] active:scale-95"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Buy</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
