package middleware

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

// RateLimiter implements a simple sliding-window rate limiter.
// It is global (not per-IP) since access is controlled by API key.
type RateLimiter struct {
	mu       sync.Mutex
	max      int
	window   time.Duration
	requests []time.Time
}

// NewRateLimiter creates a rate limiter that allows max requests per window.
func NewRateLimiter(max int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		max:    max,
		window: window,
	}
}

// Allow checks if a request is allowed and records it if so.
func (rl *RateLimiter) Allow() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)

	// Prune expired entries.
	valid := rl.requests[:0]
	for _, t := range rl.requests {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	rl.requests = valid

	if len(rl.requests) >= rl.max {
		return false
	}

	rl.requests = append(rl.requests, now)
	return true
}

// RateLimit returns middleware that enforces the rate limiter.
func RateLimit(rl *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !rl.Allow() {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				json.NewEncoder(w).Encode(map[string]string{"error": "rate limit exceeded, try again later"})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
