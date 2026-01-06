export function safeImageHref(input: string) {
  try {
    const url = new URL(input);
    if (!['http', 'https'].includes(url.protocol))
      return null;
    return url.href;
  } catch (e) {
    return null;
  }
}
