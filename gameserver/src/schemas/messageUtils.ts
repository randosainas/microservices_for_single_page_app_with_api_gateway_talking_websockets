import { ClientMessage, schemaClientMessage, schemaServerError } from "./messageSchemas.ts";
import { WSClient } from "../types/WSClient.ts";
import { WebSocket } from "ws";

export function safeParseJSON<T = unknown>(data: string): T | null {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function sendServerError(ws: WSClient, message: string) {
  const errorMsg = schemaServerError.parse({
    type: 'error',
    payload: {
      message
    }
  })
  ws.send(JSON.stringify(errorMsg));
}

export function getClientMessageData(ws: WSClient, raw: WebSocket.RawData): ClientMessage | null {
  let json: unknown;
  try {
    json = JSON.parse(String(raw));
  } catch {
    sendServerError(ws, 'Invalid JSON');
    return null;
  }
  const result = schemaClientMessage.safeParse(json);
  if (!result.success) {
    sendServerError(ws, 'Malformed client message');
    console.log("Parsed JSON on Malformed client message:", json);
    return null;
  }

  return result.data;
}
