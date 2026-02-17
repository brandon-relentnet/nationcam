package handler

import (
	"net/http"
	"strconv"

	"github.com/brandon-relentnet/nationcam/api/internal/cache"
	"github.com/brandon-relentnet/nationcam/api/internal/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ListSublocationsByState handles GET /states/{slug}/sublocations.
func ListSublocationsByState(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")

		// First resolve the state to get its ID.
		state, err := db.New(pool).GetStateBySlug(r.Context(), slug)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "state not found"})
			return
		}

		key := "sublocations:state:" + strconv.Itoa(int(state.StateID))
		cachedHandler(c, key, func(w http.ResponseWriter, r *http.Request) {
			rows, err := db.New(pool).ListSublocationsByState(r.Context(), state.StateID)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusOK, rows)
		})(w, r)
	}
}

// GetSublocation handles GET /sublocations/{slug}.
func GetSublocation(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")
		key := "sublocations:slug:" + slug

		cachedHandler(c, key, func(w http.ResponseWriter, r *http.Request) {
			row, err := db.New(pool).GetSublocationBySlug(r.Context(), slug)
			if err != nil {
				writeJSON(w, http.StatusNotFound, map[string]string{"error": "sublocation not found"})
				return
			}
			writeJSON(w, http.StatusOK, row)
		})(w, r)
	}
}

type createSublocationRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	StateID     int32  `json:"state_id"`
}

// CreateSublocation handles POST /sublocations (admin only).
func CreateSublocation(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createSublocationRequest
		if err := readJSON(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
			return
		}
		if req.Name == "" || req.StateID == 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name and state_id are required"})
			return
		}

		created, err := db.New(pool).CreateSublocation(r.Context(), db.CreateSublocationParams{
			Name:        req.Name,
			Description: req.Description,
			StateID:     req.StateID,
		})
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		// Re-fetch with JOINs to return the rich type (includes state_name, video_count).
		row, err := db.New(pool).GetSublocationByID(r.Context(), created.SublocationID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		_ = c.Invalidate(r.Context(), "sublocations:*")
		writeJSON(w, http.StatusCreated, row)
	}
}
