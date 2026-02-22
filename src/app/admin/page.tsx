import { createClient } from '@/lib/supabase-server'
import { BookOpen, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
    const supabase = await createClient()

    const { data: orders } = await supabase
        .from('orders')
        .select('*, books(discount_price)')
        .order('created_at', { ascending: false })

    const { count: booksCount } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true })

    const totalSales = orders?.reduce((acc, order: any) => acc + (order.books?.discount_price || 0), 0) || 0

    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Welcome back to the management system.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
                {/* Total Books Card */}
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Inventory</span>
                    </div>
                    <div className="mt-6 flex items-baseline justify-between">
                        <span className="text-4xl font-black text-slate-900">{booksCount ?? 0}</span>
                        <Link href="/admin/books" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 flex items-center transition-colors">
                            Manage <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-500">Total Books</p>
                </div>

                {/* Total Orders Card */}
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sales</span>
                    </div>
                    <div className="mt-6 flex items-baseline justify-between">
                        <span className="text-4xl font-black text-slate-900">{orders?.length || 0}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-500">Total Orders</p>
                </div>

                {/* Total Revenue Card */}
                <div className="rounded-3xl bg-slate-900 p-8 shadow-xl">
                    <div className="flex items-center justify-between text-slate-400">
                        <div className="rounded-2xl bg-slate-800 p-3 text-emerald-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">Revenue</span>
                    </div>
                    <div className="mt-6 flex items-baseline justify-between">
                        <span className="text-4xl font-black text-white">${totalSales.toFixed(2)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-400">Overall Sales</p>
                </div>
            </div>

            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                    <h2 className="text-xl font-black text-slate-900">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Book</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders?.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="whitespace-nowrap px-8 py-5 text-sm font-bold text-slate-900">{order.full_name}</td>
                                    <td className="whitespace-nowrap px-8 py-5 text-sm font-medium text-slate-600">{order.book_title}</td>
                                    <td className="whitespace-nowrap px-8 py-5 text-sm font-medium text-slate-500">{order.phone}</td>
                                    <td className="whitespace-nowrap px-8 py-5 text-sm font-medium text-slate-400 text-right">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">
                                        No orders found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

