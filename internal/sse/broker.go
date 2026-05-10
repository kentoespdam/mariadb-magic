package sse

import (
	"sync"
)

type Broker struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan Event]struct{}
}

func NewBroker() *Broker {
	return &Broker{
		subscribers: make(map[string]map[chan Event]struct{}),
	}
}

func (b *Broker) Subscribe(sessionID string) chan Event {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.subscribers[sessionID] == nil {
		b.subscribers[sessionID] = make(map[chan Event]struct{})
	}

	ch := make(chan Event, 50)
	b.subscribers[sessionID][ch] = struct{}{}
	return ch
}

func (b *Broker) Unsubscribe(sessionID string, ch chan Event) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if subs, ok := b.subscribers[sessionID]; ok {
		delete(subs, ch)
		close(ch)
		if len(subs) == 0 {
			delete(b.subscribers, sessionID)
		}
	}
}

func (b *Broker) Publish(sessionID string, event Event) {
	b.mu.RLock()
	subs, ok := b.subscribers[sessionID]
	b.mu.RUnlock()

	if !ok {
		return
	}

	for ch := range subs {
		select {
		case ch <- event:
		default:
		}
	}
}

func (b *Broker) SubscriberCount(sessionID string) int {
	b.mu.RLock()
	defer b.mu.RUnlock()

	if subs, ok := b.subscribers[sessionID]; ok {
		return len(subs)
	}
	return 0
}
