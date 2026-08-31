import { getAuthToken } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Trip = {
	id: number;
	destinations: string[];
	country: string;
	days: number;
	budget: number;
	hotel_cost: number;
	transportation_cost: number;
	food_cost: number;
	miscellaneous_cost: number;
	total_estimated_cost: number;
	budget_exceeded: boolean;
	currency: string;
	travel_month: string;
	category: string;
	daily_budget: number;
	recommendation_transport: string;
	season: string;
	travel_style: string;
	created_at?: string;
	ai_recommendations?: string | null;
};

export type DailyPlan = {
	day: number;
	title: string;
	morning: string[];
	afternoon: string[];
	evening: string[];
	estimated_cost: number;
};

export type Recommendation = {
	title: string;
	daily_itinerary: DailyPlan[];
	travel_tips: string[];
	local_food_recommendations: string[];
	estimated_budget_breakdown: Record<string, number>;
	assumptions: string[];
};

function getClientToken() {
	if (typeof window === "undefined") return "";
	return getAuthToken();
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
	const headers = new Headers(init?.headers ?? {});
	const token = getClientToken();

	if (!token && typeof window !== "undefined") {
		window.location.href = "/login";
		throw new Error("Please log in to continue.");
	}

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${API_URL}${path}`, {
		...init,
		headers,
	});
	const data = await response.json().catch(() => ({}));
	if (response.status === 401 || response.status === 403) {
		if (typeof window !== "undefined") {
			localStorage.removeItem("kelana_token");
			localStorage.removeItem("kelana_token_type");
			window.location.href = "/login";
		}
		throw new Error("Your session has expired. Please log in again.");
	}
	if (!response.ok) throw new Error((data as { detail?: string }).detail || "Something went wrong.");
	return data as T;
}

export function getTrips() { return apiRequest<Trip[]>("/api/v1/trips"); }
export function getTrip(id: number) { return apiRequest<Trip>(`/api/v1/trips/${id}`); }
export function generateTrip(id: number) {
	return apiRequest<{ recommendation: Recommendation }>(`/api/v1/trips/${id}/generate`, { method: "POST" });
}
