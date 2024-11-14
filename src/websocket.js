// src/websocket.js
// websocket.js
export const connectWebSocket = (token) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/feed/?token=${token}`);
  
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message received:', data);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };
  
    return ws;
  };
  