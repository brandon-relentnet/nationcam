package handler

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/brandon-relentnet/nationcam/api/internal/restreamer"
	"github.com/go-chi/chi/v5"
)

// ── Request types ─────────────────────────────────────────────────────

type createStreamRequest struct {
	Name    string `json:"name"`
	RTSPURL string `json:"rtspUrl"`
}

// ── Handlers ──────────────────────────────────────────────────────────

// CreateStream handles POST /streams — creates a new RTSP-to-HLS stream.
func CreateStream(rc *restreamer.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createStreamRequest
		if err := readJSON(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
			return
		}

		// Sanitize stream name.
		streamID, err := restreamer.SanitizeStreamName(req.Name)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}

		// Validate RTSP URL.
		if err := restreamer.ValidateRTSPURL(req.RTSPURL); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}

		// Check if process already exists.
		if _, err := rc.GetProcess(r.Context(), streamID); err == nil {
			writeJSON(w, http.StatusConflict, map[string]string{
				"error": "stream '" + streamID + "' already exists",
			})
			return
		}

		// Build the FFmpeg process configuration.
		cfg := restreamer.ProcessConfig{
			ID:   streamID,
			Type: "ffmpeg",
			Input: []restreamer.ProcessIO{{
				ID:      "0",
				Address: req.RTSPURL,
				Options: []string{"-rtsp_transport", "tcp", "-timeout", "5000000"},
			}},
			Output: []restreamer.ProcessIO{{
				ID:      "0",
				Address: "{memfs}/{processid}.m3u8",
				Options: []string{
					"-codec:v", "copy",
					"-codec:a", "copy",
					"-f", "hls",
					"-hls_time", "2",
					"-hls_list_size", "6",
					"-hls_flags", "delete_segments+temp_file+append_list",
					"-method", "PUT",
				},
			}},
			Options:               []string{},
			Autostart:             true,
			Reconnect:             true,
			ReconnectDelaySeconds: 15,
			StaleTimeoutSeconds:   30,
		}

		if _, err := rc.CreateProcess(r.Context(), cfg); err != nil {
			status, msg := mapRestreamerError(err)
			slog.Error("create stream failed", "streamId", streamID, "error", err)
			writeJSON(w, status, map[string]string{"error": msg})
			return
		}

		writeJSON(w, http.StatusCreated, restreamer.StreamResponse{
			StreamID: streamID,
			HlsURL:   rc.HLSURL(streamID),
			Status:   "created",
		})
	}
}

// ListStreams handles GET /streams — returns all active streams.
func ListStreams(rc *restreamer.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		procs, err := rc.ListProcesses(r.Context())
		if err != nil {
			status, msg := mapRestreamerError(err)
			writeJSON(w, status, map[string]string{"error": msg})
			return
		}

		streams := make([]restreamer.StreamDetail, 0, len(procs))
		for _, p := range procs {
			state, err := rc.GetProcessState(r.Context(), p.ID)
			if err != nil {
				// Include the stream with unknown status rather than failing entirely.
				streams = append(streams, restreamer.StreamDetail{
					StreamID: p.ID,
					HlsURL:   rc.HLSURL(p.ID),
					Status:   "unknown",
				})
				continue
			}
			streams = append(streams, buildStreamDetail(rc, p.ID, state))
		}

		writeJSON(w, http.StatusOK, streams)
	}
}

// GetStream handles GET /streams/{id} — returns a single stream's state.
func GetStream(rc *restreamer.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		state, err := rc.GetProcessState(r.Context(), id)
		if err != nil {
			status, msg := mapRestreamerError(err)
			writeJSON(w, status, map[string]string{"error": msg})
			return
		}

		writeJSON(w, http.StatusOK, buildStreamDetail(rc, id, state))
	}
}

// DeleteStream handles DELETE /streams/{id} — removes a stream.
func DeleteStream(rc *restreamer.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		if err := rc.DeleteProcess(r.Context(), id); err != nil {
			status, msg := mapRestreamerError(err)
			writeJSON(w, status, map[string]string{"error": msg})
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// RestartStream handles POST /streams/{id}/restart — stops then starts a stream.
func RestartStream(rc *restreamer.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		// Stop the process.
		if err := rc.CommandProcess(r.Context(), id, "stop"); err != nil {
			status, msg := mapRestreamerError(err)
			writeJSON(w, status, map[string]string{"error": msg})
			return
		}

		// Brief pause to allow FFmpeg to shut down cleanly.
		time.Sleep(1 * time.Second)

		// Start the process.
		if err := rc.CommandProcess(r.Context(), id, "start"); err != nil {
			status, msg := mapRestreamerError(err)
			slog.Error("restart stream: start failed", "streamId", id, "error", err)
			writeJSON(w, status, map[string]string{"error": msg})
			return
		}

		writeJSON(w, http.StatusOK, restreamer.StreamResponse{
			StreamID: id,
			HlsURL:   rc.HLSURL(id),
			Status:   "restarting",
		})
	}
}

// ── Helpers ───────────────────────────────────────────────────────────

// buildStreamDetail maps a Restreamer process state to a simplified StreamDetail.
func buildStreamDetail(rc *restreamer.Client, id string, state *restreamer.ProcessState) restreamer.StreamDetail {
	return restreamer.StreamDetail{
		StreamID:       id,
		HlsURL:         rc.HLSURL(id),
		Status:         state.Exec,
		RuntimeSeconds: state.RuntimeSeconds,
		FPS:            state.Progress.FPS,
		BitrateKbit:    state.Progress.BitrateKbit,
		MemoryMB:       float64(state.MemoryBytes) / (1024 * 1024),
		CPUUsage:       state.CPUUsage,
	}
}

// mapRestreamerError converts a restreamer.Error to an HTTP status and message
// suitable for the client response.
func mapRestreamerError(err error) (int, string) {
	var re *restreamer.Error
	if errors.As(err, &re) {
		switch re.StatusCode {
		case http.StatusNotFound:
			return http.StatusNotFound, "stream not found"
		case http.StatusConflict:
			return http.StatusConflict, "stream already exists"
		case http.StatusBadGateway:
			return http.StatusBadGateway, "Restreamer service unavailable"
		case http.StatusUnauthorized, http.StatusForbidden:
			return http.StatusServiceUnavailable, "unable to authenticate with Restreamer"
		default:
			return re.StatusCode, re.Message
		}
	}
	// Connection errors (not a restreamer.Error) indicate the service is down.
	return http.StatusBadGateway, "Restreamer service unavailable"
}
