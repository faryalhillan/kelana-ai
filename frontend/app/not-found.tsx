import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
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
						<circle cx="100" cy="100" r="90" fill="#f4f5ef" stroke="#e76f51" strokeWidth="3" />
						<path
							d="M70 85 Q75 75 80 85"
							stroke="#e76f51"
							strokeWidth="4"
							strokeLinecap="round"
							fill="none"
						/>
						<path
							d="M120 85 Q125 75 130 85"
							stroke="#e76f51"
							strokeWidth="4"
							strokeLinecap="round"
							fill="none"
						/>
						<path
							d="M70 130 Q100 110 130 130"
							stroke="#e76f51"
							strokeWidth="4"
							strokeLinecap="round"
							fill="none"
						/>
						<circle cx="100" cy="100" r="70" stroke="#dcebe4" strokeWidth="2" opacity="0.5" />
						<circle cx="100" cy="100" r="50" stroke="#dcebe4" strokeWidth="2" opacity="0.3" />
					</svg>
				</div>

				<div className="error-page-text">
					<h1 className="error-code">404</h1>
					<h2 className="error-title">Page not found</h2>
					<p className="error-description">
						Looks like this destination doesn&apos;t exist on our map. The page you&apos;re looking for might have been moved, deleted, or never existed in the first place.
					</p>

					<div className="error-actions">
						<Link href="/" className="error-button primary">
							<span>←</span>
							Back to home
						</Link>
						<Link href="/trips" className="error-button secondary">
							View your trips
						</Link>
					</div>

					<div className="error-suggestions">
						<p className="suggestions-title">Popular destinations:</p>
						<div className="suggestions-links">
							<Link href="/#planner">Plan a trip</Link>
							<Link href="/chat">Chat with AI</Link>
							<Link href="/assistant">Ask questions</Link>
							<Link href="/profile">Your profile</Link>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}
