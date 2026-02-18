package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func readJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

// paginatedResponse wraps data with pagination metadata.
type paginatedResponse struct {
	Data    any   `json:"data"`
	Total   int32 `json:"total"`
	Page    int32 `json:"page"`
	PerPage int32 `json:"per_page"`
}

// parsePagination extracts page and per_page from query params.
// Defaults: page=1, per_page=100. Max per_page=500.
func parsePagination(r *http.Request) (limit, offset, page, perPage int32) {
	page = 1
	perPage = 100

	if p := r.URL.Query().Get("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			page = int32(v)
		}
	}
	if pp := r.URL.Query().Get("per_page"); pp != "" {
		if v, err := strconv.Atoi(pp); err == nil && v > 0 {
			perPage = int32(v)
			if perPage > 500 {
				perPage = 500
			}
		}
	}

	limit = perPage
	offset = (page - 1) * perPage
	return
}
