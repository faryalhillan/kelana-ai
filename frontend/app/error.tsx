"use client";

import Link from "next/link";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<main className="error-page-shell">
			<Navbar active="" />
			
			<section className="error-page-content">
				<div className="error-illustration">
					<svg
						width="200"
						height="200"
						viewBox="0 0 200 200"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="100" cy="100" r="90" fill="#fff4f0" stroke="#e76f51" strokeWidth="3" />
						<path
							d="M70 80 L70 100"
							stroke="#e76f51"
							strokeWidth="5"
							strokeLinecap="round"
						/>
						<path
							d="M130 80 L130 100"
							stroke="#e76f51"
							strokeWidth="5"
							strokeLinecap="round"
						/>
						<circle cx="70" cy="110" r="3" fill="#e76f51" />
						<circle cx="130" cy="110" r="3" fill="#e76f51" />
						<path
							d="M75 140 Q100 130 125 140"
							stroke="#e76f51"
							strokeWidth="4"
							strokeLinecap="round"
							fill="none"
						/>
						<path
							d="M50 50 L60 60 M140 60 L150 50"
							stroke="#e76f51"
							strokeWidth="3"
							strokeLinecap="round"
						/>
						<circle cx="100" cy="100" r="70" stroke="#f8dcd4" strokeWidth="2" opacity="0.5" />
						<circle cx="100" cy="100" r="50" stroke="#f8dcd4" strokeWidth="2" opacity="0.3" />
					</svg>
				</div>

				<div className="error-page-text">
					<h1 className="error-code">500</h1>
					<h2 className="error-title">Something went wrong</h2>
					<p className="error-description">
						Our travel guide hit a snag. The server encountered an unexpected error and couldn&apos;t complete your request. Don&apos;t worry — your data is safe, and we&apos;re working to fix it.
					</p>

					{error.digest && (
						<div className="error-digest">
							<span className="digest-label">Error ID:</span>
							<code className="digest-code">{error.digest}</code>
						</div>
					)}

					<div className="error-actions">
						<button
							onClick={reset}
							className="error-button primary"
						>
							<span>↻</span>
							Try again
						</button>
						<Link href="/" className="error-button secondary">
							Go to home
						</Link>
					</div>

					<div className="error-suggestions">
						<p className="suggestions-title">What you can do:</p>
						<ul className="error-tips">
							<li>Refresh the page or try again in a moment</li>
							<li>Check your internet connection</li>
							<li>Clear your browser cache and cookies</li>
							<li>If the problem persists, contact support at <a href="mailto:hello@kelana.ai">hello@kelana.ai</a></li>
						</ul>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}
