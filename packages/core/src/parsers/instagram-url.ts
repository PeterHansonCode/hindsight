export interface InstagramPostUrl {
  key: string;
  shortcode: string;
  postType: 'reel' | 'p' | 'tv';
}

export function canonicalInstagramPostUrl(value: string): InstagramPostUrl | null {
  // Validate the original spelling first: WHATWG URL parsing normalises dot
  // segments and backslashes, which could otherwise hide an invalid path.
  if (/[\s\\]/u.test(value)) return null;
  const spelling = /^https:\/\/([^/?#]+)(\/[^?#]*)(?:\?[^#]*)?(?:#.*)?$/.exec(value);
  if (!spelling || !/^(?:www\.)?instagram\.com(?::443)?$/i.test(spelling[1])) return null;
  const match = /^\/(reel|p|tv)\/([A-Za-z0-9_-]+)\/?$/.exec(spelling[2]);
  if (!match) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    return {
      key: `instagram:post:${match[2]}`,
      shortcode: match[2],
      postType: match[1] as InstagramPostUrl['postType'],
    };
  } catch {
    return null;
  }
}
