package config

import (
	"fmt"
	"os"
	"strings"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	Port           string
	DatabaseURL    string
	RedisURL       string
	LogtoEndpoint  string
	LogtoResource  string
	CORSOrigins    []string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	origins := os.Getenv("CORS_ORIGINS")
	var corsList []string
	if origins != "" {
		for _, o := range strings.Split(origins, ",") {
			corsList = append(corsList, strings.TrimSpace(o))
		}
	}

	return &Config{
		Port:          envOr("PORT", "8080"),
		DatabaseURL:   dbURL,
		RedisURL:      envOr("REDIS_URL", "redis://localhost:6379/0"),
		LogtoEndpoint: envOr("LOGTO_ENDPOINT", "http://localhost:3301"),
		LogtoResource: envOr("LOGTO_RESOURCE", "https://api.nationcam.com"),
		CORSOrigins:   corsList,
	}, nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
