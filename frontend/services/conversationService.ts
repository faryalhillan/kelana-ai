import { apiRequest } from "@/services/tripService";

export type Conversation = {
	id: number;
	title: string | null;
	created_at: string;
	updated_at: string;
	last_message?: string | null;
	last_message_role?: "user" | "assistant" | null;
};

export type ConversationMessage = {
	id: number;
	conversation_id: number;
	role: "user" | "assistant";
	content: string;
	created_at: string;
};

export type SendMessageResponse = {
	conversation_id: number;
	message_id: number;
	assistant_message_id: number;
	answer: string;
};

export function listConversations() {
	return apiRequest<Conversation[]>("/api/v1/conversations");
}

export function createConversation() {
	return apiRequest<{ conversation_id: number }>("/api/v1/conversations", {
		method: "POST",
	});
}

export function getConversationMessages(conversationId: number) {
	return apiRequest<ConversationMessage[]>(`/api/v1/conversations/${conversationId}/messages`);
}

export function sendConversationMessage(conversationId: number, content: string) {
	return apiRequest<SendMessageResponse>(`/api/v1/conversations/${conversationId}/messages`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});
}

export function renameConversation(conversationId: number, title: string) {
	return apiRequest<Conversation>(`/api/v1/conversations/${conversationId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title }),
	});
}

export function deleteConversation(conversationId: number) {
	return apiRequest<{ message: string }>(`/api/v1/conversations/${conversationId}`, {
		method: "DELETE",
	});
}
