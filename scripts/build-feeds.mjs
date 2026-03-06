import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const scoredPath = path.join(root, 'data', 'opportunities.scored.json');
const tiersPath = path.join(root, 'config.tiers.json');
const webDir = path.join(root, 'web');

const items = JSON.parse(await fs.readFile(scoredPath, 'utf8'));
const tiers = JSON.parse(await fs.readFile(tiersPath, 'utf8'));

const freeItems = items.slice(0, tiers.free?.maxItems || 10);
const proItems = items.slice(0, tiers.pro?.maxItems || 50);

const mapItem = (x) => ({
  id: x.id,
  title: x.title,
  source: x.source,
  deadline: x.deadline || null,
  score: x.score_total,
  tier: x.tier,
  url: x.url,
  category: x.category || null,
  location: x.location || null,
  stale: x.is_stale === true
});

const freeFeed = {
  generatedAt: new Date().toISOString(),
  tier: 'free',
  count: freeItems.length,
  items: freeItems.map(mapItem)
};

const proFeed = {
  generatedAt: new Date().toISOString(),
  tier: 'pro',
  count: proItems.length,
  items: proItems.map(mapItem)
};

await fs.writeFile(path.join(webDir, 'feed.free.json'), JSON.stringify(freeFeed, null, 2));
await fs.writeFile(path.join(webDir, 'feed.pro.json'), JSON.stringify(proFeed, null, 2));

const rssItems = freeItems.slice(0, 20).map(x => {
  const pubDate = x.deadline ? new Date(x.deadline).toUTCString() : new Date().toUTCString();
  return `\n  <item>\n    <title><![CDATA[${x.title}]]></title>\n    <link>${x.url}</link>\n    <guid>${x.id || x.url}</guid>\n    <pubDate>${pubDate}</pubDate>\n    <description><![CDATA[Source: ${x.source} | Score: ${x.score_total}]]></description>\n  </item>`;
}).join('');

const rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n  <title>CentralPA Opportunity Radar (Free Feed)</title>\n  <link>https://steadystatesystems.github.io/Dispatch/opportunity-radar/</link>\n  <description>Top Central PA opportunities</description>\n  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${rssItems}\n</channel>\n</rss>`;

await fs.writeFile(path.join(webDir, 'feed.free.rss.xml'), rss);
console.log('Built feeds: web/feed.free.json, web/feed.pro.json, web/feed.free.rss.xml');
