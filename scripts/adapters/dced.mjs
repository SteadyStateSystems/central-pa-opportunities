import { extractLinks, keepOpportunityLike, uniqueByUrl } from './common.mjs';

export async function collectDced() {
  const sourceUrl = 'https://dced.pa.gov/';
  const res = await fetch(sourceUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`DCED fetch failed: ${res.status}`);
  const html = await res.text();

  const links = extractLinks(html, sourceUrl)
    .filter(keepOpportunityLike)
    .slice(0, 20)
    .map((l, i) => ({
      id: `dced-${i}-${Buffer.from(l.href).toString('base64').slice(0, 10)}`,
      title: l.title,
      source: 'PA DCED',
      url: l.href,
      posted_at: null,
      deadline: null,
      amount_min: 0,
      amount_max: 0,
      category: 'grant',
      location: 'Pennsylvania',
      eligibility_text: 'See source page',
      summary: 'Potential funding/program opportunity from PA DCED source page',
      type: 'grant'
    }));

  return uniqueByUrl(links);
}
