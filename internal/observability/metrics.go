package observability

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	SyncStartedTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "sync_started_total",
		Help: "Total number of sync sessions started",
	})

	SyncFailedTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "sync_failed_total",
		Help: "Total number of sync sessions failed",
	})

	SyncDurationSeconds = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "sync_duration_seconds",
		Help:    "Duration of sync sessions in seconds",
		Buckets: prometheus.DefBuckets,
	})

	SseClientsActive = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "sse_clients_active",
		Help: "Number of active SSE clients",
	})

	HttpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path_pattern", "status_class"},
	)

	HttpRequestDurationSeconds = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Duration of HTTP requests in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path_pattern"},
	)
)