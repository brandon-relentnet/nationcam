package handler

import (
	"net/http"
	"strconv"

	"github.com/brandon-relentnet/nationcam/api/internal/cache"
	"github.com/brandon-relentnet/nationcam/api/internal/db"
	"github.com/brandon-relentnet/nationcam/api/internal/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ListVideos handles GET /videos with optional query params: state_id, sublocation_id.
func ListVideos(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()

		if subIDStr := q.Get("sublocation_id"); subIDStr != "" {
			subID, err := strconv.Atoi(subIDStr)
			if err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid sublocation_id"})
				return
			}
			key := "videos:sublocation:" + subIDStr
			cachedHandler(c, key, func(w http.ResponseWriter, r *http.Request) {
				subID32 := int32(subID)
				rows, err := db.New(pool).ListVideosBySublocation(r.Context(), &subID32)
				if err != nil {
					writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
					return
				}
				writeJSON(w, http.StatusOK, rows)
			})(w, r)
			return
		}

		if stateIDStr := q.Get("state_id"); stateIDStr != "" {
			stateID, err := strconv.Atoi(stateIDStr)
			if err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid state_id"})
				return
			}
			key := "videos:state:" + stateIDStr
			cachedHandler(c, key, func(w http.ResponseWriter, r *http.Request) {
				rows, err := db.New(pool).ListVideosByState(r.Context(), int32(stateID))
				if err != nil {
					writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
					return
				}
				writeJSON(w, http.StatusOK, rows)
			})(w, r)
			return
		}

		// No filter — return all active videos.
		cachedHandler(c, "videos:all", func(w http.ResponseWriter, r *http.Request) {
			rows, err := db.New(pool).ListVideos(r.Context())
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusOK, rows)
		})(w, r)
	}
}

type createVideoRequest struct {
	Title          string `json:"title"`
	Src            string `json:"src"`
	Type           string `json:"type"`
	StateID        int32  `json:"state_id"`
	SublocationID  *int32 `json:"sublocation_id"`
	Status         string `json:"status"`
}

// CreateVideo handles POST /videos (admin only).
func CreateVideo(pool *pgxpool.Pool, c *cache.Cache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createVideoRequest
		if err := readJSON(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
			return
		}
		if req.Title == "" || req.Src == "" || req.StateID == 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title, src, and state_id are required"})
			return
		}
		if req.Type == "" {
			req.Type = "application/x-mpegURL"
		}
		if req.Status == "" {
			req.Status = "active"
		}

		created, err := db.New(pool).CreateVideo(r.Context(), db.CreateVideoParams{
			Title:         req.Title,
			Src:           req.Src,
			Type:          req.Type,
			StateID:       req.StateID,
			SublocationID: req.SublocationID,
			Status:        req.Status,
			CreatedBy:     middleware.UserID(r.Context()),
		})
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		// Re-fetch with JOINs to return the rich type (includes state_name, sublocation_name).
		row, err := db.New(pool).GetVideoByID(r.Context(), created.VideoID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		_ = c.Invalidate(r.Context(), "videos:*")
		// Also invalidate state caches since video counts change.
		_ = c.Invalidate(r.Context(), "states:*")
		writeJSON(w, http.StatusCreated, row)
	}
}
