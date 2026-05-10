package sse

import (
	"encoding/json"
	"fmt"
	"net/http"

	"magic-mariadb/internal/repo"
)

type Handler struct {
	broker       *Broker
	sessionsRepo *repo.SyncSessionsRepo
	logsRepo     *repo.SyncLogsRepo
}

func NewHandler(broker *Broker, sessionsRepo *repo.SyncSessionsRepo, logsRepo *repo.SyncLogsRepo) *Handler {
	return &Handler{
		broker:       broker,
		sessionsRepo: sessionsRepo,
		logsRepo:     logsRepo,
	}
}

func (h *Handler) StreamEvents(w http.ResponseWriter, r *http.Request, sessionID string) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	flusher, ok := w.(http.Flusher)
	if !ok {
		return
	}

	ch := h.broker.Subscribe(sessionID)
	defer h.broker.Unsubscribe(sessionID, ch)

	session, err := h.sessionsRepo.Get(sessionID)
	if err == nil && session != nil {
		snapshot := h.buildSnapshot(session)
		h.sendEvent(w, flusher, NewEvent(EventSnapshot, sessionID, snapshot))
	}

	for {
		select {
		case event, ok := <-ch:
			if !ok {
				return
			}
			h.sendEvent(w, flusher, event)
			if event.Type == EventDone || event.Type == EventCancelled || event.Type == EventError {
				return
			}
		case <-r.Context().Done():
			return
		}
	}
}

func (h *Handler) buildSnapshot(session *repo.SyncSession) EventData {
	data := EventData{
		Processed: session.RowsProcessed,
		Failed:    session.RowsFailed,
	}

	if session.Status == "done" {
		data.Processed = session.RowsProcessed
	}

	logs, _ := h.logsRepo.ListBySession(session.ID)
	if len(logs) > 50 {
		logs = logs[:50]
	}

	if len(logs) > 0 {
		lastLog := logs[0]
		if lastLog.FriendlyMsg != nil {
			data.ErrorMsg = *lastLog.FriendlyMsg
		}
	}

	return data
}

func (h *Handler) sendEvent(w http.ResponseWriter, flusher http.Flusher, event Event) {
	data, _ := json.Marshal(event)
	fmt.Fprintf(w, "data: %s\n\n", data)
	flusher.Flush()
}

func (h *Handler) PublishProgress(sessionID string, table string, processed, failed int) {
	h.broker.Publish(sessionID, NewEvent(EventProgress, sessionID, EventData{
		Table:     table,
		Processed: processed,
		Failed:    failed,
	}))
}

func (h *Handler) PublishRowFailed(sessionID, table, col, val string, code int, friendly string) {
	h.broker.Publish(sessionID, NewEvent(EventRowFailed, sessionID, EventData{
		Table:       table,
		Column:      col,
		Value:       val,
		Code:        code,
		FriendlyMsg: friendly,
	}))
}

func (h *Handler) PublishDone(sessionID string, processed, failed int) {
	h.broker.Publish(sessionID, NewEvent(EventDone, sessionID, EventData{
		Processed: processed,
		Failed:    failed,
	}))
}

func (h *Handler) PublishCancelled(sessionID string, processed, failed int) {
	h.broker.Publish(sessionID, NewEvent(EventCancelled, sessionID, EventData{
		Processed: processed,
		Failed:    failed,
	}))
}

func (h *Handler) PublishError(sessionID, msg string) {
	h.broker.Publish(sessionID, NewEvent(EventError, sessionID, EventData{
		ErrorMsg: msg,
	}))
}
