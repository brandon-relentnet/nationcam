package restreamer

// ── Restreamer Core API request/response types ────────────────────────

// ProcessConfig is the payload for POST /api/v3/process.
type ProcessConfig struct {
	ID                    string      `json:"id"`
	Type                  string      `json:"type"`
	Input                 []ProcessIO `json:"input"`
	Output                []ProcessIO `json:"output"`
	Options               []string    `json:"options"`
	Autostart             bool        `json:"autostart"`
	Reconnect             bool        `json:"reconnect"`
	ReconnectDelaySeconds int         `json:"reconnect_delay_seconds"`
	StaleTimeoutSeconds   int         `json:"stale_timeout_seconds"`
}

// ProcessIO describes a single FFmpeg input or output.
type ProcessIO struct {
	ID      string   `json:"id"`
	Address string   `json:"address"`
	Options []string `json:"options"`
}

// Process is the response from GET/POST /api/v3/process.
type Process struct {
	ID                    string      `json:"id"`
	Type                  string      `json:"type"`
	Reference             string      `json:"reference"`
	Input                 []ProcessIO `json:"input"`
	Output                []ProcessIO `json:"output"`
	Options               []string    `json:"options"`
	Autostart             bool        `json:"autostart"`
	Reconnect             bool        `json:"reconnect"`
	ReconnectDelaySeconds int         `json:"reconnect_delay_seconds"`
	StaleTimeoutSeconds   int         `json:"stale_timeout_seconds"`
}

// ProcessState is returned by GET /api/v3/process/{id}/state.
type ProcessState struct {
	Order            string          `json:"order"`
	Exec             string          `json:"exec"`
	RuntimeSeconds   int             `json:"runtime_seconds"`
	ReconnectSeconds int             `json:"reconnect_seconds"`
	LastLogline      string          `json:"last_logline"`
	Progress         ProcessProgress `json:"progress"`
	MemoryBytes      int64           `json:"memory_bytes"`
	CPUUsage         float64         `json:"cpu_usage"`
}

// ProcessProgress contains FFmpeg progress information.
type ProcessProgress struct {
	Inputs      []ProgressIO `json:"inputs"`
	Outputs     []ProgressIO `json:"outputs"`
	Frame       int64        `json:"frame"`
	Packet      int64        `json:"packet"`
	FPS         float64      `json:"fps"`
	Q           float64      `json:"q"`
	SizeKB      int64        `json:"size_kb"`
	Time        float64      `json:"time"`
	BitrateKbit float64      `json:"bitrate_kbit"`
	Speed       float64      `json:"speed"`
	Drop        int64        `json:"drop"`
	Dup         int64        `json:"dup"`
}

// ProgressIO describes a single input or output stream's progress.
type ProgressIO struct {
	ID          string  `json:"id"`
	Address     string  `json:"address"`
	Index       int     `json:"index"`
	Stream      int     `json:"stream"`
	Format      string  `json:"format"`
	Type        string  `json:"type"`
	Codec       string  `json:"codec"`
	Coder       string  `json:"coder"`
	Frame       int64   `json:"frame"`
	FPS         float64 `json:"fps"`
	Packet      int64   `json:"packet"`
	PPS         float64 `json:"pps"`
	SizeKB      int64   `json:"size_kb"`
	BitrateKbit float64 `json:"bitrate_kbit"`
	PixFmt      string  `json:"pix_fmt"`
	Q           float64 `json:"q"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
}

// LoginRequest is the payload for POST /api/login.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse is returned by POST /api/login.
type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// RefreshResponse is returned by GET /api/login/refresh.
type RefreshResponse struct {
	AccessToken string `json:"access_token"`
}

// CommandRequest is the payload for PUT /api/v3/process/{id}/command.
type CommandRequest struct {
	Command string `json:"command"`
}

// ── Simplified API response types (returned to our clients) ───────────

// StreamResponse is the response for POST /streams (create).
type StreamResponse struct {
	StreamID string `json:"streamId"`
	HlsURL   string `json:"hlsUrl"`
	Status   string `json:"status"`
}

// StreamDetail is the response for GET /streams/{id} and items in GET /streams.
type StreamDetail struct {
	StreamID       string  `json:"streamId"`
	HlsURL         string  `json:"hlsUrl"`
	Status         string  `json:"status"`
	RuntimeSeconds int     `json:"runtimeSeconds"`
	FPS            float64 `json:"fps,omitempty"`
	BitrateKbit    float64 `json:"bitrateKbit,omitempty"`
	MemoryMB       float64 `json:"memoryMb,omitempty"`
	CPUUsage       float64 `json:"cpuUsage,omitempty"`
}
