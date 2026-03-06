import { extractLinks, keepOpportunityLike, uniqueByUrl } from './common.mjs';

export async function collectDauphin() {
  const sourceUrl = 'https://www.dauphincounty.gov/';
  const res = await fetch(sourceUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Dauphin fetch failed: ${res.status}`);
  const html = await res.text();

  const links = extractLinks(html, sourceUrl)
    .filter(keepOpportunityLike)
    .slice(0, 20)
    .map((l, i) => ({
      id: `dauphin-${i}-${Buffer.from(l.href).toString('base64').slice(0, 10)}`,
      title: l.title,
      source: 'Dauphin County',
      url: l.href,
      posted_at: null,
      deadline: null,
      amount_min: 0,
      amount_max: 0,
      category: 'procurement',
      location: 'Dauphin County, PA',
      eligibility_text: 'See source page',
      summary: 'Potential procurement/bid opportunity from county source page',
      type: 'procurement'
    }));

  return uniqueByUrl(links);
}
