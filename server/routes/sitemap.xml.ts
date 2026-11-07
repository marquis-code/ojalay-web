const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600');
  const config = useRuntimeConfig(event);
  const base = String(config.public.appUrl || 'https://ojaly.org').replace(/\/$/, '').replace(/^https:\/\/www\./, 'https://');
  let urls: { loc: string; lastmod?: string; changefreq: string; priority: number }[] = [
    { loc: '/', changefreq: 'weekly', priority: 1 },
    { loc: '/marketplace', changefreq: 'daily', priority: 0.9 },
    { loc: '/register', changefreq: 'monthly', priority: 0.6 },
    { loc: '/login', changefreq: 'monthly', priority: 0.4 },
  ];
  try {
    const response = await $fetch<{ data: { urls: typeof urls } }>(`${String(config.public.apiBase).replace(/\/$/, '')}/storefront/sitemap`, { timeout: 8000 });
    if (response?.data?.urls?.length) urls = response.data.urls;
  } catch {
    // Keep a valid sitemap even if the API is temporarily unavailable.
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(`${base}${url.loc}`)}</loc>${url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}<changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
  return body;
});
