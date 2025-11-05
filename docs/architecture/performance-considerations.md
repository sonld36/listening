# Performance Considerations

## From NFRs
- Pre-processed video clips (10 seconds each)
- CDN delivery via Cloudflare for video content
- Database connection pooling via Neon
- Server-side caching with TanStack Query

## Optimization Strategies
- Lazy loading for video components
- Image optimization with Next.js Image
- Code splitting per route
- Prefetching next clips during playback
- Debounced autosave for progress
