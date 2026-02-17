package handler

import (
	"net/http"

	"github.com/brandon-relentnet/nationcam/api/internal/cache"
	"github.com/brandon-relentnet/nationcam/api/internal/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const statesAllKey = "states:all"

// ListStates handles GET /states — returns all states with video counts (cached).
func ListStates(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return cachedHandler(c, statesAllKey, func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.New(pool).ListStates(r.Context())
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, rows)
	})
}

// GetState handles GET /states/{slug} — returns a single state by slug (cached).
func GetState(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")
		key := "states:slug:" + slug

		cachedHandler(c, key, func(w http.ResponseWriter, r *http.Request) {
			row, err := db.New(pool).GetStateBySlug(r.Context(), slug)
			if err != nil {
				writeJSON(w, http.StatusNotFound, map[string]string{"error": "state not found"})
				return
			}
			writeJSON(w, http.StatusOK, row)
		})(w, r)
	}
}

// DeleteState handles DELETE /states/{slug} — deletes a state and cascades (admin only).
func DeleteState(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")
		if slug == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "slug is required"})
			return
		}

		if err := db.New(pool).DeleteState(r.Context(), slug); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		_ = c.Invalidate(r.Context(), "states:*")
		_ = c.Invalidate(r.Context(), "sublocations:*")
		_ = c.Invalidate(r.Context(), "videos:*")
		w.WriteHeader(http.StatusNoContent)
	}
}

type createStateRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// CreateState handles POST /states — creates a new state (admin only).
func CreateState(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createStateRequest
		if err := readJSON(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
			return
		}
		if req.Name == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name is required"})
			return
		}

		created, err := db.New(pool).CreateState(r.Context(), db.CreateStateParams{
			Name:        req.Name,
			Description: req.Description,
		})
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		// Re-fetch with JOINs to return the rich type (includes video_count).
		row, err := db.New(pool).GetStateByID(r.Context(), created.StateID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		_ = c.Invalidate(r.Context(), "states:*")
		writeJSON(w, http.StatusCreated, row)
	}
}
