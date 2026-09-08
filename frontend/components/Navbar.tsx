"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getAuthToken, getProfile } from "@/services/authService";

export default function Navbar({ active = "" }: { active?: string }) {
	const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
	const [userName, setUserName] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Check auth immediately on mount, before render
		const checkAuth = async () => {
			const token = getAuthToken();
			
			if (!token) {
				setAuthState("unauthenticated");
				return;
			}

			try {
				const profile = await getProfile();
				setUserName(profile.name);
				setAuthState("authenticated");
			} catch {
				setUserName("Traveler");
				setAuthState("authenticated");
			}
		};

		checkAuth();
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		setIsDropdownOpen(false);
		const { logout } = require("@/services/authService");
		logout();
	};

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	return (
		<header className="site-nav">
			<div className="nav-container">
				{/* Logo - clickable to home */}
				<Link className="brand" href="/" aria-label="KelanaAI Home">
					<span className="brand-mark">K</span>
					<span>Kelana<span className="brand-accent">AI</span></span>
				</Link>

				{/* Main Navigation */}
				<nav aria-label="Main navigation" className="nav-links">
					<Link 
						className={`nav-link ${active === "planner" ? "active" : ""}`} 
						href="/#planner"
					>
						Plan a Trip
					</Link>
					<Link 
						className={`nav-link ${active === "trips" ? "active" : ""}`} 
						href="/trips"
					>
						My Trips
					</Link>
					<Link 
						className={`nav-link ${active === "assistant" ? "active" : ""}`} 
						href="/assistant"
					>
						Ask AI
					</Link>
					<Link 
						className={`nav-link ${active === "chat" ? "active" : ""}`} 
						href="/chat"
					>
						AI Chat
					</Link>
				</nav>

				{/* Auth Section */}
				<div className="nav-auth">
					{authState === "loading" ? (
						<div className="auth-skeleton" aria-hidden="true" />
					) : authState === "authenticated" ? (
						<div className="user-dropdown" ref={dropdownRef}>
							<button
								type="button"
								className="user-dropdown-trigger"
								onClick={toggleDropdown}
								aria-expanded={isDropdownOpen}
								aria-haspopup="true"
							>
								<span className="user-avatar">{userName.charAt(0).toUpperCase()}</span>
								<span className="user-name">{userName}</span>
								<svg 
									className={`dropdown-chevron ${isDropdownOpen ? "open" : ""}`}
									width="12" 
									height="12" 
									viewBox="0 0 12 12" 
									fill="none"
									aria-hidden="true"
								>
									<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
							
							{isDropdownOpen && (
								<div className="user-dropdown-menu">
									<Link 
										href="/profile" 
										className="dropdown-item"
										onClick={() => setIsDropdownOpen(false)}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
											<path d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
										</svg>
										Profile
									</Link>
									<button 
										type="button"
										className="dropdown-item logout"
										onClick={handleLogout}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
											<path d="M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										Logout
									</button>
								</div>
							)}
						</div>
					) : (
						<div className="auth-buttons">
							<Link href="/login" className="auth-btn login">Login</Link>
							<Link href="/register" className="auth-btn register">Get Started</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}