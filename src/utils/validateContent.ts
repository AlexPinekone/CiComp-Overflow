import forbiddenWordsData from '@/lang-es.json'; // Ruta del JSON

export function containsForbiddenWords(text: string): boolean {
	const forbiddenWords = forbiddenWordsData.words.map((word) =>
		word.toLowerCase()
	);
	// Divide el texto en palabras
	const wordsInText = text.toLowerCase().split(/\s+/);
	// Verifica si alguna palabra está prohibida
	return wordsInText.some((word) => forbiddenWords.includes(word));
}

export function replaceForbiddenWords(text: string): string {
	const forbiddenWords = forbiddenWordsData.words.map((word) =>
		word.toLowerCase()
	);

	return text
		.split(/\b/)
		.map((word) =>
			forbiddenWords.includes(word.toLowerCase())
				? '*'.repeat(word.length) // o podrías usar '[censurado]'
				: word
		)
		.join('');
}
