const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { supabase } = require('./lib/supabase.js');
const crypto = require('crypto');

/**
 * Orion Scout v3 — Volatility-Hunting Intelligence Scraper
 * Anchored: Semiconductors, Logistics, FinTech
 * Auto-Rotates: 2 additional sectors based on global news volume
 */

const ANCHOR_SECTORS = ['Semiconductors', 'Logistics', 'FinTech'];

// Volatility Rotation: sectors we monitor for news-volume spikes
const VOLATILITY_POOL = [
  'Aerospace', 'Defense', 'Healthcare', 'Energy', 'Automotive',
  'Real Estate', 'Retail', 'Agriculture', 'Pharma', 'Cybersecurity',
  'AI & Machine Learning', 'Quantum Computing', 'Space Technology'
];

const AFERR_WORDS = {
  proactive:       ['launch', 'pioneer', 'predict', 'anticipate', 'create', 'foresee', 'vision', 'blueprint', 'expand', 'invest', 'innovate', 'disrupt'],
  reactive:        ['responding', 'recovery', 'restoring', 'compensating', 'mitigate', 'downsize', 'defend', 'legacy', 'crisis', 'shortfall', 'delay'],
  experimentation: ['pilot', 'test', 'beta', 'sandbox', 'trial', 'prototype', 'exploratory', 'variant', 'innovation', 'experiment'],
  reflection:      ['pivot', 'lessons', 'feedback', 'review', 'adjustment', 'correction', 'post-mortem', 'calibration', 'overhaul', 'rethink']
};

// ── Volatility Hunter ─────────────────────────────────────────────────────────
async function detectVolatileSectors(page) {
  // Sample 6 random sectors and count news article density as a proxy for "volume"
  const sample = VOLATILITY_POOL.sort(() => Math.random() - 0.5).slice(0, 6);
  const scores = [];

  for (const sector of sample) {
    try {
      const url = `https://www.google.com/search?q=${encodeURIComponent(sector + ' industry news disruption 2026')}&tbm=nws`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const count = await page.evaluate(() => document.querySelectorAll('div.So033e, div.nS4uS, article').length);
      scores.push({ sector, count });
    } catch {
      scores.push({ sector, count: 0 });
    }
  }

  // Return top 2 by article count
  return scores.sort((a, b) => b.count - a.count).slice(0, 2).map(s => s.sector);
}

// ── AFERR Signal Extractor ───────────────────────────────────────────────────
function extractAFERRSignals(newsItems, company) {
  const signals = [];
  
  newsItems.forEach(item => {
    const text = item.text.toLowerCase();
    
    // Check against each AFERR category
    Object.keys(AFERR_WORDS).forEach(category => {
      const dimensionMap = {
        proactive:       'cognitive_framing',
        reactive:        'cognitive_framing',
        experimentation: 'resource_calibration',
        reflection:      'integrated_responsiveness'
      };

      AFERR_WORDS[category].forEach(word => {
        if (text.includes(word)) {
          const fingerprint = crypto.createHash('md5')
            .update(`${company.id || 'sector'}-${category}-${word}-${item.text.substring(0, 100)}`)
            .digest('hex');

          signals.push({
            institution_id:   company.id,
            institution_name: company.name,
            region:           company.region,
            sector:           company.industry,
            signal_type:      `Keyword Match: ${word}`,
            dimension_impacted: dimensionMap[category] || 'signal_detection',
            source_tier:      3, // Perceptual/Environmental
            source_name:      'Google News',
            impact_direction: category === 'reactive' ? -1 : 1,
            impact_strength:  1.5, // Standard keyword strength
            confidence:       0.7, // Scraped confidence
            fingerprint:      fingerprint,
            metadata: {
              source_text: item.text.substring(0, 200),
              category,
              matched_word: word
            }
          });
        }
      });
    });
  });

  return signals;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const startTime = Date.now();

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  const isCron     = event.headers?.['x-netlify-cron'] === 'true';
  const hasSecret  = event.headers?.['x-orion-secret'] === process.env.ORION_SECRET || body.secret === process.env.ORION_SECRET;
  if (!isCron && !hasSecret) return { statusCode: 401, body: 'Unauthorized' };

  console.log('🔭 Orion Scout v3 initiated (Signal Emission mode)…');

  let browser = null;
  try {
    // 1. Fetch targets with Regional Balancing (Rule 3)
    // Prioritize MEA, LATAM, and APAC if they haven't been scanned recently
    let { data: targets } = await supabase
      .from('organizations')
      .select('id, name, region, industry, last_scanned')
      .order('last_scanned', { ascending: true, nullsFirst: true })
      .limit(15); // Get a larger pool to pick from

    if (!targets?.length) {
      console.log('No targets found — aborting.');
      return { statusCode: 200, body: 'No targets to scan' };
    }

    // Prioritize MEA/LATAM in the current 5-target slice
    const priorityRegions = ['MEA', 'LATAM', 'Middle East', 'Africa', 'South America'];
    const sortedTargets = [...targets].sort((a, b) => {
      const aPrio = priorityRegions.some(r => a.region?.includes(r)) ? 0 : 1;
      const bPrio = priorityRegions.some(r => b.region?.includes(r)) ? 0 : 1;
      return aPrio - bPrio;
    }).slice(0, 5);

    // 2. Launch headless browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // 3. Detect volatile sectors
    const volatileSectors = await detectVolatileSectors(page);
    const activeSectors = [...new Set([...ANCHOR_SECTORS, ...volatileSectors])];

    // 4. Scan anchor orgs
    const allEmittedSignals = [];
    for (const company of sortedTargets) {
      console.log(`🔍 Scanning: ${company.name} (${company.region})`);
      const url = `https://www.google.com/search?q=${encodeURIComponent(company.name + ' leadership strategy news 2026')}&tbm=nws`;

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const newsItems = await page.evaluate(() =>
        Array.from(document.querySelectorAll('div.So033e, div.nS4uS, div.iY607c')).map(el => {
          const sourceEl = el.querySelector('div.MgAnRb, span.OSrYqb');
          return {
            text: el.innerText || '',
            date: el.querySelector('span')?.innerText || '',
            source: sourceEl ? sourceEl.innerText : 'Unknown Source'
          };
        })
      );

      const signals = extractAFERRSignals(newsItems, company);
      // Ensure source_name is populated from the news item
      signals.forEach((sig, idx) => {
        if (newsItems[idx]?.source) sig.source_name = newsItems[idx].source;
      });

      if (signals.length > 0) {
        // Soft Deduplication: Check if fingerprints already exist
        const fingerprints = signals.map(s => s.fingerprint);
        const { data: existing } = await supabase
          .from('signals_normalized')
          .select('fingerprint')
          .in('fingerprint', fingerprints);

        const existingSet = new Set(existing?.map(e => e.fingerprint) || []);
        const newSignals = signals.filter(s => !existingSet.has(s.fingerprint));

        if (newSignals.length > 0) {
          const { error } = await supabase.from('signals_normalized').insert(newSignals);
          if (!error) {
            await supabase.from('organizations').update({ last_scanned: new Date().toISOString() }).eq('id', company.id);
            allEmittedSignals.push(...newSignals);
          }
        }
      }
    }

    // 5. Also scan volatile-sector news for broad trend signals
    for (const sector of volatileSectors) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(sector + ' leadership adaptiveness strategies 2026')}&tbm=nws`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      
      const newsItems = await page.evaluate(() =>
        Array.from(document.querySelectorAll('div.So033e, div.nS4uS')).map(el => ({
          text: el.innerText || '',
          date: el.querySelector('span')?.innerText || ''
        }))
      );

      const signals = extractAFERRSignals(newsItems, { name: sector, industry: sector, region: 'Global' });
      if (signals.length > 0) {
        // Sector-level signals are stored with null institution_id but sector context
        const sectorSignals = signals.map(s => ({ ...s, institution_id: null }));
        await supabase.from('signals_normalized').insert(sectorSignals);
        allEmittedSignals.push(...sectorSignals);
      }

      await supabase.from('scraper_logs').insert([{
        status: 'signal',
        summary: `Orion Sector Scout | Sector: ${sector} | Signals Found: ${signals.length}`,
        duration_ms: Date.now() - startTime
      }]);
    }

    // 6. Final Audit log
    const duration = Date.now() - startTime;
    await supabase.from('scraper_logs').insert([{
      status: 'success',
      duration_ms: duration,
      signals_found: allEmittedSignals.length,
      summary: `Orion Scout v3 complete. Sectors: ${activeSectors.join(', ')}. Signals Emitted: ${allEmittedSignals.length}`
    }]);

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        status: 'success',
        sectors: activeSectors, 
        signals_emitted: allEmittedSignals.length 
      }) 
    };

  } catch (err) {
    console.error('Orion Scout Failure:', err);
    await supabase.from('scraper_logs').insert([{ status: 'error', summary: `Orion Scout v3 Error: ${err.message}` }]);
    return { statusCode: 500, body: err.message };
  } finally {
    if (browser) await browser.close();
  }
};

// Netlify 60-minute Cron Activation
exports.config = {
  schedule: "@hourly"
};
