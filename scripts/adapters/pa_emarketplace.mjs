import { extractLinks, keepOpportunityLike, uniqueByUrl } from './common.mjs';

export async function collectPaEMarketplace() {
  const sourceUrl = 'https://www.emarketplace.state.pa.us/';
  const res = await fetch(sourceUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`PA eMarketplace fetch failed: ${res.status}`);
  const html = await res.text();

  const links = extractLinks(html, sourceUrl)
    .filter(keepOpportunityLike)
    .slice(0, 30)
    .map((l, i) => ({
      id: `paem-${i}-${Buffer.from(l.href).toString('base64').slice(0, 10)}`,
      title: l.title,
      source: 'PA eMarketplace',
      url: l.href,
      posted_at: null,
      deadline: null,
      amount_min: 0,
      amount_max: 0,
      category: 'procurement',
      location: 'Pennsylvania',
      eligibility_text: 'See source page',
      summary: 'Potential procurement opportunity from PA eMarketplace source page',
      type: 'procurement'
    }));

  return uniqueByUrl(links);
}
