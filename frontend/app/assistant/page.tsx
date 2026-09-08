"use client";

import React, { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { apiRequest } from "@/services/tripService";
import { renderMarkdown } from "@/utils/markdown";
import { Send, ArrowRight, FileText, AlertCircle, Sparkles } from "lucide-react";

type Source = {
	document_id: string;
	location: {
		type: string;
		source?: string;
	};
	metadata: Record<string, unknown>;
	score: number;
};

type AskResponse = {
	question: string;
	answer: string;
	source: Source[];
};

function extractFilename(path: string): string {
	if (!path) return "Source";
	// Handle S3 paths like s3://bucket/path/to/file.pdf
	const lastSlash = path.lastIndexOf("/");
	if (lastSlash === -1) return path;
	return path.substring(lastSlash + 1);
}

export default function AssistantPage() {
	const [question, setQuestion] = useState("");
	const [response, setResponse] = useState<AskResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleAsk(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		
		if (!question.trim()) {
			setError("Please enter a question");
			return;
		}

		setIsLoading(true);
		setError("");
		setResponse(null);

		try {
			const data = await apiRequest<AskResponse>("/api/v1/ask", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question }),
			});

			if (!data.answer || data.answer.trim() === "") {
				setError("No information found for your question. Please try a different query.");
			} else {
				setResponse(data);
				// Keep the question visible - don't clear it
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Unable to get an answer. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="assistant-shell">
			<Navbar active="assistant" />
			<AuthGuard showInlinePrompt={true}>
				<section className="assistant-intro">
					<p className="eyebrow">TRAVEL ASSISTANT</p>
					<h1>Ask KelanaAI</h1>
					<p className="intro-copy">
						Get grounded answers to your travel questions, powered by your trusted travel documents with source citations.
					</p>
				</section>

				<section className="assistant-container">
				<div className="ask-card">
					<form onSubmit={handleAsk} className="ask-form">
						<div className="form-field">
							<textarea
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
								placeholder="Ask any travel-related question... e.g., 'Can I bring medication to Japan?'"
								className="question-input"
								disabled={isLoading}
								rows={3}
							/>
						</div>
						<button
							type="submit"
							className="ask-button"
							disabled={isLoading || !question.trim()}
						>
							{isLoading ? (
								<>
									<span className="spinner-small"></span>
									Thinking...
								</>
							) : (
								<>
									Ask
									<Send size={18} />
								</>
							)}
						</button>
					</form>
				</div>

				{error && (
					<div className="status-message error-message">
						<span className="status-icon">
							<AlertCircle size={20} />
						</span>
						<div>
							<strong>Unable to find answer</strong>
							<p>{error}</p>
						</div>
					</div>
				)}

				{response && (
					<div className="response-container">
						<div className="answer-card">
							<div className="answer-header">
								<span className="answer-badge">AI ANSWER</span>
							</div>
							<h2 className="answer-question">{response.question}</h2>
							<div className="answer-text">
								{renderMarkdown(response.answer)}
							</div>
						</div>

						{response.source && response.source.length > 0 && (
							<div className="sources-card">
								<h3 className="sources-header">
									<FileText size={20} />
									Source
								</h3>
								<div className="sources-list">
									{response.source.map((source, idx) => (
										<div key={idx} className="source-item">
											<div className="source-info">
												<div className="source-title">
													{extractFilename(
														source.location?.source || source.document_id || `Source ${idx + 1}`
													)}
												</div>
											</div>
										</div>
									))}
								</div>
								<p className="sources-note">
									Answers are grounded in your uploaded documents.
								</p>
							</div>
						)}

						<button
							onClick={() => {
								setResponse(null);
								setError("");
								setQuestion("");
							}}
							className="ask-another-button"
						>
							Ask Another Question
						</button>
					</div>
				)}

				{!response && !error && !isLoading && (
					<div className="empty-state">
						<span className="empty-icon">
							<Sparkles size={32} />
						</span>
						<h2>Your travel assistant awaits</h2>
						<p>Ask any question about your travel plans or destination guidelines.</p>
					</div>
				)}
				</section>
			</AuthGuard>
			<Footer />
		</main>
	);
}
