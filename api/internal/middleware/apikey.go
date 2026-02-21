package middleware

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
)

// RequireAPIKey returns middleware that validates an API key from the
// X-API-Key header or apikey query parameter. Uses constant-time
// comparison to prevent timing attacks.
func RequireAPIKey(key string) func(http.Handler) http.Handler {
	keyBytes := []byte(key)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			provided := r.Header.Get("X-API-Key")
			if provided == "" {
				provided = r.URL.Query().Get("apikey")
			}

			if provided == "" || subtle.ConstantTimeCompare([]byte(provided), keyBytes) != 1 {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "invalid or missing API key"})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
