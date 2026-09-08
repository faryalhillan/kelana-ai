"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { refineTripItinerary, applyTripChanges, type RefinementResponse } from "@/services/refinementService";
import { getConversationMessages, type ConversationMessage } from "@/services/conversationService";

type Props = {
	tripId: number;
	conversationId: number | null;
	onChangesApplied: () => void;
};

const SUGGESTIONS = [
	"More anime spots",
	"Only halal food",
	"Less walking",
	"Less rushed",
	"More food experiences",
];

export default function TripRefinement({ tripId, conversationId, onChangesApplied }: Props) {
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [pendingChanges, setPendingChanges] = useState<RefinementResponse | null>(null);
	const [isApplying, setIsApplying] = useState(false);
	const [error, setError] = useState("");
	const latestMessageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (conversationId) {
			getConversationMessages(conversationId)
				.then(setMessages)
				.catch(() => setError("Unable to load conversation history"));
		}
	}, [conversationId]);

	useEffect(() => {
		latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [messages.length, isSending]);

	const handleSend = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const content = draft.trim();
		if (!content || isSending) return;

		setDraft("");
		setError("");
		setIsSending(true);
		setPendingChanges(null);

		const temporaryMessage: ConversationMessage = {
			id: Date.now(),
			conversation_id: conversationId || 0,
			role: "user",
			content,
			created_at: new Date().toISOString(),
		};
		setMessages((current) => [...current, temporaryMessage]);

		try {
			const result = await refineTripItinerary(tripId, content);
			
			// Update messages with real IDs
			setMessages((current) => [
				...current.filter((msg) => msg.id !== temporaryMessage.id),
				{
					id: result.message_id,
					conversation_id: result.conversation_id,
					role: "user",
					content,
					created_at: new Date().toISOString(),
				},
				{
					id: result.assistant_message_id,
					conversation_id: result.conversation_id,
					role: "assistant",
					content: result.response_text,
					created_at: new Date().toISOString(),
				},
			]);

			// Store pending changes if any
			if (result.requires_changes && result.proposed_changes) {
				setPendingChanges(result);
			}
		} catch (requestError) {
			setMessages((current) => current.filter((msg) => msg.id !== temporaryMessage.id));
			setError(requestError instanceof Error ? requestError.message : "Unable to send message");
		} finally {
			setIsSending(false);
		}
	};

	const handleApplyChanges = async () => {
		if (!pendingChanges?.proposed_changes) return;

		setIsApplying(true);
		setError("");

		try {
			await applyTripChanges(tripId, pendingChanges.proposed_changes);
			setPendingChanges(null);
			
			// Add system confirmation message
			setMessages((current) => [
				...current,
				{
					id: Date.now(),
					conversation_id: conversationId || 0,
					role: "assistant",
					content: "✓ Changes applied successfully! Your itinerary has been updated.",
					created_at: new Date().toISOString(),
				},
			]);
			
			onChangesApplied();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to apply changes");
		} finally {
			setIsApplying(false);
		}
	};

	const handleSuggestion = (suggestion: string) => {
		setDraft(suggestion);
	};

	return (
		<div className="trip-refinement">
			<div className="refinement-header">
				<div>
					<p className="eyebrow">AI COPILOT</p>
					<h3>Refine with KelanaAI</h3>
					<p className="refinement-subtitle">
						Ask to adjust your itinerary, add preferences, or get travel advice.
					</p>
				</div>
			</div>

			<div className="refinement-chat">
				<div className="refinement-messages">
					{messages.length === 0 && !isSending ? (
						<div className="refinement-empty">
							<span className="empty-icon">💬</span>
							<p>Start refining your trip</p>
							<div className="refinement-suggestions">
								{SUGGESTIONS.map((suggestion) => (
									<button
										key={suggestion}
										type="button"
										className="suggestion-chip"
										onClick={() => handleSuggestion(suggestion)}
									>
										{suggestion}
									</button>
								))}
							</div>
						</div>
					) : (
						messages.map((message) => (
							<div key={message.id} className={`refinement-message ${message.role}`}>
								<span className="message-role">
									{message.role === "user" ? "You" : "KelanaAI"}
								</span>
								<div className="message-content">
									<p>{message.content}</p>
								</div>
							</div>
						))
					)}
					{isSending && (
						<div className="refinement-message assistant typing-message">
							<span className="message-role">KelanaAI</span>
							<span className="typing-dots">
								<i></i>
								<i></i>
								<i></i>
							</span>
						</div>
					)}
					<div ref={latestMessageRef} aria-hidden="true" />
				</div>

				{pendingChanges && (
					<div className="refinement-changes-panel">
						<div className="changes-header">
							<span>📝</span>
							<div>
								<strong>Proposed Changes</strong>
								<p>{pendingChanges.proposed_changes?.change_summary}</p>
							</div>
						</div>
						<div className="changes-actions">
							<button
								type="button"
								className="apply-button"
								onClick={handleApplyChanges}
								disabled={isApplying}
							>
								{isApplying ? "Applying..." : "Apply Changes"}
							</button>
							<button
								type="button"
								className="cancel-button"
								onClick={() => setPendingChanges(null)}
								disabled={isApplying}
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				<form className="refinement-form" onSubmit={handleSend}>
					<textarea
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						placeholder="Ask to adjust your trip... (e.g., 'Make it more anime-focused')"
						rows={2}
						disabled={isSending}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								event.currentTarget.form?.requestSubmit();
							}
						}}
					/>
					<button
						type="submit"
						className="refinement-send"
						disabled={isSending || !draft.trim()}
						aria-label="Send message"
					>
						{isSending ? "..." : "→"}
					</button>
				</form>
			</div>

			{error && <p className="refinement-error">{error}</p>}
		</div>
	);
}
