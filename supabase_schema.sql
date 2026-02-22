-- Create profiles table (minimal for admin role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  real_price NUMERIC NOT NULL,
  discount_price NUMERIC NOT NULL,
  sold_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create book_images table
CREATE TABLE IF NOT EXISTS public.book_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table (includes book_title for snapshot)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id),
  book_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
END $$;

-- Books Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Books are viewable by everyone." ON public.books;
    CREATE POLICY "Books are viewable by everyone." ON public.books FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Only admins can manage books." ON public.books;
    CREATE POLICY "Only admins can manage books." ON public.books FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
END $$;

-- Book Images Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Book images are viewable by everyone." ON public.book_images;
    CREATE POLICY "Book images are viewable by everyone." ON public.book_images FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Only admins can manage book images." ON public.book_images;
    CREATE POLICY "Only admins can manage book images." ON public.book_images FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
END $$;

-- Orders Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can insert an order." ON public.orders;
    CREATE POLICY "Anyone can insert an order." ON public.orders FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Only admins can manage orders." ON public.orders;
    CREATE POLICY "Only admins can manage orders." ON public.orders FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
END $$;

-- Function to increment sold_count
CREATE OR REPLACE FUNCTION public.increment_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET sold_count = sold_count + 1
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for orders
DROP TRIGGER IF EXISTS on_order_inserted ON public.orders;
CREATE TRIGGER on_order_inserted
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.increment_sold_count();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Setup (Run if not already created)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true);

-- Storage Policies for 'books' bucket
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'books');
    
    DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
    CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'books' AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
    CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (
      bucket_id = 'books' AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
    CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
      bucket_id = 'books' AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
END $$;
