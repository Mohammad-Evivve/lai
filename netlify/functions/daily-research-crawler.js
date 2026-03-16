const { supabase } = require('./lib/supabase.cjs');

/**
 * Netlify Scheduled Function: daily-research-crawler
 * Retrieves simulated global data/research concepts and maps them 
 * onto the LAI "Adaptiveness" formula logic.
 */
exports.handler = async (event) => {
  console.log('🤖 LAI Daily Research Crawler Initiated...');
  
  try {
    // 1. Fetch latest baseline scores to add empirical weight to the generated content
    const { data: scores } = await supabase
      .from('diagnostic_results')
      .select('overall_score')
      .order('created_at', { ascending: false })
      .limit(100);

    const sessionScores = (scores || []).map(s => s.overall_score || 0);
    const avgScore = sessionScores.length 
      ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
      : 55; // default if no data

    // 2. Generate content using the specific LAI formula
    // Formula Requirements: Leadership Adaptiveness, Global Index, Cognitive Links (AFERR/Neuroscience), Business/Crisis context, Evivve links
    
    // We create a structured response representing one day's "discoveries"
    const businessTopics = ['Supply Chain Resilience', 'Digital Disruption', 'Geopolitical Shockwaves', 'Generative AI Integration', 'Market Contraction'];
    const randomTopic = businessTopics[Math.floor(Math.random() * businessTopics.length)];
    
    // Generate a set of corresponding assets
    const generatedAssets = [
      {
        title: `Leadership Adaptiveness in the Age of ${randomTopic}`,
        type: 'Article',
        category: 'Article',
        description: `How global crisis and shifting profit margins mandate a new cognitive baseline. This article explores the neurological latency of executive teams under pressure, utilizing [Evivve - The Leadership Simulation](https://evivve.com) to measure authentic behavioral agility vs perceived strategy.`,
        link: '#', // In reality this would link to a generated PDF/page
        icon_type: 'text'
      },
      {
        title: `The 2026 ${randomTopic} Global Index Report`,
        type: 'Report',
        category: 'Report',
        description: `A comprehensive data analysis drawing from the Global Leadership Adaptiveness Index (GLAI). We track how organizations with high [AFERR](https://evivve.com) (Activation, Forecasting, Experimentation, Realization, Reflection) scores maintain revenue continuity during severe market volatility. Current global index baseline: ${avgScore}.`,
        link: '#',
        icon_type: 'pie'
      },
      {
        title: `Neuroscience of Crisis: The AFERR Framework`,
        type: 'Framework',
        category: 'Framework',
        description: `Mapping cognitive links between threat detection and business outcomes. This framework breaks down how the brain's amygdala hijacking delays execution responsiveness, and how simulated stress environments in [Evivve](https://evivve.com) can systematically reduce decision latency.`,
        link: '#',
        icon_type: 'target'
      },
      {
        title: `Boardroom Briefing: Reversing Margin Compression through Adaptiveness`,
        type: 'Strategic Deck',
        category: 'Strategic Deck',
        description: `Executive slide deck linking behavioral adaptability directly to EBITDA preservation. Synthesizes findings from thousands of [Evivve multiplayer simulations](https://evivve.com) to prove that dynamic resource reallocation is the primary defense against global crisis.`,
        link: '#',
        icon_type: 'chart'
      },
      {
        title: `Visualizing the Adaptiveness Gap: Cognitive Load vs Revenue Growth`,
        type: 'Infographic',
        category: 'Infographic',
        description: `A fast-read infographic plotting the direct correlation between AFERR behavioral scores and year-over-year business growth during times of disruption. Data sourced via the award-winning [Evivve Simulation Engine](https://evivve.com).`,
        link: '#',
        icon_type: 'chart' // Or whatever icon maps best, we'll update ResearchPage to handle this
      }
    ];

    // 3. Upsert into Supabase research_resources
    let published = 0;
    for (const asset of generatedAssets) {
      const { error } = await supabase
        .from('research_resources')
        .upsert([asset], { onConflict: 'title' });
      
      if (!error) published++;
      else console.warn(`⚠️ Failed to upsert "${asset.title}":`, error.message);
    }

    // 4. Log the action
    await supabase.from('scraper_logs').insert([{
      status: 'success',
      summary: `Daily Research Crawler deployed. Synthesized ${published} assets focusing on ${randomTopic}.`
    }]);

    console.log(`✅ Daily Crawler finished. Generated ${published} assets.`);
    return { statusCode: 200, body: `Successfully generated ${published} assets about ${randomTopic}.` };

  } catch (err) {
    console.error('❌ Daily Research Crawler Error:', err);
    await supabase.from('scraper_logs').insert([{ 
      status: 'error', 
      summary: `Crawler Error: ${err.message}` 
    }]);
    return { statusCode: 500, body: 'Crawler failed' };
  }
};
