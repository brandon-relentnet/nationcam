package restreamer

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"
)

// tokenBuffer is the safety margin before token expiry to trigger a refresh.
const tokenBuffer = 60 * time.Second

// Client communicates with the datarhei Restreamer Core API.
// It transparently manages JWT access/refresh token lifecycle.
type Client struct {
	baseURL    string
	username   string
	password   string
	httpClient *http.Client

	mu           sync.Mutex
	accessToken  string
	refreshToken string
	accessExp    time.Time
	refreshExp   time.Time
}

// NewClient creates a Restreamer API client.
func NewClient(baseURL, username, password string) *Client {
	return &Client{
		baseURL:  strings.TrimRight(baseURL, "/"),
		username: username,
		password: password,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// BaseURL returns the configured Restreamer base URL.
func (c *Client) BaseURL() string {
	return c.baseURL
}

// HLSURL returns the public HLS URL for a given stream ID.
func (c *Client) HLSURL(streamID string) string {
	return fmt.Sprintf("%s/memfs/%s.m3u8", c.baseURL, streamID)
}

// ── Public API methods ────────────────────────────────────────────────

// CreateProcess creates a new FFmpeg process on Restreamer.
func (c *Client) CreateProcess(ctx context.Context, cfg ProcessConfig) (*Process, error) {
	var proc Process
	if err := c.doJSON(ctx, http.MethodPost, "/api/v3/process", cfg, &proc); err != nil {
		return nil, err
	}
	return &proc, nil
}

// GetProcess retrieves a process by ID.
func (c *Client) GetProcess(ctx context.Context, id string) (*Process, error) {
	var proc Process
	if err := c.doJSON(ctx, http.MethodGet, "/api/v3/process/"+id, nil, &proc); err != nil {
		return nil, err
	}
	return &proc, nil
}

// ListProcesses retrieves all FFmpeg processes.
func (c *Client) ListProcesses(ctx context.Context) ([]Process, error) {
	var procs []Process
	if err := c.doJSON(ctx, http.MethodGet, "/api/v3/process", nil, &procs); err != nil {
		return nil, err
	}
	return procs, nil
}

// GetProcessState retrieves the runtime state of a process.
func (c *Client) GetProcessState(ctx context.Context, id string) (*ProcessState, error) {
	var state ProcessState
	if err := c.doJSON(ctx, http.MethodGet, "/api/v3/process/"+id+"/state", nil, &state); err != nil {
		return nil, err
	}
	return &state, nil
}

// DeleteProcess removes a process by ID.
func (c *Client) DeleteProcess(ctx context.Context, id string) error {
	return c.doJSON(ctx, http.MethodDelete, "/api/v3/process/"+id, nil, nil)
}

// CommandProcess sends a command (start/stop) to a process.
func (c *Client) CommandProcess(ctx context.Context, id, command string) error {
	return c.doJSON(ctx, http.MethodPut, "/api/v3/process/"+id+"/command", CommandRequest{Command: command}, nil)
}

// ── Token lifecycle ───────────────────────────────────────────────────

// getToken returns a valid access token, refreshing or re-logging in as needed.
func (c *Client) getToken(ctx context.Context) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// 1. Valid access token — return it.
	if c.accessToken != "" && time.Now().Before(c.accessExp.Add(-tokenBuffer)) {
		return c.accessToken, nil
	}

	// 2. Valid refresh token — try refresh.
	if c.refreshToken != "" && time.Now().Before(c.refreshExp.Add(-tokenBuffer)) {
		if err := c.refresh(ctx); err != nil {
			slog.Warn("restreamer token refresh failed, attempting login", "error", err)
		} else {
			return c.accessToken, nil
		}
	}

	// 3. Full login.
	if err := c.login(ctx); err != nil {
		return "", fmt.Errorf("restreamer authentication failed: %w", err)
	}
	return c.accessToken, nil
}

// login performs POST /api/login with username/password.
func (c *Client) login(ctx context.Context) error {
	body, err := json.Marshal(LoginRequest{
		Username: c.username,
		Password: c.password,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/api/login", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("login request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("login returned status %d", resp.StatusCode)
	}

	var result LoginResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("decode login response: %w", err)
	}

	c.accessToken = result.AccessToken
	c.refreshToken = result.RefreshToken
	c.accessExp = parseJWTExpiry(result.AccessToken)
	c.refreshExp = parseJWTExpiry(result.RefreshToken)

	slog.Info("restreamer login successful",
		"access_expires", c.accessExp.Format(time.RFC3339),
		"refresh_expires", c.refreshExp.Format(time.RFC3339),
	)
	return nil
}

// refresh performs GET /api/login/refresh using the refresh token.
func (c *Client) refresh(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/api/login/refresh", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.refreshToken)
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("refresh request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("refresh returned status %d", resp.StatusCode)
	}

	var result RefreshResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("decode refresh response: %w", err)
	}

	c.accessToken = result.AccessToken
	c.accessExp = parseJWTExpiry(result.AccessToken)

	slog.Debug("restreamer token refreshed", "access_expires", c.accessExp.Format(time.RFC3339))
	return nil
}

// ── HTTP helper ───────────────────────────────────────────────────────

// doJSON makes an authenticated request to the Restreamer API.
// If the response is 401, it invalidates the token and retries once.
func (c *Client) doJSON(ctx context.Context, method, path string, reqBody, respBody any) error {
	resp, err := c.doRequest(ctx, method, path, reqBody)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// On 401, invalidate token and retry once.
	if resp.StatusCode == http.StatusUnauthorized {
		resp.Body.Close()
		c.mu.Lock()
		c.accessToken = ""
		c.mu.Unlock()

		resp, err = c.doRequest(ctx, method, path, reqBody)
		if err != nil {
			return err
		}
		defer resp.Body.Close()
	}

	// Read body for error context.
	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return &Error{
			StatusCode: resp.StatusCode,
			Message:    strings.TrimSpace(string(bodyBytes)),
		}
	}

	// Decode response body if caller wants it.
	if respBody != nil && len(bodyBytes) > 0 {
		if err := json.Unmarshal(bodyBytes, respBody); err != nil {
			return fmt.Errorf("decode response: %w", err)
		}
	}

	return nil
}

// doRequest builds and sends an authenticated HTTP request.
func (c *Client) doRequest(ctx context.Context, method, path string, body any) (*http.Response, error) {
	token, err := c.getToken(ctx)
	if err != nil {
		return nil, err
	}

	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("marshal request body: %w", err)
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, &Error{
			StatusCode: http.StatusBadGateway,
			Message:    fmt.Sprintf("restreamer request failed: %v", err),
		}
	}
	return resp, nil
}

// ── JWT expiry parsing ────────────────────────────────────────────────

// jwtPayload is the minimal JWT payload for extracting expiry.
type jwtPayload struct {
	Exp int64 `json:"exp"`
}

// parseJWTExpiry extracts the exp claim from a JWT without verifying signature.
// We are the client here — verification is Restreamer's responsibility.
func parseJWTExpiry(token string) time.Time {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return time.Now().Add(5 * time.Minute) // fallback
	}

	// Base64url decode the payload (middle part).
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return time.Now().Add(5 * time.Minute)
	}

	var p jwtPayload
	if err := json.Unmarshal(payload, &p); err != nil || p.Exp == 0 {
		return time.Now().Add(5 * time.Minute)
	}

	return time.Unix(p.Exp, 0)
}

// ── Error type ────────────────────────────────────────────────────────

// Error represents an error from the Restreamer API.
type Error struct {
	StatusCode int
	Message    string
}

func (e *Error) Error() string {
	return fmt.Sprintf("restreamer: %d %s", e.StatusCode, e.Message)
}
