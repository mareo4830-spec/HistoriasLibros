/*
# Create memory book orders and image storage

1. New Tables
- `memory_book_orders`
- `id` (uuid, primary key): public order identifier used to organize uploaded photos.
- `email` (text): buyer email address for the order.
- `motive` (text): selected dedication occasion or message.
- `dedication` (text): optional personal dedication text.
- `photo_count` (integer): number of photos submitted with the order.
- `status` (text): order lifecycle status, initially `received`.
- `created_at` (timestamptz): creation time.

2. Storage
- Create the public `memory-book-photos` bucket for the book images.
- Upload paths are organized under each order UUID.

3. Security
- Enable row-level security on `memory_book_orders`.
- Allow anonymous and authenticated users to create and read orders because this is a no-login purchase flow.
- Allow anonymous and authenticated users to update and delete orders so the client can complete or recover a submission.
- Allow image uploads and reads within the public bucket.
*/

CREATE TABLE IF NOT EXISTS public.memory_book_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  motive text NOT NULL CHECK (motive IN ('Te quiero mucho', 'Feliz cumpleaños', 'Feliz aniversario', 'Para alguien especial')),
  dedication text NOT NULL DEFAULT '' CHECK (char_length(dedication) <= 2000),
  photo_count integer NOT NULL DEFAULT 0 CHECK (photo_count BETWEEN 0 AND 30),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'ready')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_book_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read memory book orders" ON public.memory_book_orders;
CREATE POLICY "Public can read memory book orders"
ON public.memory_book_orders FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Public can create memory book orders" ON public.memory_book_orders;
CREATE POLICY "Public can create memory book orders"
ON public.memory_book_orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update memory book orders" ON public.memory_book_orders;
CREATE POLICY "Public can update memory book orders"
ON public.memory_book_orders FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete memory book orders" ON public.memory_book_orders;
CREATE POLICY "Public can delete memory book orders"
ON public.memory_book_orders FOR DELETE
TO anon, authenticated
USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-book-photos', 'memory-book-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can upload memory book photos" ON storage.objects;
CREATE POLICY "Public can upload memory book photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'memory-book-photos');

DROP POLICY IF EXISTS "Public can view memory book photos" ON storage.objects;
CREATE POLICY "Public can view memory book photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'memory-book-photos');

DROP POLICY IF EXISTS "Public can update memory book photos" ON storage.objects;
CREATE POLICY "Public can update memory book photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'memory-book-photos')
WITH CHECK (bucket_id = 'memory-book-photos');

DROP POLICY IF EXISTS "Public can delete memory book photos" ON storage.objects;
CREATE POLICY "Public can delete memory book photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'memory-book-photos');