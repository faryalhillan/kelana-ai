"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProfile, logout, getAuthToken } from "@/services/authService";
import { useTheme } from "@/contexts/ThemeContext";
import { updateThemePreference } from "@/services/preferencesService";
import { Sun, Moon } from "lucide-react";

export default function ProfilePage() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [profile, setProfile] = useState<{ id: number; name: string; email: string; theme_preference?: string; total_trips: number } | null>(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSavingTheme, setIsSavingTheme] = useState(false);

	useEffect(() => {
		const token = getAuthToken();
		if (!token) {
			router.push("/login");
			return;
		}

		getProfile()
			.then((data) => {
				setProfile(data);
				// Sync theme from user preference if available
				if (data.theme_preference && ["light", "dark"].includes(data.theme_preference)) {
					setTheme(data.theme_preference as "light" | "dark");
				}
				setIsLoading(false);
			})
			.catch((loadError) => {
				setError(loadError instanceof Error ? loadError.message : "Unable to load your profile.");
				setIsLoading(false);
			});
	}, [router, setTheme]);

	const handleThemeChange = async (newTheme: "light" | "dark") => {
		setTheme(newTheme);
		setIsSavingTheme(true);

		try {
			await updateThemePreference(newTheme);
			// Update local profile state
			if (profile) {
				setProfile({ ...profile, theme_preference: newTheme });
			}
		} catch (error) {
			console.error("Failed to save theme preference:", error);
		} finally {
			setIsSavingTheme(false);
		}
	};

	if (isLoading) {
		return (
			<main className="history-shell">
				<Navbar active="profile" />
				<section className="history-intro">
					<p className="eyebrow">YOUR PROFILE</p>
					<h1>Profile</h1>
					<p>Personal details and trip activity from your account.</p>
				</section>
				<div className="empty-state compact">
					<span className="empty-icon">✦</span>
					<h2>Loading your profile…</h2>
				</div>
				<Footer />
			</main>
		);
	}

	return (
		<main className="history-shell">
			<Navbar active="profile" />
			<section className="history-intro">
				<p className="eyebrow">YOUR PROFILE</p>
				<h1>Profile</h1>
				<p>Personal details and trip activity from your account.</p>
			</section>

			{error ? (
				<div className="empty-state error-state">
					<span className="empty-icon">!</span>
					<h2>We could not load your profile.</h2>
					<p>{error}</p>
					<Link className="primary-link" href="/login">Go to login <span aria-hidden="true">→</span></Link>
				</div>
			) : profile ? (
				<>
					<div className="budget-panel" style={{ maxWidth: 700, margin: "0 auto 32px" }}>
						<div className="section-heading" style={{ marginBottom: 18 }}>
							<span>01</span>
							<div>
								<h2>{profile.name}</h2>
								<p>Account overview</p>
							</div>
						</div>
						<div className="trip-facts" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 24 }}>
							<div>
								<span>Email</span>
								<strong>{profile.email}</strong>
							</div>
							<div>
								<span>Total trips</span>
								<strong>{profile.total_trips}</strong>
							</div>
						</div>
						<button className="submit-button" type="button" onClick={logout}>Logout</button>
					</div>

					<div className="budget-panel" style={{ maxWidth: 700, margin: "0 auto" }}>
						<div className="section-heading" style={{ marginBottom: 18 }}>
							<span>02</span>
							<div>
								<h2>Appearance</h2>
								<p>Customize how KelanaAI looks</p>
							</div>
						</div>
						<div style={{ marginBottom: 24 }}>
							<span style={{ display: "block", marginBottom: 12, fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
								THEME
							</span>
							<div style={{ display: "grid", gap: 12 }}>
								{[
									{ value: "light" as const, label: "Light", icon: Sun, desc: "Classic light theme" },
									{ value: "dark" as const, label: "Dark", icon: Moon, desc: "Easy on the eyes" },
								].map((option) => {
									const Icon = option.icon;
									const isActive = theme === option.value;
									return (
										<button
											key={option.value}
											type="button"
											onClick={() => handleThemeChange(option.value)}
											disabled={isSavingTheme}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 16,
												padding: 16,
												border: `2px solid ${isActive ? "var(--coral)" : "var(--line)"}`,
												borderRadius: "var(--radius-md)",
												background: isActive ? "var(--mint)" : "white",
												cursor: isSavingTheme ? "wait" : "pointer",
												transition: "all var(--transition-fast)",
												textAlign: "left",
											}}
										>
											<Icon className="w-5 h-5" style={{ color: isActive ? "var(--coral)" : "var(--muted)", flexShrink: 0 }} />
											<div style={{ flex: 1 }}>
												<div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{option.label}</div>
												<div style={{ fontSize: 13, color: "var(--muted)" }}>{option.desc}</div>
											</div>
											{isActive && (
												<svg width="20" height="20" viewBox="0 0 20 20" fill="var(--coral)">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
											)}
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</>
			) : null}

			<Footer />
		</main>
	);
}
