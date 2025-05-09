/**
 * Generates a deterministic, sortable, hashed identifier from subject and topic.
 * - Normalized (case-insensitive, trimmed, sanitized).
 * - Sortable by subject then topic.
 * - Hash ensures uniqueness and obfuscation.
 * - Safe for use in filenames and network communication.
 */

async function generateMindMapKey(subject: string, topic: string): Promise<string> {
    const sanitize = (str: string) =>
        str
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-') // Replace unsafe chars with hyphen
            .replace(/-+/g, '-')          // Collapse multiple hyphens
            .replace(/^-|-$/g, '');       // Trim leading/trailing hyphens

    const safeSubject = sanitize(subject);
    const safeTopic = sanitize(topic);
    const composite = `${safeSubject}__${safeTopic}`;

    // Create a short SHA-1 hash (first 10 characters of hex)
    const encoder = new TextEncoder();
    const data = encoder.encode(composite);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 10);

    return `${safeSubject}__${safeTopic}__${hashHex}`;
}

export { generateMindMapKey };