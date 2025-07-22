import { useState, useEffect, useRef } from "react";

export function useWebSocket<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        //console.log("Received WebSocket message:", parsedData.data);
        setData(parsedData.data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket connection closed");
    };

    webSocketRef.current = ws;

    // Cleanup function
    return () => {
      ws.close();
    };
  }, [url]);

  return { data, isConnected };
}
