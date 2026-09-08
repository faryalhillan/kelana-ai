"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { login, saveAuthToken } from "@/services/authService";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setMessage("");

		try {
			const data = await login(email, password);
			saveAuthToken(data);
			router.push("/trips");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Unable to login. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="history-shell">
			<Navbar active="" />
			<section className="auth-page-shell">
				<div className="auth-card">
					<p className="eyebrow">WELCOME BACK</p>
					<h1>Log in to KelanaAI</h1>
					<p className="auth-subtitle">Continue planning your next trip and revisit saved itineraries.</p>

					<form onSubmit={handleSubmit} className="auth-form">
						<label className="field">
							<span>Email</span>
							<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alice@email.com" required />
						</label>

						<label className="field">
							<span>Password</span>
							<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" required />
						</label>

						<button className="submit-button" type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Logging in..." : "Login"}
						</button>
						{message ? <p className={`status ${message.toLowerCase().includes("successful") ? "" : "error"}`}>{message}</p> : null}
					</form>

					<div className="auth-divider"><span>or</span></div>

					<div className="auth-links-row">
						<Link href="/register" className="secondary-link">Create an account</Link>
						<Link href="/" className="text-link">Back to planner</Link>
					</div>
				</div>
			</section>
			<Footer />
		</main>
	);
}
