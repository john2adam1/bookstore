# Book Store Web Application

A modern, responsive e-commerce application built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Public Shop**: Browse books with high-quality image carousels, detailed descriptions, and real-time pricing highlighting discounts.
- **Admin Dashboard**: Role-based access to manage inventory, view orders, and track sales performance.
- **Role-Based Auth**: Secure authentication with Supabase, with automatic profile creation and restricted admin routes.
- **Database Triggers**: Automated `sold_count` increments on every order.
- **Multi-Image Uploads**: Admin can upload multiple images per book directly to Supabase Storage.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend/DB**: Supabase (Auth, PostgreSQL, Storage, RLS).

## Getting Started

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and execute the contents of `supabase_schema.sql` (found in the root directory).
3. Go to **Storage**, create a new bucket named `books`, and set it to **Public**.

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
npm run dev
```

### 5. Promoting an Admin
1. Register a new account through the `/login` page.
2. In the Supabase **Table Editor**, go to the `profiles` table and change the `role` from `'user'` to `'admin'` for your account.

## Project Structure
- `src/app`: Next.js pages and layouts.
- `src/components`: Reusable UI components (Navbar, BookCard, Carousel, etc.).
- `src/lib`: Supabase client and middleware configurations.
- `supabase_schema.sql`: Full database schema including RLS and triggers.
