package handler

import (
	"github.com/brandon-relentnet/nationcam/api/internal/cache"
	mw "github.com/brandon-relentnet/nationcam/api/internal/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewRouter builds the Chi router with all routes and middleware.
func NewRouter(pool *pgxpool.Pool, c *cache.Cache, auth *mw.Auth, corsOrigins []string) *chi.Mux {
	r := chi.NewRouter()

	// Global middleware.
	r.Use(mw.Logger)
	r.Use(mw.CORS(corsOrigins))
	r.Use(auth.Authenticate)

	// Health.
	r.Get("/health", Health(pool, c))

	// States.
	r.Get("/states", ListStates(pool, c))
	r.Get("/states/{slug}", GetState(pool, c))
	r.With(mw.RequireAdmin).Post("/states", CreateState(pool, c))
	r.With(mw.RequireAdmin).Delete("/states/{slug}", DeleteState(pool, c))

	// Sublocations.
	r.Get("/states/{slug}/sublocations", ListSublocationsByState(pool, c))
	r.Get("/sublocations/{slug}", GetSublocation(pool, c))
	r.With(mw.RequireAdmin).Post("/sublocations", CreateSublocation(pool, c))

	// Videos.
	r.Get("/videos", ListVideos(pool, c))
	r.With(mw.RequireAdmin).Post("/videos", CreateVideo(pool, c))

	// Stream proxy — proxies external HLS manifests/segments to bypass CORS.
	r.Get("/stream-proxy", StreamProxy())

	return r
}
