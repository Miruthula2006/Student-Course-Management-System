import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import PageCss from "./PageCss.jsx";
import { useAuth } from "../auth/useAuth.js";
import api from "../services/api.js";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Chat = () => {
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(socketUrl, {
      autoConnect: false,
      auth: { token: sessionStorage.getItem("token") }
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (connectError) => setError(connectError.message));
    socket.on("receive_message", (incoming) => {
      setMessages((current) => [...current, incoming]);
    });
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  async function loadHistory(event) {
    event.preventDefault();
    setError("");
    try {
      const response = await api.get(`/api/v1/messages/${encodeURIComponent(recipientId)}`);
      setMessages(response.data.messages || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load message history.");
    }
  }

  function sendMessage(event) {
    event.preventDefault();
    socketRef.current?.emit("send_message", { recipientId, text: message }, (result) => {
      if (result?.success) setMessage("");
      else setError(result?.message || "Unable to send message.");
    });
  }

  return (
    <>
      <PageCss href="/css/style.css" />
      <PageCss href="/css/dashboard.css" />
      <main className="main-content">
        <header className="topbar">
          <h1>Student Chat</h1>
          <p>Connection: {connected ? "Online" : "Offline"}</p>
        </header>
        {error && <p role="alert">{error}</p>}
        <section className="course-card">
          <form onSubmit={loadHistory}>
            <label htmlFor="chatRecipient">Recipient user ID</label>
            <input id="chatRecipient" value={recipientId} onChange={(event) => setRecipientId(event.target.value)} required />
            <button type="submit">Load conversation</button>
          </form>
          <div aria-live="polite">
            {messages.map((item) => (
              <p key={item._id}>
                <strong>{String(item.sender) === user?.id ? "You" : "Student"}:</strong> {item.text}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <label htmlFor="chatMessage">Message</label>
            <input id="chatMessage" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required />
            <button type="submit" disabled={!connected || !recipientId.trim()}>Send</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Chat;