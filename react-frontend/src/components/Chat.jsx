import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import PageCss from "./PageCss.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import ChatThread from "./ChatThread.jsx";
import api from "../services/api.js";
import "./chat.css";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

function mergeMessages(current, incoming) {
    const messages = new Map(current.map((item) => [item._id, item]));
    incoming.forEach((item) => messages.set(item._id, item));
    return [...messages.values()].sort(
        (first, second) => new Date(first.createdAt) - new Date(second.createdAt)
    );
}

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const socketRef = useRef(null);

    const loadHistory = useCallback(async () => {
        try {
            const response = await api.get("/api/v1/messages/conversation");
            setMessages((current) => mergeMessages(current, response.data.messages || []));
            setError("");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load your conversation.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const socket = io(socketUrl, {
            autoConnect: false,
            auth: { token: sessionStorage.getItem("token") }
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            if (!active) return;
            setConnected(true);
            loadHistory();
        });
        socket.on("disconnect", () => active && setConnected(false));
        socket.on("connect_error", (connectError) => {
            if (!active) return;
            setConnected(false);
            setError(connectError.message || "Unable to connect to chat. Reconnecting…");
        });
        socket.on("receive_message", (incoming) => {
            if (active) setMessages((current) => mergeMessages(current, [incoming]));
        });
        socket.connect();
        Promise.resolve().then(() => {
            if (active) loadHistory();
        });

        return () => {
            active = false;
            socket.disconnect();
            socketRef.current = null;
        };
    }, [loadHistory]);

    async function sendMessage(text) {
        setSending(true);
        setError("");
        try {
            const response = await api.post("/api/v1/messages/conversation", {
                text,
                clientMessageId: crypto.randomUUID()
            });
            setMessages((current) => mergeMessages(current, [response.data.message]));
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to send your message. Please try again.");
            throw requestError;
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />
            <div className="container">
                <StudentSidebar />
                <main className="main-content">
                    <header className="topbar chat-page-heading">
                        <div>
                            <h1>Chat with Admin</h1>
                            <p>Get help directly from the SCMS administrator.</p>
                        </div>
                        <Link className="chat-back-link" to="/student-dashboard">Back to dashboard</Link>
                    </header>
                    <ChatThread
                        contactName="Administrator"
                        currentRole="student"
                        messages={messages}
                        loading={loading}
                        sending={sending}
                        connected={connected}
                        error={error}
                        onSend={sendMessage}
                    />
                </main>
            </div>
        </>
    );
};

export default Chat;
