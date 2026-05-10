package sse

import "time"

type EventType string

const (
	EventProgress   EventType = "progress"
	EventRowFailed  EventType = "row_failed"
	EventDone       EventType = "done"
	EventCancelled  EventType = "cancelled"
	EventError      EventType = "error"
	EventSnapshot   EventType = "snapshot"
)

type Event struct {
	Type      EventType     `json:"type"`
	SessionID string        `json:"session_id"`
	Data      EventData     `json:"data"`
	Timestamp time.Time     `json:"timestamp"`
}

type EventData struct {
	Processed    int      `json:"processed,omitempty"`
	Failed       int      `json:"failed,omitempty"`
	Table        string   `json:"table,omitempty"`
	ErrorMsg     string   `json:"error_msg,omitempty"`
	FriendlyMsg  string   `json:"friendly_msg,omitempty"`
	Column       string   `json:"column,omitempty"`
	Value        string   `json:"value,omitempty"`
	Code         int      `json:"code,omitempty"`
}

func NewEvent(typ EventType, sessionID string, data EventData) Event {
	return Event{
		Type:      typ,
		SessionID: sessionID,
		Data:      data,
		Timestamp: time.Now().UTC(),
	}
}