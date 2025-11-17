/**
 * Convert string to URL-friendly slug
 * Example: "Bengkel ABC 123" -> "bengkel-abc-123"
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract ID from slug if it contains ID at the end
 * Example: "bengkel-abc-123-id123" -> "id123" (if format is name-id)
 * Or just return slug as-is if no ID pattern found
 */
export function extractIdFromSlug(slug: string): string {
  // If slug looks like it ends with an ID pattern, extract it
  // For now, we'll use the slug as-is and let backend handle it
  return slug;
}

