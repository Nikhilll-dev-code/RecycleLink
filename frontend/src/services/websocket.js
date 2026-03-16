class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Set();
        this.reconnectAttempts = 0;
    }

    connect(token) {
        if (this.ws) return;

        // In dev, assuming Vite proxies the WS or we use absolute URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Use the backend host in dev, or window.location.host in prod
        const host = window.location.port === '5173' ? 'localhost:3001' : window.location.host;
        const wsUrl = `${protocol}//${host}?token=${token}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach((listener) => listener(data));
            } catch (err) {
                console.error('WebSocket parse error', err);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.ws = null;
            // Reconnect logic
            if (this.reconnectAttempts < 5) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect(token);
                }, 3000 * this.reconnectAttempts);
            }
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error', err);
            this.ws.close();
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendLocationUpdate(lat, lng) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'LOCATION_UPDATE', lat, lng }));
        }
    }

    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
}

export const wsService = new WebSocketService();
