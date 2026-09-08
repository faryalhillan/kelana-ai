import { apiRequest } from "@/services/tripService";

export type RefinementResponse = {
	conversation_id: number;
	message_id: number;
	assistant_message_id: number;
	response_text: string;
	requires_changes: boolean;
	proposed_changes?: {
		daily_itinerary: Array<{
			day: number;
			title: string;
			morning: string[];
			afternoon: string[];
			evening: string[];
			estimated_cost: number;
		}>;
		change_summary: string;
	} | null;
};

export type TripConversation = {
	conversation_id: number;
	trip_id: number;
};

export function getTripConversation(tripId: number) {
	return apiRequest<TripConversation>(`/api/v1/trips/${tripId}/conversation`);
}

export function refineTripItinerary(tripId: number, content: string) {
	return apiRequest<RefinementResponse>(`/api/v1/trips/${tripId}/refine`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});
}

export function applyTripChanges(tripId: number, proposedChanges: unknown) {
	return apiRequest<{ trip_id: number; message: string; updated_recommendation: unknown }>(
		`/api/v1/trips/${tripId}/apply-changes`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ proposed_changes: proposedChanges }),
		}
	);
}
