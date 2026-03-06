import { extractLinks, keepOpportunityLike, uniqueByUrl } from './common.mjs';

export async function collectGrantsGov() {
  const sourceUrl = 'https://www.grants.gov/search-grants';
  const res = await fetch(sourceUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Grants.gov fetch failed: ${res.status}`);
  const html = await res.text();

  const links = extractLinks(html, sourceUrl)
    .filter(keepOpportunityLike)
    .slice(0, 30)
    .map((l, i) => ({
      id: `grants-${i}-${Buffer.from(l.href).toString('base64').slice(0, 10)}`,
      title: l.title,
      source: 'Grants.gov',
      url: l.href,
      posted_at: null,
      deadline: null,
      amount_min: 0,
      amount_max: 0,
      category: 'grant',
      location: 'Pennsylvania / US',
      eligibility_text: 'See source page',
      summary: 'Potential grant opportunity from Grants.gov source page',
      type: 'grant'
    }));

  return uniqueByUrl(links);
}
