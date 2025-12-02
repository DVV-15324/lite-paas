import React, { useState, useEffect, useRef } from "react";

interface ChatMessage {
    id: string;
    sender: "user" | "support";
    content: string;
    time: string;
    created_at?: string;
}

interface SupportRequestItem {
    id: string;
    service: string;
    title: string;
    date: string;
    status: string;
    content?: string;
    service_type?: string;
    service_sub_id?: string;
}

interface ChatPageProps {
    request: SupportRequestItem;
    onBack: () => void;
}

interface WSMessage {
    sender_id: string;
    message: string;
    message_type: string;
}

const baseURL = 'http://localhost:3000';

const ChatPage: React.FC<ChatPageProps> = ({ request, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMsg, setNewMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    // Lấy current user ID
    const getCurrentUserId = (): string => {
        const userData = localStorage.getItem("user_info");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.id || "1";
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        return "1";
    };

    // Fetch messages từ API (cho lịch sử tin nhắn)
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${baseURL}/v2/ticket-message/${request.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();

            const currentUserId = getCurrentUserId();
            const transformedMessages: ChatMessage[] = data.map((msg: any) => ({
                id: msg.id,
                sender: msg.sender_id === currentUserId ? "user" : "support",
                content: msg.message,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                created_at: msg.created_at
            }));

            setMessages(transformedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Kết nối WebSocket
    const connectWebSocket = () => {
        try {
            const token = localStorage.getItem("access_token");
            const wsUrl = `ws://localhost:3000/v1/ticket-message/ws?token=${token}&ticket=${request.id}`;
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            ws.current.onmessage = (event) => {
                try {
                    console.log('Received WebSocket message:', event.data);
                    const data = JSON.parse(event.data);

                    const currentUserId = getCurrentUserId();
                    const newMessage: ChatMessage = {
                        id: data.id || `ws-${Date.now()}`,
                        sender: String(data.sender_id) === currentUserId ? "user" : "support",
                        content: data.message,
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        created_at: new Date().toISOString()
                    };

                    setMessages(prev => {
                        if (!prev.some(msg => msg.id === newMessage.id)) {
                            return [...prev, newMessage];
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);

                if (event.code !== 1000) {
                    setTimeout(() => {
                        if (ws.current?.readyState === WebSocket.CLOSED) {
                            connectWebSocket();
                        }
                    }, 3000);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

        } catch (error) {
            console.error('Error connecting WebSocket:', error);
        }
    };

    // Gửi tin nhắn qua WebSocket
    const sendMessageViaWebSocket = (message: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
                reject(new Error('WebSocket is not connected'));
                return;
            }

            const messageData: WSMessage = {
                sender_id: getCurrentUserId(),
                message: message,
                message_type: "text"
            };

            try {
                ws.current.send(JSON.stringify(messageData));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };

    useEffect(() => {
        // Fetch lịch sử tin nhắn
        fetchMessages();

        // Kết nối WebSocket
        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close(1000, "Component unmounting");
            }
        };
    }, [request.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMsg.trim()) return;

        try {
            setSending(true);

            // Optimistically add message to UI
            const tempMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                sender: "user",
                content: newMsg,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages(prev => [...prev, tempMessage]);
            const messageToSend = newMsg;
            setNewMsg("");

            // Gửi qua WebSocket
            await sendMessageViaWebSocket(messageToSend);

            // Remove temporary message - real message sẽ đến qua WebSocket
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            }, 1000);

        } catch (error) {
            console.error('Error sending message via WebSocket:', error);
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
            alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative bg-gray-50 p-4 lg:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center space-x-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{request.title}</h2>
                            <p className="text-sm text-gray-500">
                                {request.service} ({request.status})
                            </p>
                            <p className="text-xs text-gray-400">{request.date}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                                title={isConnected ? 'Đã kết nối' : 'Mất kết nối'} />
                            <span className="text-xs text-gray-500">
                                {isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        className="text-gray-600 hover:text-blue-500 font-semibold px-3 py-1 border border-gray-300 rounded-lg hover:border-blue-300 transition"
                    >
                        ← Quay lại
                    </button>
                </div>

                {/* Chat messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {loading ? (
                        <p className="text-gray-500 text-center py-8">Đang tải tin nhắn...</p>
                    ) : messages.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Chưa có tin nhắn nào.</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-xl text-sm ${msg.sender === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-800"
                                        } ${msg.id.startsWith('temp-') ? 'opacity-70 animate-pulse' : ''}`}
                                >
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"} text-right`}>
                                        {msg.time}
                                        {msg.id.startsWith('temp-') && ' • Đang gửi...'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input box */}
                <form onSubmit={handleSend} className="border-t p-3 flex items-center space-x-3 bg-white">
                    <input
                        type="text"
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-5 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        disabled={sending || !newMsg.trim() || !isConnected}
                    >
                        {sending ? '⏳' : '📤'} {sending ? 'Đang gửi...' : 'Gửi'}
                    </button>
                </form>

                {/* Connection status */}
                {!isConnected && (
                    <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-center">
                        <p className="text-yellow-700 text-sm flex items-center justify-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Đang kết nối lại... Tin nhắn có thể bị trễ
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;