package restreamer

import (
	"fmt"
	"net/url"
	"strings"
)

// shellMetachars are characters that could be used for shell injection.
var shellMetachars = [...]string{";", "|", "&", "`", "$", "(", ")", "{", "}", ">", "<", "\n", "\r", "\\"}

// ffmpegExploits are protocol/option patterns that could exploit FFmpeg.
var ffmpegExploits = []string{
	"concat:", "pipe:", "data:", "file:", "subfile:",
	"crypto:", "tee:", "zmq:", "tcp:", "udp:",
}

// ValidateRTSPURL checks that the URL is a valid RTSP/RTSPS URL and doesn't
// contain shell metacharacters or FFmpeg exploit patterns.
func ValidateRTSPURL(rawURL string) error {
	if rawURL == "" {
		return fmt.Errorf("RTSP URL is required")
	}

	// Check for shell metacharacters before parsing.
	for _, c := range shellMetachars {
		if strings.Contains(rawURL, c) {
			return fmt.Errorf("URL contains invalid characters")
		}
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
