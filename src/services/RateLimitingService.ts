import { DIContainer } from './DIContainer';

export interface RateLimitOptions {
    maxRequests: number; // Maximum number of requests allowed
    timeWindow: number; // Time window in milliseconds
}

export interface RateLimitInfo {
    remaining: number; // Number of requests remaining in the current window
    resetTime: number; // Timestamp when the current window resets
}

/**
 * A service for implementing rate limiting on various actions or events.
 * It tracks usage per key (e.g., user ID, IP address) and enforces defined limits.
 */
export class RateLimitingService {
    // Map to store usage for each key: key -> { timestamp of last request, request count }
    private usage: Map<string, { lastRequestTime: number; count: number }> = new Map();
    // Map to store defined rate limits: limitName -> RateLimitOptions
    private limits: Map<string, RateLimitOptions> = new Map();

    constructor() {
        // Register this service in the DI container if needed elsewhere
        // DIContainer.instance.register(RateLimitingService, this);
    }

    /**
     * Defines a new rate limit or updates an existing one.
     * @param limitName A unique name for this rate limit (e.g., 'loginAttempts', 'chatMessages').
     * @param options The rate limit options (maxRequests, timeWindow).
     */
    public defineLimit(limitName: string, options: RateLimitOptions): void {
        this.limits.set(limitName, options);
        console.log(`[RateLimitingService] Defined rate limit '${limitName}': ${options.maxRequests} requests per ${options.timeWindow}ms.`);
    }

    /**
     * Checks if a request is allowed for a given key under a specific rate limit.
     * If allowed, it increments the request count.
     * @param limitName The name of the rate limit to check against.
     * @param key The unique key for the entity making the request (e.g., user ID, IP address).
     * @returns True if the request is allowed, false otherwise.
     */
    public isAllowed(limitName: string, key: string): boolean {
        const limit = this.limits.get(limitName);
        if (!limit) {
            console.warn(`[RateLimitingService] Rate limit '${limitName}' not defined. Request allowed by default.`);
            return true; // If limit not defined, allow by default
        }

        const now = Date.now();
        let userUsage = this.usage.get(key);

        if (!userUsage || (now - userUsage.lastRequestTime) > limit.timeWindow) {
            // Reset usage if no previous usage or window has passed
            userUsage = { lastRequestTime: now, count: 1 };
            this.usage.set(key, userUsage);
            return true;
        } else {
            // Increment count within the current window
            userUsage.count++;
            this.usage.set(key, userUsage);
            return userUsage.count <= limit.maxRequests;
        }
    }

    /**
     * Gets the current rate limit information for a given key and limit name.
     * @param limitName The name of the rate limit.
     * @param key The unique key for the entity.
     * @returns RateLimitInfo object, or null if the limit or key usage is not found.
     */
    public getLimitInfo(limitName: string, key: string): RateLimitInfo | null {
        const limit = this.limits.get(limitName);
        const userUsage = this.usage.get(key);

        if (!limit || !userUsage) {
            return null;
        }

        const remainingTime = Math.max(0, limit.timeWindow - (Date.now() - userUsage.lastRequestTime));
        const remainingRequests = Math.max(0, limit.maxRequests - userUsage.count);

        return {
            remaining: remainingRequests,
            resetTime: userUsage.lastRequestTime + limit.timeWindow,
        };
    }

    /**
     * Resets the rate limit for a specific key.
     * @param key The unique key for the entity.
     */
    public resetLimit(key: string): void {
        this.usage.delete(key);
        console.log(`[RateLimitingService] Rate limit for key '${key}' reset.`);
    }
}
