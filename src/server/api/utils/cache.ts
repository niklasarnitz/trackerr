/**
 * Generic Cached Async Function
 * Manages caching of async function results with TTL and deduplication
 */
export class CachedAsyncFunction<T> {
  private cache: T | null = null;
  private fetchedAt: number = 0;
  private inFlight: Promise<T> | null = null;

  /**
   * Create a new cached async function
   * @param ttl - Time to live in milliseconds
   * @param fetcher - Async function to fetch and cache result
   */
  constructor(
    private ttl: number,
    private fetcher: () => Promise<T>,
  ) {}

  /**
   * Get cached value or fetch fresh value if expired
   * Deduplicates concurrent requests
   * @returns Cached or fresh value
   */
  async get(): Promise<T> {
    const now = Date.now();

    // Return cached value if still valid
    if (this.cache !== null && now - this.fetchedAt < this.ttl) {
      return this.cache;
    }

    // Return in-flight promise if request is already in progress
    if (this.inFlight !== null) {
      return this.inFlight;
    }

    // Fetch new value
    this.inFlight = this.fetcher();
    try {
      this.cache = await this.inFlight;
      this.fetchedAt = Date.now();
      return this.cache;
    } finally {
      this.inFlight = null;
    }
  }

  /**
   * Invalidate cache, forcing a fresh fetch on next get()
   */
  invalidate(): void {
    this.cache = null;
    this.fetchedAt = 0;
  }

  /**
   * Reset all state including in-flight requests
   */
  reset(): void {
    this.cache = null;
    this.fetchedAt = 0;
    this.inFlight = null;
  }
}
