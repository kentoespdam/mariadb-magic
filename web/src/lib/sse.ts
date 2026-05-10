'use client'

import { SSEMessage } from '@/types/types'

type MessageHandler = (msg: SSEMessage) => void

interface SSERunnerOptions {
  onMessage: MessageHandler
  onError?: (err: Error) => void
  onOpen?: () => void
}

const MAX_RETRIES = 5
const BASE_DELAY = 1000

export class SSERunner {
  private url: string
  private eventSource: EventSource | null = null
  private retries = 0
  private opts: SSERunnerOptions
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(url: string, opts: SSERunnerOptions) {
    this.url = url
    this.opts = opts
  }

  connect() {
    if (this.eventSource) return
    this.eventSource = new EventSource(this.url)
    this.eventSource.onopen = () => {
      this.retries = 0
      this.opts.onOpen?.()
    }
    this.eventSource.onmessage = (e) => {
      try {
        const msg: SSEMessage = JSON.parse(e.data)
        this.opts.onMessage(msg)
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    }
    this.eventSource.onerror = () => {
      this.eventSource?.close()
      this.eventSource = null
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.retries >= MAX_RETRIES) {
      this.opts.onError?.(new Error('Max retries reached'))
      return
    }
    const delay = BASE_DELAY * Math.pow(2, this.retries)
    this.retries++
    this.reconnectTimeout = setTimeout(() => this.connect(), delay)
  }

  close() {
    this.reconnectTimeout && clearTimeout(this.reconnectTimeout)
    this.eventSource?.close()
    this.eventSource = null
  }
}