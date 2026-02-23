import { createClient } from '@/lib/supabase-server'
import { ShoppingBag, Search, Calendar, User, Phone } from 'lucide-react'
import { format } from 'date-fns'

export default async function AdminOrdersPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const supabase = await createClient()
    const query = searchParams.q || ''

    let supabaseQuery = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (query) {
        supabaseQuery = supabaseQuery.or(`book_title.ilike.%${query}%,full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    }

    const { data: orders } = await supabaseQuery

    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900">Orders / Leads</h1>
                <p className="text-slate-500 mt-1 font-medium">Track all book purchases and customer inquiries.</p>
            </div>

            <div className="mb-8 flex items-center justify-between gap-4">
                <form className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search by title, name, or phone..."
                        className="w-full rounded-2xl border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                </form>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Book Title</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Customer</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders?.map((order) => (
                                <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-5">
                                        <div className="flex items-center text-slate-600 font-medium">
                                            <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                            {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <ShoppingBag className="mr-3 h-5 w-5 text-emerald-500" />
                                            <span className="font-black text-slate-900">{order.book_title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center text-slate-900 font-bold">
                                            <User className="mr-2 h-4 w-4 text-slate-400" />
                                            {order.full_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <a href={`tel:${order.phone}`} className="inline-flex items-center text-emerald-600 font-black hover:underline">
                                            <Phone className="mr-2 h-4 w-4" />
                                            {order.phone}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-slate-100 p-6 rounded-full mb-4">
                                                <ShoppingBag className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">No orders yet</h3>
                                            <p className="text-slate-500 font-medium">When users buy books, they will appear here.</p>
                                        </div>
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
