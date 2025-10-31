/**
 * Highlight matched text in a string
 * @param text - The full text to search in
 * @param query - The search query to highlight
 * @returns Array of text segments with highlight flag
 */
export function highlightText(text: string, query: string): Array<{ text: string; highlight: boolean }> {
    if (!query.trim()) {
        return [{ text, highlight: false }];
    }

    const parts: Array<{ text: string; highlight: boolean }> = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let lastIndex = 0;
    let index = lowerText.indexOf(lowerQuery);

    while (index !== -1) {
        // Add text before match
        if (index > lastIndex) {
            parts.push({
                text: text.substring(lastIndex, index),
                highlight: false,
            });
        }

        // Add matched text
        parts.push({
            text: text.substring(index, index + query.length),
            highlight: true,
        });

        lastIndex = index + query.length;
        index = lowerText.indexOf(lowerQuery, lastIndex);
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            text: text.substring(lastIndex),
            highlight: false,
        });
    }

    return parts;
}
