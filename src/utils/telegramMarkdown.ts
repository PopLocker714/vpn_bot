const MARKDOWN_V2_SPECIAL_CHARS_RE = /[_*[\]()~`>#+\-=|{}.!]/g;

/**
 * Escape text for Telegram MarkdownV2 in a regular message context.
 */
export const escapeMarkdownV2 = (input: string): string => {
	return input
		.replace(/\\/g, "\\\\")
		.replace(MARKDOWN_V2_SPECIAL_CHARS_RE, "\\$&");
};

/**
 * Escape text for Telegram MarkdownV2 inside `code` and ```pre``` blocks.
 */
export const escapeMarkdownV2Code = (input: string): string => {
	return input
		.replace(/\\/g, "\\\\")
		.replace(/`/g, "\\`");
};

/**
 * Escape URL text used inside (...) in links and custom emoji definitions.
 */
export const escapeMarkdownV2LinkUrl = (input: string): string => {
	return input
		.replace(/\\/g, "\\\\")
		.replace(/\)/g, "\\)");
};

const stringifyTemplateValue = (value: unknown): string => {
	if (value === null || value === undefined) return "";
	return String(value);
};

interface ParseResult {
	text: string;
	next: number;
	closed: boolean;
}

const ENTITY_TOKENS = ["||", "__", "*", "_", "~"] as const;

const isEscapedAt = (input: string, index: number): boolean => {
	let backslashes = 0;
	for (let i = index - 1; i >= 0 && input[i] === "\\"; i--) {
		backslashes++;
	}
	return backslashes % 2 === 1;
};

const findUnescaped = (input: string, token: string, from: number): number => {
	let index = input.indexOf(token, from);
	while (index !== -1 && isEscapedAt(input, index)) {
		index = input.indexOf(token, index + 1);
	}
	return index;
};

const parseMarkdownV2Text = (
	input: string,
	start = 0,
	endToken?: string,
): ParseResult => {
	let out = "";
	let i = start;
	let plainStart = start;

	const flushPlain = (to: number) => {
		if (to <= plainStart) return;
		out += escapeMarkdownV2(input.slice(plainStart, to));
		plainStart = to;
	};

	while (i < input.length) {
		if (endToken && input.startsWith(endToken, i) && !isEscapedAt(input, i)) {
			flushPlain(i);
			return { text: out, next: i + endToken.length, closed: true };
		}

		if (input[i] === "\\") {
			flushPlain(i);
			if (i + 1 < input.length) {
				out += `\\${input[i + 1]}`;
				i += 2;
			} else {
				out += "\\\\";
				i += 1;
			}
			plainStart = i;
			continue;
		}

		if (input.startsWith("```", i) && !isEscapedAt(input, i)) {
			let headerEnd = i + 3;
			while (headerEnd < input.length && input[headerEnd] !== "\n") {
				headerEnd++;
			}

			const closeIndex = findUnescaped(input, "```", headerEnd < input.length ? headerEnd + 1 : headerEnd);
			if (closeIndex !== -1) {
				flushPlain(i);
				const header = input.slice(i, headerEnd);
				const hasNewline = headerEnd < input.length && input[headerEnd] === "\n";
				const contentStart = hasNewline ? headerEnd + 1 : headerEnd;
				const content = input.slice(contentStart, closeIndex);
				out += header;
				if (hasNewline) out += "\n";
				out += escapeMarkdownV2Code(content);
				out += "```";
				i = closeIndex + 3;
				plainStart = i;
				continue;
			}
		}

		if (input[i] === "`" && !input.startsWith("```", i) && !isEscapedAt(input, i)) {
			const closeIndex = findUnescaped(input, "`", i + 1);
			if (closeIndex !== -1) {
				flushPlain(i);
				const content = input.slice(i + 1, closeIndex);
				out += `\`${escapeMarkdownV2Code(content)}\``;
				i = closeIndex + 1;
				plainStart = i;
				continue;
			}
		}

		if (input[i] === "[" && !isEscapedAt(input, i)) {
			let depth = 1;
			let cursor = i + 1;
			while (cursor < input.length && depth > 0) {
				if (input[cursor] === "\\" && cursor + 1 < input.length) {
					cursor += 2;
					continue;
				}
				if (input[cursor] === "[") depth++;
				else if (input[cursor] === "]") depth--;
				cursor++;
			}

			const labelEnd = depth === 0 ? cursor - 1 : -1;
			if (labelEnd !== -1 && input[labelEnd + 1] === "(") {
				let urlDepth = 1;
				let urlCursor = labelEnd + 2;
				while (urlCursor < input.length && urlDepth > 0) {
					if (input[urlCursor] === "\\" && urlCursor + 1 < input.length) {
						urlCursor += 2;
						continue;
					}
					if (input[urlCursor] === "(") urlDepth++;
					else if (input[urlCursor] === ")") urlDepth--;
					urlCursor++;
				}

				const urlEnd = urlDepth === 0 ? urlCursor - 1 : -1;
				if (urlEnd !== -1) {
					flushPlain(i);
					const labelRaw = input.slice(i + 1, labelEnd);
					const urlRaw = input.slice(labelEnd + 2, urlEnd);
					const label = parseMarkdownV2Text(labelRaw).text;
					out += `[${label}](${escapeMarkdownV2LinkUrl(urlRaw)})`;
					i = urlEnd + 1;
					plainStart = i;
					continue;
				}
			}
		}

		if (input[i] === ">" && (i === 0 || input[i - 1] === "\n")) {
			flushPlain(i);
			out += ">";
			i += 1;
			plainStart = i;
			continue;
		}

		let parsedEntity = false;
		for (const token of ENTITY_TOKENS) {
			if (!input.startsWith(token, i) || isEscapedAt(input, i)) continue;
			const inner = parseMarkdownV2Text(input, i + token.length, token);
			if (!inner.closed) continue;

			flushPlain(i);
			out += `${token}${inner.text}${token}`;
			i = inner.next;
			plainStart = i;
			parsedEntity = true;
			break;
		}
		if (parsedEntity) continue;

		i++;
	}

	flushPlain(i);
	return { text: out, next: i, closed: false };
};

const applyPlaceholders = (input: string, values: unknown[]): string => {
	let output = input;
	for (let i = 0; i < values.length; i++) {
		const placeholder = `\uE000${i}\uE001`;
		output = output.split(placeholder).join(escapeMarkdownV2(stringifyTemplateValue(values[i])));
	}
	return output;
};

/**
 * Tagged template for Telegram MarkdownV2:
 * supports raw markdown entities in static text and auto-escapes plain static text/interpolations.
 */
export const mdv2 = (
	strings: TemplateStringsArray,
	...values: unknown[]
): string => {
	let withPlaceholders = strings[0] ?? "";
	for (let i = 0; i < values.length; i++) {
		withPlaceholders += `\uE000${i}\uE001`;
		withPlaceholders += strings[i + 1] ?? "";
	}

	const parsed = parseMarkdownV2Text(withPlaceholders).text;
	return applyPlaceholders(parsed, values);
};
