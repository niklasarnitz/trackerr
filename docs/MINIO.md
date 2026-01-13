# Minio Integration

This project uses Minio for object storage to store movie posters and book covers.

## Configuration

Add the following environment variables to your `.env` file:

```env
MINIO_ENDPOINT="https://minio.app.niklas.service"
MINIO_PORT="443"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET="bookworm"
MINIO_USE_SSL="true"
```

## Folder Structure

All images are stored in the `bookworm` bucket with the following structure:

```
bookworm/
  trackerr/
    movies/
      {movieId}.jpg
    books/
      {bookId}.jpg
```

## Migration Script

To migrate existing movie posters from TMDB URLs to Minio:

```bash
bun run scripts/migrate-movie-posters.ts
```

This script will:

1. Download all existing movie posters from their current URLs
2. Upload them to Minio
3. Update the database with the new Minio URLs
4. Process in batches to avoid rate limits
5. Skip movies that are already using Minio

## How It Works

### Movie Posters

When a new movie is added:

1. Movie is created in the database without a poster
2. TMDB poster is downloaded in original quality
3. Poster is uploaded to Minio at `trackerr/movies/{movieId}.jpg`
4. Database is updated with the Minio URL

### Book Covers

When a new book is added:

1. Book is created in the database without a cover
2. Cover is downloaded from the external URL (Google Books, Open Library, etc.)
3. Cover is uploaded to Minio at `trackerr/books/{bookId}.jpg`
4. Database is updated with the Minio URL

### Image Serving

Next.js automatically handles image optimization when using the `<Image>` component. Simply pass the Minio URL as the `src` prop:

```tsx
<Image src={book.coverUrl} alt={book.title} width={200} height={300} />
```

Next.js will:

- Resize images on-demand for different screen sizes
- Convert to modern formats (WebP/AVIF) when supported
- Cache optimized images
- Lazy load images

## Notes

- The bucket is created automatically if it doesn't exist
- Original high-quality images are stored in Minio
- Next.js handles all resizing and optimization on the fly
- Failed uploads don't prevent movie/book creation (gracefully degraded)
