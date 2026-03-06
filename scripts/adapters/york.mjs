import { extractLinks, keepOpportunityLike, uniqueByUrl } from './common.mjs';

export async function collectYork() {
  const sourceUrl = 'https://yorkcountypa.gov/';
  const res = await fetch(sourceUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`York fetch failed: ${res.status}`);
  const html = await res.text();

  const links = extractLinks(html, sourceUrl)
    .filter(keepOpportunityLike)
    .slice(0, 20)
    .map((l, i) => ({
      id: `york-${i}-${Buffer.from(l.href).toString('base64').slice(0, 10)}`,
      title: l.title,
      source: 'York County',
      url: l.href,
      posted_at: null,
      deadline: null,
      amount_min: 0,
      amount_max: 0,
      category: 'procurement',
      location: 'York County, PA',
      eligibility_text: 'See source page',
      summary: 'Potential procurement/bid opportunity from county source page',
      type: 'procurement'
    }));

  return uniqueByUrl(links);
}
