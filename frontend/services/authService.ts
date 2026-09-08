const AUTH_TOKEN_KEY = "kelana_token";
const AUTH_TOKEN_TYPE_KEY = "kelana_token_type";

export type LoginResponse = {
	access_token: string;
	token_type: string;
};

export type UserProfile = {
	id: number;
	name: string;
	email: string;
	created_at: string;
	theme_preference?: string;
	total_trips: number;
};

export function getAuthToken() {
	if (typeof window === "undefined") return "";
	return localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
}

export function getAuthTokenType() {
	if (typeof window === "undefined") return "bearer";
	return localStorage.getItem(AUTH_TOKEN_TYPE_KEY) ?? "bearer";
}

export function saveAuthToken(response: LoginResponse) {
	if (typeof window === "undefined") return;
	localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
	localStorage.setItem(AUTH_TOKEN_TYPE_KEY, response.token_type);
}

export function logout() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
	
	// Use a safer navigation method that doesn't break Web Vitals
	if (typeof window !== "undefined") {
		// Use setTimeout to ensure the navigation happens after current execution
		setTimeout(() => {
			window.location.replace("/login");
		}, 0);
	}
}

export async function login(email: string, password: string): Promise<LoginResponse> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error((data as { detail?: string }).detail || "Unable to login. Please try again.");
	}

	return data as LoginResponse;
}

export async function register(name: string, email: string, password: string) {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error((data as { detail?: string }).detail || "Unable to create account.");
	}

	return data;
}

export async function getProfile(): Promise<UserProfile> {
	const token = getAuthToken();
	if (!token) throw new Error("No token found.");

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error((data as { detail?: string }).detail || "Unable to load profile.");
	}

	return data as UserProfile;
}
