import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { NotificationResponse } from "~/types/notification";

// WebSocket URL - replace /api/v1 with /ws for WebSocket endpoint
const getWsUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL + '/ws';
    // Remove /api/v1 and add /ws
    return apiUrl;
};

type NotificationCallback = (notification: NotificationResponse) => void;

class WebSocketService {
    private client: Client | null = null;
    private notificationCallbacks: NotificationCallback[] = [];
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Initialize and connect
    connect(email?: string): void {
        const token = localStorage.getItem("token");
        const userEmail = email || localStorage.getItem("userEmail") || "";

        if (!token) {
            console.warn("[WebSocket] No access token found, skipping connection");
            return;
        }

        if (this.client?.active) {
            return;
        }

        const wsUrl = getWsUrl();

        this.client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {              
                "X-USER-ID": userEmail,
            },
            onConnect: () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.subscribeToNotifications();
            },
            onDisconnect: () => {
                this.isConnected = false;
            },
            onStompError: (frame) => {
                console.error("[WebSocket] ❌ STOMP Error:", frame.headers["message"]);
                console.error("[WebSocket] Error details:", frame.body);
            },
            onWebSocketError: (event) => {
                console.error("[WebSocket] ❌ WebSocket Error:", event);
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error("[WebSocket] Max reconnect attempts reached, stopping");
                    this.disconnect();
                }
            },
        });

        this.client.activate();
    }

    // Subscribe to user notifications queue
    private subscribeToNotifications(): void {
        if (!this.client?.active) {
            console.warn("[WebSocket] Cannot subscribe - client not active");
            return;
        }

        this.client.subscribe("/user/queue/notifications", (message: IMessage) => {
            try {
                const notification: NotificationResponse = JSON.parse(message.body);
                this.notificationCallbacks.forEach((callback) => {
                    callback(notification);
                });
            } catch (error) {
                console.error("[WebSocket] Error parsing notification:", error);
            }
        });


        // Heartbeat log every 30 seconds to confirm connection is alive
        setInterval(() => {
            if (this.isConnected) {
            }
        }, 30000);
    }

    // Register callback for new notifications
    onNotification(callback: NotificationCallback): () => void {
        this.notificationCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.notificationCallbacks.indexOf(callback);
            if (index > -1) {
                this.notificationCallbacks.splice(index, 1);
            }
        };
    }

    // Disconnect from WebSocket
    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
            this.notificationCallbacks = [];
        }
    }

    // Check if connected
    getIsConnected(): boolean {
        return this.isConnected;
    }
}

// Singleton instance
export const websocketService = new WebSocketService();
