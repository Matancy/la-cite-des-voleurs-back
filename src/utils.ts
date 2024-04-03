export function normalizeText(text: string) {
    return text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/%[^%]*%/g, ' ');
}