"use client";

import { useEffect, useState } from "react";

interface SessionMonitoringProps {
  onSessionIdChange: (id: string) => void;
}

export default function SessionMonitoringPage() {
  const [_session, _setSession] = useState<Session | null>(null);
  const [_isLoading, _setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [connection, setConnection] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!connection) {
      const ws = new WebSocket("ws://localhost:8080/api/sessions/events");
      ws.onopen = () => {
        console.log("WebSocket connection established");
        setConnection(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setSessionData(data);
        // Update UI with session data
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnection(null);
      };

      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, [connection]);

  const _handleSessionSelect = (sessionId: string) => {
    // Send message to server to start monitoring this session
    onSessionIdChange(sessionId);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Session Monitoring</h1>
      <div className="mt-4">
        <SessionDetail session={sessionData} />
      </div>
    </div>
  );
}
