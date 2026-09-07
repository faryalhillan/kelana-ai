"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/services/authService";

type AuthGuardProps = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
	showInlinePrompt?: boolean;
};

export default function AuthGuard({ 
	children, 
	fallback, 
	redirectTo,
	showInlinePrompt = true 
}: AuthGuardProps) {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		const token = getAuthToken();
		const hasAuth = Boolean(token);
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsAuthenticated(hasAuth);

		if (!hasAuth && redirectTo) {
			// Delayed redirect with smooth transition
			const timer = setTimeout(() => {
				router.push(redirectTo);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [redirectTo, router]);

	// Still checking auth state
	if (isAuthenticated === null) {
		return (
			<div className="auth-guard-loading">
				<div className="loading-spinner-container">
					<span className="spinner" />
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// User is authenticated
	if (isAuthenticated) {
		return <>{children}</>;
	}

	// User is not authenticated - show custom fallback or inline prompt
	if (fallback) {
		return <>{fallback}</>;
	}

	if (showInlinePrompt) {
		return <AuthPrompt />;
	}

	return null;
}

function AuthPrompt() {
	return (
		<div className="auth-guard-prompt">
			<div className="auth-prompt-card">
				<div className="auth-prompt-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
					</svg>
				</div>
				<h2>Sign in to continue</h2>
				<p>
					You need to be logged in to access this feature. Create an account or log in to start exploring personalized travel planning with KelanaAI.
				</p>
				<div className="auth-prompt-actions">
					<Link href="/login" className="auth-prompt-button primary">
						Log in
						<span aria-hidden="true">→</span>
					</Link>
					<Link href="/register" className="auth-prompt-button secondary">
						Create account
					</Link>
				</div>
				<Link href="/" className="auth-prompt-back">
					← Back to home
				</Link>
			</div>
		</div>
	);
}
