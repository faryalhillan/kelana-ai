"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken, getProfile, logout } from "@/services/authService";

export default function Navbar({ active = "" }: { active?: string }) {
	const [isHydrated, setIsHydrated] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userName, setUserName] = useState("");

	useEffect(() => {
		Promise.resolve().then(() => {
			const hasToken = Boolean(getAuthToken());
			setIsHydrated(true);
			if (!hasToken) return;
			getProfile()
				.then((profile) => {
					setIsLoggedIn(true);
					setUserName(profile.name);
				})
				.catch(() => {
					setIsLoggedIn(true);
					setUserName("Traveler");
				});
		});
	}, [active]);

	const handleLogout = () => {
		logout();
	};

	return <header className="site-nav">
		<div className="nav-left-group">
			<Link className="home-button" href="/">Home</Link>
			<Link className="brand" href="/"><span className="brand-mark">K</span><span>Kelana<span className="brand-accent">AI</span></span></Link>
		</div>
		<nav aria-label="Main navigation" className="site-nav-links">
			<Link className={active === "assistant" ? "active" : ""} href="/assistant">Ask AI</Link>
			<Link className={active === "chat" ? "active" : ""} href="/chat">Chat</Link>
			<Link className={active === "trips" ? "active" : ""} href="/trips">My trips</Link>
			<Link className={active === "profile" ? "active" : ""} href="/profile">Profile</Link>
			{!isHydrated ? <div className="auth-cta-row" aria-hidden="true" /> : isLoggedIn ? (
				<div className="auth-cta-row">
					<Link className="nav-user" href="/profile">Hi, {userName || "Traveler"}</Link>
					<button type="button" className="nav-cta nav-logout" onClick={handleLogout}>Logout</button>
				</div>
			) : (
				<div className="auth-cta-row">
					<Link className="nav-cta" href="/login">Login</Link>
					<Link className="nav-cta nav-cta-secondary" href="/register">Register</Link>
				</div>
			)}
		</nav>
	</header>;
}