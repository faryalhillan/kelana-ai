"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken, getProfile, logout } from "@/services/authService";

export default function Navbar({ active = "" }: { active?: string }) {
	const [isHydrated, setIsHydrated] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userName, setUserName] = useState("");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<header className="site-nav">
			<div className="nav-left-group">
				<Link className="home-button" href="/">Home</Link>
				<Link className="brand" href="/"><span className="brand-mark">K</span><span>Kelana<span className="brand-accent">AI</span></span></Link>
			</div>
			
			{/* Mobile hamburger button */}
			<button
				type="button"
				className="mobile-menu-button"
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				aria-label="Toggle menu"
				aria-expanded={isMobileMenuOpen}
			>
				<span className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}></span>
				<span className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}></span>
				<span className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}></span>
			</button>

			<nav aria-label="Main navigation" className={`site-nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
				<Link className={active === "assistant" ? "active" : ""} href="/assistant" onClick={closeMobileMenu}>Ask AI</Link>
				<Link className={active === "chat" ? "active" : ""} href="/chat" onClick={closeMobileMenu}>Chat</Link>
				<Link className={active === "trips" ? "active" : ""} href="/trips" onClick={closeMobileMenu}>My trips</Link>
				<Link className={active === "about" ? "active" : ""} href="/about" onClick={closeMobileMenu}>About</Link>
				<Link className={active === "profile" ? "active" : ""} href="/profile" onClick={closeMobileMenu}>Profile</Link>
				{!isHydrated ? <div className="auth-cta-row" aria-hidden="true" /> : isLoggedIn ? (
					<div className="auth-cta-row">
						<Link className="nav-user" href="/profile" onClick={closeMobileMenu}>Hi, {userName || "Traveler"}</Link>
						<button type="button" className="nav-cta nav-logout" onClick={() => { handleLogout(); closeMobileMenu(); }}>Logout</button>
					</div>
				) : (
					<div className="auth-cta-row">
						<Link className="nav-cta" href="/login" onClick={closeMobileMenu}>Login</Link>
						<Link className="nav-cta nav-cta-secondary" href="/register" onClick={closeMobileMenu}>Register</Link>
					</div>
				)}
			</nav>
		</header>
	);
}