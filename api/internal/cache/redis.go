package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// DefaultTTL is the default cache duration for GET responses.
const DefaultTTL = 5 * time.Minute

// Cache wraps a Redis client with convenience methods for caching.
type Cache struct {
	client *redis.Client
}

// New creates a Cache from a Redis connection URL (e.g. "redis://localhost:6379/0").
func New(ctx context.Context, redisURL string) (*Cache, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}

	client := redis.NewClient(opts)
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &Cache{client: client}, nil
}

// Get returns the cached value for key, or "" if not found.
func (c *Cache) Get(ctx context.Context, key string) (string, error) {
	val, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

// Set stores a value in cache with the given TTL.
func (c *Cache) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return c.client.Set(ctx, key, value, ttl).Err()
}

// Invalidate deletes all keys matching the given pattern (e.g. "states:*").
func (c *Cache) Invalidate(ctx context.Context, pattern string) error {
	iter := c.client.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		if err := c.client.Del(ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}
	return iter.Err()
}

// Ping checks that Redis is reachable.
func (c *Cache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx).Err()
}

// Close shuts down the Redis client.
func (c *Cache) Close() error {
	return c.client.Close()
}
