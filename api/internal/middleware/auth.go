package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/go-jose/go-jose/v4"
)

type contextKey string

const (
	// UserIDKey is the context key for the authenticated user's Logto subject.
	UserIDKey contextKey = "user_id"
	// RolesKey is the context key for the user's roles.
	RolesKey contextKey = "roles"
)

// Auth validates Logto-issued JWTs using the JWKS discovery endpoint.
type Auth struct {
	jwksURL  string
	resource string
	mu       sync.RWMutex
	keySet   *jose.JSONWebKeySet
	fetched  time.Time
}

// NewAuth creates an Auth middleware that validates tokens from the given Logto endpoint.
func NewAuth(logtoEndpoint, resource string) *Auth {
	return &Auth{
		jwksURL:  strings.TrimRight(logtoEndpoint, "/") + "/oidc/jwks",
		resource: resource,
	}
}

// Authenticate is middleware that extracts and validates the JWT, setting user info in context.
// If no token is present, the request proceeds as unauthenticated.
func (a *Auth) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := extractBearerToken(r)
		if token == "" {
			next.ServeHTTP(w, r)
			return
		}

		claims, err := a.validateToken(r.Context(), token)
		if err != nil {
			slog.Warn("invalid token", "error", err)
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, claims.Subject)
		ctx = context.WithValue(ctx, RolesKey, claims.Roles)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAdmin is middleware that rejects unauthenticated requests.
// Currently any authenticated Logto user is treated as admin.
// TODO: add proper role-based access control via Logto roles.
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, _ := r.Context().Value(UserIDKey).(string)
		if userID == "" {
			http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// UserID extracts the authenticated user ID from the request context.
func UserID(ctx context.Context) string {
	id, _ := ctx.Value(UserIDKey).(string)
	return id
}

type tokenClaims struct {
	Subject  string   `json:"sub"`
	Audience any      `json:"aud"`
	Roles    []string `json:"roles"`
}

func (a *Auth) validateToken(ctx context.Context, rawToken string) (*tokenClaims, error) {
	keys, err := a.getKeys(ctx)
	if err != nil {
		return nil, fmt.Errorf("fetch JWKS: %w", err)
	}

	tok, err := jose.ParseSigned(rawToken, []jose.SignatureAlgorithm{jose.RS256, jose.ES256, jose.ES384})
	if err != nil {
		return nil, fmt.Errorf("parse JWT: %w", err)
	}

	// Try each key until one works.
	var payload []byte
	for _, key := range keys.Keys {
		payload, err = tok.Verify(key)
		if err == nil {
			break
		}
	}
	if err != nil {
		return nil, fmt.Errorf("verify JWT: %w", err)
	}

	var claims tokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("decode claims: %w", err)
	}

	return &claims, nil
}

func (a *Auth) getKeys(ctx context.Context) (*jose.JSONWebKeySet, error) {
	a.mu.RLock()
	if a.keySet != nil && time.Since(a.fetched) < 1*time.Hour {
		defer a.mu.RUnlock()
		return a.keySet, nil
	}
	a.mu.RUnlock()

	a.mu.Lock()
	defer a.mu.Unlock()

	// Double-check after acquiring write lock.
	if a.keySet != nil && time.Since(a.fetched) < 1*time.Hour {
		return a.keySet, nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, a.jwksURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var ks jose.JSONWebKeySet
	if err := json.Unmarshal(body, &ks); err != nil {
		return nil, err
	}

	a.keySet = &ks
	a.fetched = time.Now()
	return a.keySet, nil
}

func extractBearerToken(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(auth, "Bearer ")
}
