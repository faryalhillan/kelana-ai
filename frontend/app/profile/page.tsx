"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProfile, logout, getAuthToken } from "@/services/authService";

export default function ProfilePage() {
	const router = useRouter();
	const [profile, setProfile] = useState<{ id: number; name: string; email: string; total_trips: number } | null>(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = getAuthToken();
		if (!token) {
			router.push("/login");
			return;
		}

		getProfile()
			.then((data) => {
				setProfile(data);
				setIsLoading(false);
			})
			.catch((loadError) => {
				setError(loadError instanceof Error ? loadError.message : "Unable to load your profile.");
				setIsLoading(false);
			});
	}, [router]);

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
				<div className="budget-panel" style={{ maxWidth: 700, margin: "0 auto" }}>
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
			) : null}

			<Footer />
		</main>
	);
}
