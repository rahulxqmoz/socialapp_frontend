// src/useWebSocket.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import connectWebSocket from "./websocket";
import { updatePostComments, updatePostLikes } from "./features/auth/feedSlice";

const useWebSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const handleWebSocketConnection = () => {
      const ws = connectWebSocket(token);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'LIKE_UPDATE') {
          dispatch(updatePostLikes({
            postId: data.postId,
            likes: data.likes,
            totalLikes: data.totalLikes,
          }));
        } else if (data.type === 'COMMENT_UPDATE') {
          dispatch(updatePostComments({
            postId: data.postId,
            comments: data.comments,
            totalComments: data.totalComments,
          }));
        }
      };
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };
      setWs(ws);
    };

    handleWebSocketConnection();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [dispatch, token]);

  return ws;
};

export default useWebSocket;