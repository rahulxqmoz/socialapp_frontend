
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {  FaPhoneSlash } from "react-icons/fa";
import { initiateCall } from '../features/auth/groupChatSlice';
import { setCaller, setCallerId, setOffer, setStatus } from '../features/auth/callSlice';

const VideoCall = () => {
    const { userId } = useParams();  // recipient's ID
    const currentUser  = useSelector((state) => state.user.user); // current logged-in user (sender)
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const ws = useRef(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCallReceived, setIsCallReceived] = useState(false);
    const [isCaller, setIsCaller] = useState(true);
    const token = useSelector((state) => state.auth.token);
    const [isWsConnected, setIsWsConnected] = useState(false);
    const [senderUsername,setSenderUsername]=useState('');
    const offer = useSelector((state) => state.call.offer);
    const status=useSelector((state) => state.call.status);
    const caller=useSelector((state) => state.call.caller);
    const dispatch = useDispatch()
    console.log(`username:${currentUser.username}`)
    const pendingCandidates = [];

    useEffect(()=>{
        if (status==='pending'){
            setIsCallReceived(true);
            setIsCaller(false);
            handleOffer(offer);
            setSenderUsername(caller);

        }},[currentUser]);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        ws.current = new WebSocket(`${wsProtocol}://localhost:8000/ws/video-call/${currentUser.id}/${userId}/?token=${token}`);

        ws.current.onopen = () => {
            console.log("WebSocket connection established.");
            setIsWsConnected(true);
        };

        ws.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("Message received from WebSocket:", data);

            switch (data.action) {
                case 'video_call_offer':
                    setIsCallReceived(true);
                    setIsCaller(false);
                    handleOffer(data.offer);
                    setSenderUsername(data.sender_username); 
                    break;
                case 'video_call_answer':
                    handleVideoCallAnswered(data.answer);
                    break;
                case 'ice_candidate':
                    handleICECandidate(data.candidate);
                    break;
                case 'call_accepted':
                    setIsCallActive(true);
                    setIsCallReceived(false);
                    break;
                case 'call_rejected':
                    setIsCallReceived(false);
                    break;
                case 'end_call':
                    if (isCallActive) {
                        endCall();
                    }
                    break;
                default:
                    console.warn(`Unhandled action type: ${data.action}`);
                    break;
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
                console.log("WebSocket connection closed.");
                setIsWsConnected(false);
            }
        };
    }, [userId, isCallActive]);



    useEffect(() => {
        const callSocket = new WebSocket(`ws://localhost:8000/ws/call/${currentUser.id}/?token=${token}`);
    
        callSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(`websocket data:${data},status:${data.status},caller_id:${data.caller_id},datatype:${data.type}`)
          console.log(`${userId}`)
          if (data.type === 'call_notification' && data.status === 'declined' && parseInt(data.caller_id) === parseInt(userId))  {
            
            endCall();
    
          }
        };
    
        callSocket.onclose = () => {
          console.error("Call WebSocket closed unexpectedly");
        };
    
        return () => {
          callSocket.close();
        };
      }, [userId]);

    const startLocalVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => {
                    if (peerConnection.current) {
                        peerConnection.current.addTrack(track, stream);
                    }
                });
            }
        } catch (error) {
            console.error("Error accessing local media: ", error);
        }
    };
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate) {
                // Wait for WebSocket to be open
                while (ws.current.readyState !== WebSocket.OPEN) {
                    await delay(100); // Check every 100ms
                }
                
                ws.current.send(JSON.stringify({
                    action: 'ice_candidate',
                    candidate: event.candidate,
                    recipient_id: userId
                }));
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    };

    const handleOffer = async (offer) => {
        if (!peerConnection.current) createPeerConnection();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    
        // Add any pending candidates now that the remote description is set
        while (pendingCandidates.length > 0) {
            const candidate = pendingCandidates.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const acceptCall = async () => {
        if (!peerConnection.current || isCaller) return;

        await startLocalVideo();
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        ws.current.send(JSON.stringify({
            action: 'video_call_answer',
            answer: peerConnection.current.localDescription,
            recipient_id: userId
        }));

        setIsCallActive(true);
        setIsCallReceived(false);
        
    };

    const handleVideoCallAnswered = async (answer) => {
        if (!peerConnection.current) {
            createPeerConnection();
        }
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Add any pending candidates now that the remote description is set
        while (pendingCandidates.length > 0) {
            const candidate = pendingCandidates.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handleICECandidate = async (candidate) => {
        if (candidate) {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                // Remote description is set; add the candidate immediately
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                // Remote description is not set; store the candidate for later
                pendingCandidates.push(candidate);
            }
        }
    };

    const startCall = async () => {
        if (!peerConnection.current) createPeerConnection();
        await startLocalVideo();
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        ws.current.send(JSON.stringify({
            action: 'video_call_offer',
            offer: offer,
            recipient_id: userId,
            sender_username:currentUser.username,

        }));
        dispatch(initiateCall({recipientId:userId,token,offer}))
        setIsCallActive(true);

       
    };

    const endCall = () => {
        if (ws.current) {
            ws.current.send(JSON.stringify({
                action: 'end_call',
                sender_id: currentUser.id,
                recipient_id: userId
            }));
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsCallActive(false);
        setIsCallReceived(false);
        setIsCaller(true);
        dispatch(setCallerId(null));
        dispatch(setStatus(''))
        dispatch(setOffer(''))
        dispatch(setCaller(''));
    };

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-gray-200 overflow-hidden relative">
        {/* Local Video Section */}
        <div className="flex-1 flex flex-col items-center p-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-lg h-full md:max-h-96 relative">
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-red-700 transition duration-200" onClick={endCall}>
                    <FaPhoneSlash className="w-8 h-8" />
                </div>
            </div>
            {/* Local Video Label */}
            <p className="mt-2 text-center text-lg font-semibold">You</p>
        </div>
    
        {/* Remote Video Section */}
        <div className="flex-1 flex flex-col items-center p-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-lg h-full md:max-h-96 relative">
                <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
            </div>
            {/* Remote Video Label */}
            <p className="mt-2 text-center text-lg font-semibold">{isCallReceived && !isCaller ? userId : 'Other User'}</p>
        </div>
    
        {/* Start Call Button */}
        {!isCallActive && !isCallReceived && isCaller && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <button
                    onClick={startCall}
                    className="bg-blue-600 text-white px-10 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 flex items-center"
                >
                    <span className="text-xl font-semibold">Start Call</span>
                </button>
            </div>
        )}
    
        {/* Incoming Call Modal */}
        {!isCallActive && isCallReceived && !isCaller && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
                    <p className="text-2xl font-bold mb-4">Incoming Call</p>
                    <p className="text-lg mb-2">From: {senderUsername}</p>
                    <div className="flex justify-center space-x-6 mt-4">
                        <button
                            onClick={acceptCall}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            Accept
                        </button>
                        <button
                            onClick={endCall}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default VideoCall;
