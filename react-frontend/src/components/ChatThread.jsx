import { useEffect, useRef, useState } from "react";

const formatTimestamp = (value) => new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
});

const ChatThread = ({
    contactName,
    currentRole,
    messages,
    loading,
    sending,
    connected,
    error,
    onSend
}) => {
    const [text, setText] = useState("");
    const [sendError, setSendError] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!text.trim() || sending) return;
        const submittedText = text.trim();
        setSendError("");
        try {
            await onSend(submittedText);
            setText("");
        } catch {
            setSendError("Your message was not sent. Please try again.");
        }
    }

    return (
        <section className="chat-panel" aria-label={`Conversation with ${contactName}`}>
            <header className="chat-thread-header">
                <div className="chat-contact-avatar" aria-hidden="true">
                    <i className="fa-solid fa-user-shield"></i>
                </div>
                <div>
                    <h2>{contactName}</h2>
                    <p>SCMS support</p>
                </div>
                <span className={`chat-connection ${connected ? "is-connected" : "is-disconnected"}`}>
                    <span aria-hidden="true"></span>
                    {connected ? "Connected" : "Reconnecting"}
                </span>
            </header>

            {error && <p className="chat-error" role="alert">{error}</p>}

            <div className="chat-messages" aria-live="polite" aria-busy={loading}>
                {loading ? (
                    <p className="chat-empty-state">Loading conversation…</p>
                ) : messages.length ? (
                    messages.map((message) => {
                        const sent = message.sender?.role === currentRole;
                        return (
                            <article
                                key={message._id}
                                className={`chat-message ${sent ? "is-sent" : "is-received"}`}
                            >
                                <span className="chat-message-sender">
                                    {sent ? "You" : message.sender?.name || contactName}
                                </span>
                                <p>{message.text}</p>
                                <time dateTime={message.createdAt}>
                                    {formatTimestamp(message.createdAt)}
                                </time>
                            </article>
                        );
                    })
                ) : (
                    <p className="chat-empty-state">
                        No messages yet. Send a message to start your conversation.
                    </p>
                )}
                <div ref={messagesEndRef} />
            </div>

            {sendError && <p className="chat-error chat-send-error" role="alert">{sendError}</p>}
            <form className="chat-composer" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="chat-message-input">Message</label>
                <textarea
                    id="chat-message-input"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Write a message…"
                    maxLength={2000}
                    rows={2}
                    required
                />
                <button type="submit" disabled={!text.trim() || sending}>
                    <i className="fa-solid fa-paper-plane" aria-hidden="true"></i>
                    {sending ? "Sending…" : "Send"}
                </button>
            </form>
        </section>
    );
};

export default ChatThread;
