"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { register } from "@/services/authService";

export default function RegisterPage() {
	const router = useRouter();
	const [form, setForm] = useState({ name: "Alice Johnson", email: "alice@email.com", password: "password123" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	function updateField(field: keyof typeof form, value: string) {
		setForm((current) => ({ ...current, [field]: value }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setMessage("");

		try {
			await register(form.name, form.email, form.password);
			setMessage("Registration successful. Redirecting to login...");
			setTimeout(() => router.push("/login"), 800);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Unable to create account.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="history-shell">
			<Navbar active="" />
			<section className="auth-page-shell">
				<div className="auth-card">
					<p className="eyebrow">JOIN US</p>
					<h1>Create your account</h1>
					<p className="auth-subtitle">Start saving your dream trips and let KelanaAI design itineraries around your style.</p>

					<form onSubmit={handleSubmit} className="auth-form">
						<label className="field">
							<span>Name</span>
							<input type="text" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Alice Johnson" required />
						</label>

						<label className="field">
							<span>Email</span>
							<input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="alice@email.com" required />
						</label>

						<label className="field">
							<span>Password</span>
							<input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="••••••••••" required />
						</label>

						<button className="submit-button" type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating account..." : "Register"}
						</button>
						{message ? <p className={`status ${message.includes("successful") ? "" : "error"}`}>{message}</p> : null}
					</form>

					<div className="auth-divider"><span>or</span></div>
					<div className="auth-links-row">
						<Link href="/login" className="secondary-link">Login instead</Link>
						<Link href="/" className="text-link">Back to planner</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
