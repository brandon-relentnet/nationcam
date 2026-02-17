package handler

import (
	"net/http"

	"github.com/brandon-relentnet/nationcam/api/internal/cache"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Health handles GET /health — checks DB and Redis connectivity.
func Health(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		if err := pool.Ping(ctx); err != nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{
				"status": "unhealthy",
				"error":  "database: " + err.Error(),
			})
			return
		}

		if err := c.Ping(ctx); err != nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{
				"status": "unhealthy",
				"error":  "redis: " + err.Error(),
			})
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
	}
}
