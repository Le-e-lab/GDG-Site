#!/usr/bin/env node
/**
 * sync-gdg-events.mjs
 * -------------------
 * Pull upcoming events from the Google Developer Groups community site
 * (gdg.community.dev) and insert them into Supabase as status='pending'
 * so admins can review and approve them in the Admin panel.
 *
 * The GDG events page is a client-rendered SPA, so this uses Playwright
 * to render it and scrape the live event cards.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_KEY=... node scripts/sync-gdg-events.mjs
 *
 * Requires a Supabase key with INSERT rights on `events`
 * (service_role key, or anon + public insert policy).
 *
 * Optional env:
 *   CHAPTER_URL  - chapter-specific events page (e.g. .../gdg-on-campus-africa-university/)
 *                  Defaults to the global GDG events feed.
 *   MAX_EVENTS   - cap on how many events to insert per run (default 10)
 */
import { chromium } from 'playwright';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ihmsyiczhhxmupouipnu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const CHAPTER_URL = process.env.CHAPTER_URL || 'https://gdg.community.dev/events/';
const MAX_EVENTS = parseInt(process.env.MAX_EVENTS || '10', 10);
const CHROME = process.env.CHROME_PATH || '/home/lee/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

if (!SUPABASE_KEY) {
  console.error('Missing SUPABASE_KEY env var. Set it to a key with insert rights on the events table.');
  process.exit(1);
}

async function fetchRenderedEvents(url) {
  const browser = await chromium.launch({ executablePath: CHROME });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);

    return await page.evaluate(() => {
      const events = [];
      document.querySelectorAll('li.row.event').forEach((li) => {
        const linkEl = li.querySelector('a[href*="/events/details/"]');
        if (!linkEl) return;

        const titleEl = li.querySelector('h4');
        const title = titleEl ? titleEl.textContent.trim() : '';
        if (!title) return;

        const dateEl = li.querySelector('.date, [class*="dateText"]');
        const dateText = dateEl ? dateEl.textContent.replace(/\s+/g, ' ').trim() : '';
        const dateMatch = dateText.match(/([A-Z][a-z]{2} \d{1,2}, \d{4})/);
        const date = dateMatch ? new Date(dateMatch[1] + ' UTC') : null;

        // Description: the paragraph after the chips (text between chips and "View details")
        const allText = li.textContent.replace(/\s+/g, ' ').trim();
        const detailIdx = allText.indexOf('View details');
        let description = detailIdx > -1 ? allText.substring(0, detailIdx).trim() : allText;
        // Trim trailing date/chapter line noise
        description = description.replace(/^.*?\d{4} - /, '').slice(0, 300);

        const href = linkEl.href.startsWith('http') ? linkEl.href : 'https://gdg.community.dev' + linkEl.getAttribute('href');

        events.push({
          title,
          description,
          link: href,
          source_url: href,
          date: date ? date.toISOString().slice(0, 10) : null,
          status: 'pending',
        });
      });
      return events;
    });
  } finally {
    await browser.close();
  }
}

async function upsertToSupabase(events) {
  if (events.length === 0) {
    console.log('No events found to sync.');
    return { inserted: 0, skipped: 0 };
  }

  let inserted = 0;
  let skipped = 0;

  for (const ev of events) {
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/events?select=id&source_url=eq.${encodeURIComponent(ev.source_url)}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const existing = await checkRes.json();

    if (Array.isArray(existing) && existing.length > 0) {
      skipped++;
      continue;
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(ev),
    });

    if (insertRes.ok) {
      inserted++;
    } else {
      const err = await insertRes.text();
      console.warn(`Insert failed for "${ev.title}": ${err}`);
    }
  }

  return { inserted, skipped };
}

async function main() {
  console.log(`Rendering GDG events from ${CHAPTER_URL}...`);
  const events = await fetchRenderedEvents(CHAPTER_URL);
  console.log(`Parsed ${events.length} events. Inserting up to ${MAX_EVENTS}...`);
  const result = await upsertToSupabase(events.slice(0, MAX_EVENTS));
  console.log(`Done. Inserted ${result.inserted}, skipped ${result.skipped} duplicates.`);
}

main().catch((err) => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});
