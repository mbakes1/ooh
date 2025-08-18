"use client";

import { useWebSocket } from "@/components/providers/websocket-provider";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  const { isConnected } = useWebSocket();

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Disconnected
          </>
        )}
      </Badge>
    </div>
  );
}
