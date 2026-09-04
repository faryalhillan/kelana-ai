"use client";

import React, { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiRequest } from "@/services/tripService";

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

function stripMarkdown(text: string): string {
	return text
		.replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
		.replace(/\*([^*]+)\*/g, "$1") // Remove italic
		.replace(/#{1,6}\s+/g, ""); // Remove headers
}

function renderMarkdown(text: string) {
	const lines = text.split("\n");
	const elements: React.ReactNode[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Skip empty lines
		if (!line.trim()) {
			i++;
			continue;
		}

		// Check for headers
		const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headerMatch) {
			const level = headerMatch[1].length;
			const content = headerMatch[2];
			const Tag = `h${Math.min(level + 2, 6)}`;
			
			elements.push(
				React.createElement(
					Tag,
					{ key: `h-${i}`, style: { marginTop: level === 1 ? "1.2em" : "1em", marginBottom: "0.5em", fontWeight: "700" } },
					processInlineFormatting(content, `h-${i}`)
				)
			);
			i++;
			continue;
		}

		// Check for unordered list
		if (line.match(/^\s*[-*]\s+/)) {
			const listItems: string[] = [];
			while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
				listItems.push(lines[i].replace(/^\s*[-*]\s+/, ""));
				i++;
			}
			elements.push(
				<ul key={`ul-${i}`} style={{ marginLeft: "1.5em", marginBottom: "0.8em" }}>
					{listItems.map((item, idx) => (
						<li key={idx} style={{ marginBottom: "0.3em" }}>
							{processInlineFormatting(item, `ul-${i}-${idx}`)}
						</li>
					))}
				</ul>
			);
			continue;
		}

		// Check for ordered list
		if (line.match(/^\s*\d+\.\s+/)) {
			const listItems: string[] = [];
			while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
				listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
				i++;
			}
			elements.push(
				<ol key={`ol-${i}`} style={{ marginLeft: "1.5em", marginBottom: "0.8em" }}>
					{listItems.map((item, idx) => (
						<li key={idx} style={{ marginBottom: "0.3em" }}>
							{processInlineFormatting(item, `ol-${i}-${idx}`)}
						</li>
					))}
				</ol>
			);
			continue;
		}

		// Regular paragraph - collect consecutive non-special lines
		let paragraph = line;
		i++;
		while (i < lines.length && lines[i].trim() && !lines[i].match(/^(#{1,6}\s+|\s*[-*]\s+|\s*\d+\.\s+)/)) {
			paragraph += " " + lines[i];
			i++;
		}

		elements.push(
			<p key={`p-${i}`} style={{ marginBottom: "0.8em" }}>
				{processInlineFormatting(paragraph, `p-${i}`)}
			</p>
		);
	}

	return <>{elements}</>;
}

function processInlineFormatting(text: string, keyPrefix: string) {
	const parts: (string | React.ReactNode)[] = [];
	let lastIndex = 0;

	// Regex to match **bold**, *italic*, and `code`
	const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
	let match;

	while ((match = regex.exec(text)) !== null) {
		// Add text before match
		if (match.index > lastIndex) {
			parts.push(text.substring(lastIndex, match.index));
		}

		const matched = match[0];
		if (matched.startsWith("**") && matched.endsWith("**")) {
			// Bold
			parts.push(
				<strong key={`${keyPrefix}-${match.index}`}>
					{matched.slice(2, -2)}
				</strong>
			);
		} else if (matched.startsWith("*") && matched.endsWith("*")) {
			// Italic
			parts.push(
				<em key={`${keyPrefix}-${match.index}`}>
					{matched.slice(1, -1)}
				</em>
			);
		} else if (matched.startsWith("`") && matched.endsWith("`")) {
			// Code
			parts.push(
				<code key={`${keyPrefix}-${match.index}`} style={{ background: "rgba(24,35,33,0.05)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "0.9em" }}>
					{matched.slice(1, -1)}
				</code>
			);
		}

		lastIndex = regex.lastIndex;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex));
	}

	return parts.length === 0 ? text : parts;
}

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
				setQuestion("");
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
									Ask <span aria-hidden="true">→</span>
								</>
							)}
						</button>
					</form>
				</div>

				{error && (
					<div className="status-message error-message">
						<span className="status-icon">⚠</span>
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
									<span className="sources-icon">📄</span>
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
						<span className="empty-icon">✦</span>
						<h2>Your travel assistant awaits</h2>
						<p>Ask any question about your travel plans or destination guidelines.</p>
					</div>
				)}
			</section>

			<Footer />
		</main>
	);
}
