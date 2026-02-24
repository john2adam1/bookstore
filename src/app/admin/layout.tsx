'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LayoutDashboard, BookOpen, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 z-50
                w-64 bg-slate-900 text-white min-h-screen flex flex-col
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8">
                    <h2 className="text-2xl font-black tracking-tighter text-emerald-400">Admin</h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold group"
                    >
                        <LayoutDashboard className="h-5 w-5 text-slate-400 group-hover:text-emerald-400" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/books"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold group"
                    >
                        <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-emerald-400" />
                        <span>Books</span>
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold group"
                    >
                        <ShoppingBag className="h-5 w-5 text-slate-400 group-hover:text-emerald-400" />
                        <span>Orders</span>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold group"
                    >
                        <Settings className="h-5 w-5 text-slate-400 group-hover:text-emerald-400" />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="p-6 mt-auto">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl hover:bg-rose-900/40 text-rose-400 transition-all font-bold">
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto min-h-screen">
                <div className="bg-white md:hidden p-4 border-b flex justify-between items-center px-6 sticky top-0 z-30">
                    <h2 className="text-xl font-black text-slate-900">Admin Panel</h2>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-slate-600 active:bg-slate-100 rounded-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                {children}
            </main>
        </div>
    )
}
