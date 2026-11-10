import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import PageCss from "../components/PageCss.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import ChatThread from "../components/ChatThread.jsx";
import api from "../services/api.js";
import "../components/chat.css";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

function mergeMessages(current, incoming) {
    const messages = new Map(current.map((item) => [item._id, item]));
    incoming.forEach((item) => messages.set(item._id, item));
    return [...messages.values()].sort(
        (first, second) => new Date(first.createdAt) - new Date(second.createdAt)
    );
}

const AdminChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const selectedStudentIdRef = useRef("");
    const conversationRequestRef = useRef(0);
    const conversationsRequestRef = useRef(0);

    const loadConversations = useCallback(async () => {
        const requestId = ++conversationsRequestRef.current;
        try {
            const response = await api.get("/api/v1/messages/conversations");
            if (requestId === conversationsRequestRef.current) {
                setConversations(response.data.conversations || []);
                setError("");
            }
        } catch (requestError) {
            if (requestId === conversationsRequestRef.current) {
                setError(requestError.response?.data?.message || "Unable to load conversations.");
            }
        } finally {
            if (requestId === conversationsRequestRef.current) setLoadingList(false);
        }
    }, []);

    const loadConversation = useCallback(async (studentId) => {
        if (!studentId) return;
        const requestId = ++conversationRequestRef.current;
        setLoadingMessages(true);
        try {
            const response = await api.get(
                `/api/v1/messages/conversations/${encodeURIComponent(studentId)}`
            );
            if (requestId === conversationRequestRef.current) {
                setMessages((current) => mergeMessages(current, response.data.messages || []));
                setError("");
            }
        } catch (requestError) {
            if (requestId === conversationRequestRef.current) {
                setError(requestError.response?.data?.message || "Unable to load this conversation.");
            }
        } finally {
            if (requestId === conversationRequestRef.current) setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const socket = io(socketUrl, {
            autoConnect: false,
            auth: { token: sessionStorage.getItem("token") }
        });
        socket.on("connect", () => {
            if (!active) return;
            setConnected(true);
            loadConversations();
            if (selectedStudentIdRef.current) {
                loadConversation(selectedStudentIdRef.current);
            }
        });
        socket.on("disconnect", () => active && setConnected(false));
        socket.on("connect_error", (connectError) => {
            if (!active) return;
            setConnected(false);
            setError(connectError.message || "Unable to connect to chat. Reconnecting…");
        });
        socket.on("receive_message", (incoming) => {
            if (!active || !incoming.conversationId) return;
            conversationsRequestRef.current += 1;
            const studentName = incoming.sender?.role === "student"
                ? incoming.sender.name
                : incoming.recipient?.name;
            setConversations((current) => {
                const existing = current.find(
                    (conversation) => conversation.studentId === incoming.conversationId
                );
                const updated = {
                    studentId: incoming.conversationId,
                    studentName: studentName || existing?.studentName || "Student",
                    lastMessage: incoming.text,
                    updatedAt: incoming.createdAt
                };
                return [
                    updated,
                    ...current.filter(
                        (conversation) => conversation.studentId !== incoming.conversationId
                    )
                ];
            });
            if (incoming.conversationId === selectedStudentIdRef.current) {
                setMessages((current) => mergeMessages(current, [incoming]));
            }
        });
        socket.connect();
        Promise.resolve().then(loadConversations);

        return () => {
            active = false;
            socket.disconnect();
        };
    }, [loadConversation, loadConversations]);

    async function sendMessage(text) {
        const recipientId = selectedStudentId;
        setSending(true);
        setError("");
        try {
            const response = await api.post(
                `/api/v1/messages/conversations/${encodeURIComponent(recipientId)}`,
                { text, clientMessageId: crypto.randomUUID() }
            );
            if (selectedStudentIdRef.current === recipientId) {
                setMessages((current) => mergeMessages(current, [response.data.message]));
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to send your reply. Please try again.");
            throw requestError;
        } finally {
            setSending(false);
        }
    }

    function selectConversation(studentId) {
        if (studentId === selectedStudentId) return;
        selectedStudentIdRef.current = studentId;
        setSelectedStudentId(studentId);
        setMessages([]);
        setError("");
        loadConversation(studentId);
    }

    const selectedConversation = conversations.find(
        (conversation) => conversation.studentId === selectedStudentId
    );

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />
            <div className="container">
                <aside className="sidebar">
                    <h2><i className="fa-solid fa-user-shield"></i> SCMS</h2>
                    <p>Administrator Panel</p>
                    <ul>
                        <li><Link to="/admin-dashboard"><i className="fa-solid fa-house"></i>Dashboard</Link></li>
                        <li><Link to="/manage-courses"><i className="fa-solid fa-book"></i>Manage Courses</Link></li>
                        <li><Link to="/add-course"><i className="fa-solid fa-circle-plus"></i>Add Course</Link></li>
                        <li><Link to="/manage-students"><i className="fa-solid fa-users"></i>Manage Students</Link></li>
                        <li><Link to="/view-enrollments"><i className="fa-solid fa-user-check"></i>Enrollments</Link></li>
                        <li className="active"><Link to="/admin-chat"><i className="fa-solid fa-comments"></i>Chat</Link></li>
                        <li><LogoutButton admin /></li>
                    </ul>
                </aside>
                <main className="main-content">
                    <header className="topbar chat-page-heading">
                        <div>
                            <h1>Student Messages</h1>
                            <p>Reply to student conversations in real time.</p>
                        </div>
                        <span className={`chat-connection ${connected ? "is-connected" : "is-disconnected"}`}>
                            <span aria-hidden="true"></span>
                            {connected ? "Connected" : "Reconnecting"}
                        </span>
                    </header>

                    {error && !selectedStudentId && <p className="chat-error" role="alert">{error}</p>}
                    <section className="admin-chat-layout" aria-label="Student conversations">
                        <nav className="conversation-list" aria-label="Conversations">
                            <h2>Conversations</h2>
                            {loadingList ? (
                                <p className="chat-list-empty">Loading conversations…</p>
                            ) : conversations.length ? (
                                conversations.map((conversation) => (
                                    <button
                                        type="button"
                                        key={conversation.studentId}
                                        className={`conversation-item ${selectedStudentId === conversation.studentId ? "is-selected" : ""}`}
                                        onClick={() => selectConversation(conversation.studentId)}
                                        aria-current={selectedStudentId === conversation.studentId ? "true" : undefined}
                                    >
                                        <span className="conversation-avatar" aria-hidden="true">
                                            {conversation.studentName.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="conversation-preview">
                                            <strong>{conversation.studentName}</strong>
                                            <span>{conversation.lastMessage}</span>
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className="chat-list-empty">Student conversations will appear here.</p>
                            )}
                        </nav>
                        {selectedConversation ? (
                            <ChatThread
                                contactName={selectedConversation.studentName}
                                currentRole="admin"
                                messages={messages}
                                loading={loadingMessages}
                                sending={sending}
                                connected={connected}
                                error={selectedStudentId ? error : ""}
                                onSend={sendMessage}
                            />
                        ) : (
                            <div className="chat-select-state">
                                <i className="fa-regular fa-comments" aria-hidden="true"></i>
                                <h2>Select a conversation</h2>
                                <p>Choose a student to view messages and send a reply.</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default AdminChat;
