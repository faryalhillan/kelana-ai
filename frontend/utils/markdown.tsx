import React from "react";

/**
 * Process inline markdown formatting (bold, italic, code)
 */
export function processInlineFormatting(text: string, keyPrefix: string) {
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
				<code
					key={`${keyPrefix}-${match.index}`}
					style={{
						background: "rgba(24,35,33,0.05)",
						padding: "2px 6px",
						borderRadius: "4px",
						fontFamily: "monospace",
						fontSize: "0.9em",
					}}
				>
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

/**
 * Render markdown text with support for headers, lists, and inline formatting
 */
export function renderMarkdown(text: string) {
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
					{
						key: `h-${i}`,
						style: {
							marginTop: level === 1 ? "1.2em" : "1em",
							marginBottom: "0.5em",
							fontWeight: "700",
						},
					},
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
		while (
			i < lines.length &&
			lines[i].trim() &&
			!lines[i].match(/^(#{1,6}\s+|\s*[-*]\s+|\s*\d+\.\s+)/)
		) {
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
