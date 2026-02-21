package restreamer

import (
	"fmt"
	"net/url"
	"regexp"
	"strings"
)

var (
	// validNameChars matches only lowercase alphanumeric and dashes.
	validNameChars = regexp.MustCompile(`[^a-z0-9-]`)
	// collapseDashes matches consecutive dashes.
	collapseDashes = regexp.MustCompile(`-{2,}`)
	// shellMetachars are characters that could be used for shell injection.
	shellMetachars = regexp.MustCompile("[;|&`$(){}><\n\r\\\\]")
	// ffmpegExploits are protocol/option patterns that could exploit FFmpeg.
	ffmpegExploits = []string{
		"concat:", "pipe:", "data:", "file:", "subfile:",
		"crypto:", "tee:", "zmq:", "tcp:", "udp:",
	}

	maxNameLength = 64
)

// SanitizeStreamName normalizes a stream name to lowercase alphanumeric with dashes.
// Returns the sanitized name or an error if the result is empty.
func SanitizeStreamName(name string) (string, error) {
	if name == "" {
		return "", fmt.Errorf("stream name is required")
	}

	// Lowercase and replace spaces/underscores with dashes.
	s := strings.ToLower(strings.TrimSpace(name))
	s = strings.ReplaceAll(s, " ", "-")
	s = strings.ReplaceAll(s, "_", "-")

	// Strip invalid characters.
	s = validNameChars.ReplaceAllString(s, "")

	// Collapse consecutive dashes.
	s = collapseDashes.ReplaceAllString(s, "-")

	// Trim leading/trailing dashes.
	s = strings.Trim(s, "-")

	if s == "" {
		return "", fmt.Errorf("stream name contains no valid characters (use alphanumeric and dashes)")
	}
	if len(s) > maxNameLength {
		s = s[:maxNameLength]
		s = strings.TrimRight(s, "-")
	}

	return s, nil
}

// ValidateRTSPURL checks that the URL is a valid RTSP/RTSPS URL and doesn't
// contain shell metacharacters or FFmpeg exploit patterns.
func ValidateRTSPURL(rawURL string) error {
	if rawURL == "" {
		return fmt.Errorf("RTSP URL is required")
	}

	// Check for shell metacharacters before parsing.
	if shellMetachars.MatchString(rawURL) {
		return fmt.Errorf("URL contains invalid characters")
	}

	parsed, err := url.Parse(rawURL)
	if err != nil {
		return fmt.Errorf("malformed URL: %w", err)
	}

	// Scheme must be rtsp or rtsps.
	scheme := strings.ToLower(parsed.Scheme)
	if scheme != "rtsp" && scheme != "rtsps" {
		return fmt.Errorf("URL scheme must be rtsp:// or rtsps://, got %q", parsed.Scheme)
	}

	// Host must be present.
	if parsed.Hostname() == "" {
		return fmt.Errorf("URL must include a hostname")
	}

	// Check for FFmpeg exploit patterns in the full URL string.
	lower := strings.ToLower(rawURL)
	for _, pattern := range ffmpegExploits {
		if strings.Contains(lower, pattern) {
			return fmt.Errorf("URL contains disallowed pattern %q", pattern)
		}
	}

	return nil
}
