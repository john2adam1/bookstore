'use client';

import { Search, ShoppingBag, Calendar, X, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Book {
    id: string;
    title: string;
}

interface OrderFiltersProps {
    books: Book[] | null;
    initialQuery: string;
    initialBookId: string;
    initialFrom: string;
    initialTo: string;
}

export function OrderFilters({
    books,
    initialQuery,
    initialBookId,
    initialFrom,
    initialTo
}: OrderFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams(searchParams.toString());

        formData.forEach((value, key) => {
            if (value) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        router.push(`/admin/orders?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        name="q"
                        defaultValue={initialQuery}
                        placeholder="Search by title, name, or phone..."
                        className="w-full rounded-2xl border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            name="bookId"
                            defaultValue={initialBookId}
                            className="rounded-xl border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm font-bold focus:border-emerald-500 outline-none shadow-sm appearance-none min-w-[160px]"
                        >
                            <option value="">All Books</option>
                            {books?.map((book) => (
                                <option key={book.id} value={book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            name="from"
                            defaultValue={initialFrom}
                            className="text-xs font-bold outline-none border-none p-0 focus:ring-0"
                        />
                        <span className="text-slate-300">→</span>
                        <input
                            type="date"
                            name="to"
                            defaultValue={initialTo}
                            className="text-xs font-bold outline-none border-none p-0 focus:ring-0"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>

                        {(initialQuery || initialBookId || initialFrom || initialTo) && (
                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
