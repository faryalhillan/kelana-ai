"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
	Conversation,
	ConversationMessage,
	createConversation,
	deleteConversation,
	getConversationMessages,
	listConversations,
	renameConversation,
	sendConversationMessage,
} from "@/services/conversationService";

function formatConversationDate(value: string) {
	return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatMessageTime(value: string) {
	return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function renderMarkdown(text: string) {
	const lines = text.split("\n");
	const elements: React.ReactNode[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Skip empty lines
		if (!line.trim()) {
			i++;
			continue;
		}

		// Check for headers
		const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headerMatch) {
			const level = headerMatch[1].length;
			const content = headerMatch[2];
			const Tag = `h${Math.min(level + 2, 6)}`;
			
			elements.push(
				React.createElement(
					Tag,
					{ key: `h-${i}`, style: { marginTop: level === 1 ? "1.2em" : "1em", marginBottom: "0.5em", fontWeight: "700" } },
					processInlineFormatting(content, `h-${i}`)
				)
			);
			i++;
			continue;
		}

		// Check for unordered list
		if (line.match(/^\s*[-*]\s+/)) {
			const listItems: string[] = [];
			while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
				listItems.push(lines[i].replace(/^\s*[-*]\s+/, ""));
				i++;
			}
			elements.push(
				<ul key={`ul-${i}`} style={{ marginLeft: "1.5em", marginBottom: "0.8em" }}>
					{listItems.map((item, idx) => (
						<li key={idx} style={{ marginBottom: "0.3em" }}>
							{processInlineFormatting(item, `ul-${i}-${idx}`)}
						</li>
					))}
				</ul>
			);
			continue;
		}

		// Check for ordered list
		if (line.match(/^\s*\d+\.\s+/)) {
			const listItems: string[] = [];
			while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
				listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
				i++;
			}
			elements.push(
				<ol key={`ol-${i}`} style={{ marginLeft: "1.5em", marginBottom: "0.8em" }}>
					{listItems.map((item, idx) => (
						<li key={idx} style={{ marginBottom: "0.3em" }}>
							{processInlineFormatting(item, `ol-${i}-${idx}`)}
						</li>
					))}
				</ol>
			);
			continue;
		}

		// Regular paragraph - collect consecutive non-special lines
		let paragraph = line;
		i++;
		while (i < lines.length && lines[i].trim() && !lines[i].match(/^(#{1,6}\s+|\s*[-*]\s+|\s*\d+\.\s+)/)) {
			paragraph += " " + lines[i];
			i++;
		}

		elements.push(
			<p key={`p-${i}`} style={{ marginBottom: "0.8em" }}>
				{processInlineFormatting(paragraph, `p-${i}`)}
			</p>
		);
	}

	return <>{elements}</>;
}

function processInlineFormatting(text: string, keyPrefix: string) {
	const parts: (string | React.ReactNode)[] = [];
	let lastIndex = 0;

	// Regex to match **bold**, *italic*, and `code`
	const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
	let match;

	while ((match = regex.exec(text)) !== null) {
		// Add text before match
		if (match.index > lastIndex) {
			parts.push(text.substring(lastIndex, match.index));
		}

		const matched = match[0];
		if (matched.startsWith("**") && matched.endsWith("**")) {
			// Bold
			parts.push(
				<strong key={`${keyPrefix}-${match.index}`}>
					{matched.slice(2, -2)}
				</strong>
			);
		} else if (matched.startsWith("*") && matched.endsWith("*")) {
			// Italic
			parts.push(
				<em key={`${keyPrefix}-${match.index}`}>
					{matched.slice(1, -1)}
				</em>
			);
		} else if (matched.startsWith("`") && matched.endsWith("`")) {
			// Code
			parts.push(
				<code key={`${keyPrefix}-${match.index}`} style={{ background: "rgba(24,35,33,0.05)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "0.9em" }}>
					{matched.slice(1, -1)}
				</code>
			);
		}

		lastIndex = regex.lastIndex;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex));
	}

	return parts.length === 0 ? text : parts;
}

export default function ChatPage() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [renameDraft, setRenameDraft] = useState("");
	const [isRenaming, setIsRenaming] = useState(false);
	const [isLoadingConversations, setIsLoadingConversations] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState("");
	const latestMessageRef = useRef<HTMLDivElement>(null);

	const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null;

	useEffect(() => {
		listConversations()
			.then((data) => {
				setConversations(data);
				if (data.length > 0) setSelectedId(data[0].id);
			})
			.catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load your conversations."))
			.finally(() => setIsLoadingConversations(false));
	}, []);

	useEffect(() => {
		if (selectedId === null) return;

		getConversationMessages(selectedId)
			.then(setMessages)
			.catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load this conversation."))
	}, [selectedId]);

	useEffect(() => {
		latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [selectedId, messages.length, isSending]);

	const startConversation = async () => {
		setError("");
		try {
			const result = await createConversation();
			const conversation: Conversation = { id: result.conversation_id, title: null, created_at: new Date().toISOString() };
			setConversations((current) => [conversation, ...current]);
			setSelectedId(conversation.id);
			setMessages([]);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to start a conversation.");
		}
	};

	const handleSend = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const content = draft.trim();
		if (!content || selectedId === null || isSending) return;

		setDraft("");
		setError("");
		setIsSending(true);
		const temporaryMessage: ConversationMessage = {
			id: Date.now(),
			conversation_id: selectedId,
			role: "user",
			content,
			created_at: new Date().toISOString(),
		};
		setMessages((current) => [...current, temporaryMessage]);

		try {
			const result = await sendConversationMessage(selectedId, content);
			setMessages((current) => [...current.filter((message) => message.id !== temporaryMessage.id), {
				...temporaryMessage,
				id: result.message_id,
			}, {
				id: result.assistant_message_id,
				conversation_id: selectedId,
				role: "assistant",
				content: result.answer,
				created_at: new Date().toISOString(),
			}]);
			if (!selectedConversation?.title) {
				setConversations((current) => current.map((conversation) => conversation.id === selectedId ? { ...conversation, title: content.slice(0, 100) } : conversation));
			}
		} catch (requestError) {
			setMessages((current) => current.filter((message) => message.id !== temporaryMessage.id));
			setError(requestError instanceof Error ? requestError.message : "Unable to send your message.");
		} finally {
			setIsSending(false);
		}
	};

	const handleRename = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (selectedId === null || !renameDraft.trim()) return;
		setError("");
		try {
			const updated = await renameConversation(selectedId, renameDraft.trim());
			setConversations((current) => current.map((conversation) => conversation.id === selectedId ? updated : conversation));
			setIsRenaming(false);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to rename this conversation.");
		}
	};

	const handleDelete = async (conversationId: number) => {
		const conversation = conversations.find((item) => item.id === conversationId);
		if (!conversation || !window.confirm(`Delete "${conversation.title || "Untitled conversation"}"? This cannot be undone.`)) return;

		setError("");
		try {
			await deleteConversation(conversationId);
			const remaining = conversations.filter((item) => item.id !== conversationId);
			setConversations(remaining);
			if (selectedId === conversationId) {
				setSelectedId(remaining[0]?.id ?? null);
				setMessages([]);
				setIsRenaming(false);
			}
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to delete this conversation.");
		}
	};

	return <main className="chat-shell">
		<Navbar active="chat" />
		<section className="chat-heading"><p className="eyebrow">CONVERSATION SPACE</p><h1>Continue the journey</h1><p>Keep your travel questions together and let KelanaAI remember the thread.</p></section>
		<section className="chat-workspace">
			<aside className="conversation-sidebar" aria-label="Conversations">
				<div className="sidebar-heading"><div><p className="eyebrow">YOUR THREADS</p><h2>Conversations</h2></div><button type="button" className="new-conversation-button" onClick={startConversation} aria-label="Start a new conversation">+</button></div>
				{isLoadingConversations ? <p className="conversation-placeholder">Loading threads…</p> : conversations.length === 0 ? <div className="conversation-placeholder"><span>✦</span><p>No conversations yet.</p><button type="button" className="text-button" onClick={startConversation}>Start one</button></div> : <div className="conversation-list">{conversations.map((conversation) => <div key={conversation.id} className={`conversation-item ${conversation.id === selectedId ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => { setSelectedId(conversation.id); setIsRenaming(false); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(conversation.id); setIsRenaming(false); } }}><div className="conversation-item-copy"><strong>{conversation.title || "Untitled conversation"}</strong><span>{formatConversationDate(conversation.created_at)}</span></div><button type="button" className="conversation-delete" aria-label={`Delete ${conversation.title || "untitled conversation"}`} onClick={(event) => { event.stopPropagation(); void handleDelete(conversation.id); }}>×</button></div>)}</div>}
			</aside>
			<section className="chat-panel" aria-label="Chat with KelanaAI">
				{selectedConversation ? <>
					<header className="chat-panel-header"><div><p className="eyebrow">ACTIVE THREAD</p>{isRenaming ? <form className="rename-form" onSubmit={handleRename}><input autoFocus value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={100} aria-label="Conversation title" /><button type="submit" className="small-action">Save</button><button type="button" className="small-cancel" onClick={() => setIsRenaming(false)}>Cancel</button></form> : <h2>{selectedConversation.title || "New conversation"}</h2>}</div>{!isRenaming ? <button type="button" className="rename-button" onClick={() => { setRenameDraft(selectedConversation.title || ""); setIsRenaming(true); }}>Rename</button> : null}</header>
					<div className="message-list" aria-live="polite">{messages.length === 0 && !isSending ? <div className="chat-empty"><span className="empty-icon">✦</span><h3>Where should we go?</h3><p>Ask about a destination, itinerary, budget, or the next day of your trip.</p></div> : messages.map((message) => <article key={message.id} className={`chat-message ${message.role}`}><span className="message-role">{message.role === "user" ? "You" : "KelanaAI"}</span><div className="message-content">{message.role === "assistant" ? renderMarkdown(message.content) : <p>{message.content}</p>}</div><time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time></article>)}{isSending ? <div className="chat-message assistant typing-message" role="status" aria-label="KelanaAI is typing"><span className="message-role">KelanaAI</span><span className="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span><span className="typing-label">Thinking…</span></div> : null}<div ref={latestMessageRef} aria-hidden="true" /></div>
					<form className="message-form" onSubmit={handleSend}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask a follow-up about your trip…" rows={2} disabled={isSending} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button type="submit" className="send-button" disabled={isSending || !draft.trim()} aria-label="Send message">{isSending ? "…" : "→"}</button></form>
				</> : <div className="chat-empty no-thread"><span className="empty-icon">✦</span><h2>Start a conversation</h2><p>Your saved conversations will appear here.</p><button type="button" className="primary-link" onClick={startConversation}>New conversation <span aria-hidden="true">→</span></button></div>}
			</section>
		</section>
		{error ? <p className="status error chat-error">{error}</p> : null}
		<Footer />
	</main>;
}
