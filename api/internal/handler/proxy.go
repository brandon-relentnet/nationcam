package handler

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	proxyTimeout     = 10 * time.Second
	proxyMaxBodySize = 50 * 1024 * 1024 // 50 MB
)

var proxyClient = &http.Client{
	Timeout: proxyTimeout,
	// Don't follow redirects automatically — we'll handle them
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) >= 5 {
			return fmt.Errorf("too many redirects")
		}
		return nil
	},
}

// StreamProxy fetches an HLS manifest or segment from a remote URL and returns
// it with permissive CORS headers. This lets hls.js in the browser play streams
// from servers that don't set Access-Control-Allow-Origin.
//
// Usage: GET /stream-proxy?url=<encoded-url>
//
// For .m3u8 manifests the handler rewrites relative and absolute segment URLs
// so the browser fetches those through the proxy too.
func StreamProxy() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rawURL := r.URL.Query().Get("url")
		if rawURL == "" {
			http.Error(w, `{"error":"missing url parameter"}`, http.StatusBadRequest)
			return
		}

		parsed, err := url.Parse(rawURL)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
			http.Error(w, `{"error":"invalid url — only http/https allowed"}`, http.StatusBadRequest)
			return
		}

		// Build upstream request, forwarding a subset of headers.
		req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, rawURL, nil)
		if err != nil {
			slog.Error("proxy: build request", "url", rawURL, "err", err)
			http.Error(w, `{"error":"could not build upstream request"}`, http.StatusInternalServerError)
			return
		}
		if ua := r.Header.Get("User-Agent"); ua != "" {
			req.Header.Set("User-Agent", ua)
		}

		resp, err := proxyClient.Do(req)
		if err != nil {
			slog.Warn("proxy: upstream fetch failed", "url", rawURL, "err", err)
			http.Error(w, `{"error":"upstream request failed"}`, http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 400 {
			slog.Warn("proxy: upstream error status", "url", rawURL, "status", resp.StatusCode)
			http.Error(w, fmt.Sprintf(`{"error":"upstream returned %d"}`, resp.StatusCode), resp.StatusCode)
			return
		}

		body, err := io.ReadAll(io.LimitReader(resp.Body, proxyMaxBodySize))
		if err != nil {
			slog.Error("proxy: read body", "url", rawURL, "err", err)
			http.Error(w, `{"error":"failed to read upstream response"}`, http.StatusBadGateway)
			return
		}

		ct := resp.Header.Get("Content-Type")
		isManifest := strings.Contains(rawURL, ".m3u8") ||
			strings.Contains(ct, "mpegurl") ||
			strings.Contains(ct, "apple.mpegurl")

		if isManifest {
			body = rewriteManifest(body, rawURL)
		}

		// CORS headers — allow any origin.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Range")

		// Content-Type from upstream or a sensible default.
		if ct != "" {
			w.Header().Set("Content-Type", ct)
		} else if isManifest {
			w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
		}

		// Caching: manifests change frequently, segments are immutable.
		if isManifest {
			w.Header().Set("Cache-Control", "no-cache")
		} else {
			w.Header().Set("Cache-Control", "public, max-age=60")
		}

		w.WriteHeader(http.StatusOK)
		w.Write(body)
	}
}

// proxyPath is the public-facing path to the stream proxy, as seen by the
// browser (through nginx which maps /api/* → Go API).  We use a path-only
// prefix (no scheme, no host) so that the browser resolves it against its
// current origin, automatically inheriting the correct protocol (https).
const proxyPath = "/api/stream-proxy"

// rewriteManifest rewrites URLs inside an m3u8 manifest so that every segment
// or sub-manifest request is also routed through the proxy.
func rewriteManifest(body []byte, manifestURL string) []byte {
	base, err := url.Parse(manifestURL)
	if err != nil {
		return body
	}

	lines := strings.Split(string(body), "\n")
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			// For EXT-X-MAP or EXT-X-MEDIA with URI="..." attributes, rewrite those too.
			if strings.Contains(trimmed, "URI=\"") {
				lines[i] = rewriteURIAttribute(trimmed, base)
			}
			continue
		}
		// This is a URL line — resolve and proxy it.
		lines[i] = proxyURL(trimmed, base)
	}
	return []byte(strings.Join(lines, "\n"))
}

// proxyURL resolves a potentially-relative URL against the manifest base, then
// wraps it in a path-only proxy URL (e.g. /api/stream-proxy?url=...).
func proxyURL(raw string, base *url.URL) string {
	resolved := resolveURL(raw, base)
	return fmt.Sprintf("%s?url=%s", proxyPath, url.QueryEscape(resolved))
}

// resolveURL turns a relative or absolute URL into a fully-qualified URL using
// the manifest's URL as the base.
func resolveURL(raw string, base *url.URL) string {
	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		return raw
	}
	ref, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	return base.ResolveReference(ref).String()
}

// rewriteURIAttribute handles lines like: #EXT-X-MAP:URI="init.mp4"
func rewriteURIAttribute(line string, base *url.URL) string {
	idx := strings.Index(line, `URI="`)
	if idx == -1 {
		return line
	}
	start := idx + 5 // len(`URI="`)
	end := strings.Index(line[start:], `"`)
	if end == -1 {
		return line
	}
	uri := line[start : start+end]
	newURI := proxyURL(uri, base)
	return line[:start] + newURI + line[start+end:]
}
