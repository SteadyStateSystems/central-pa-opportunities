export function textFromHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractLinks(html = '', baseUrl = '') {
  const out = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const href = new URL(m[1], baseUrl).toString();
      const title = textFromHtml(m[2]);
      if (!title || title.length < 3) continue;
      out.push({ href, title });
    } catch {
      // ignore invalid URLs
    }
  }
  return out;
}

export function keepOpportunityLike(link) {
  const blob = `${link.title} ${link.href}`.toLowerCase();
  return /(rfp|rfq|bid|grant|fund|proposal|contract|procurement|opportunit)/.test(blob);
}

export function uniqueByUrl(items = []) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!it?.url) continue;
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    out.push(it);
  }
  return out;
}
