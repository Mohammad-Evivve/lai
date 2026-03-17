# LAI Compound Intelligence Engine: Technical Specifications

## 1. The Three-Tier Truth Hierarchy
The engine does not treat all data equally. It filters every signal through a Weighted Sovereignty Model to ensure the final Index reflects reality, not just noise.

| Tier | Source | Weight (W) | Description |
| :--- | :--- | :--- | :--- |
| **Tier 0: Sovereign** | Proprietary Research | 1.2 | High-priority overrides. Direct expert injection. |
| **Tier 1: Observed** | Evivve Simulation | 1.0 | Behavioral telemetry. How leaders act under pressure. |
| **Tier 2: Perception** | Self-Diagnostic / Survey | 0.8 | Internal sentiment. How the org perceives its own adaptiveness. |
| **Tier 3: Inferred** | Market Intelligence | 0.4 | External context. Signals from global news and filings. |

## 2. The Seniority Multiplier ($S_m$)
The engine applies a secondary weighting layer based on the source's organizational authority. This ensures that strategic "framing" from leadership carries more weight than operational feedback.

$$Score_{Adjusted} = Score_{Base} \times S_m$$

- **C-Suite / Board**: $1.5\times$
- **SVP / VP / Director**: $1.2\times$
- **Middle Management**: $1.0\times$ (Baseline)
- **Individual Contributor**: $0.8\times$

## 3. The Global Aggregation Formula
The Leadership Adaptiveness Index (LAI) for any organization is the sum of all weighted signals across the 5 Pillars (led by Cognitive Framing), divided by the total potential weight.

$$LAI_{Final} = \frac{\sum (Signal_{Score} \times W_{Tier} \times S_m)}{\sum (W_{Tier} \times S_m)}$$

## 4. Data Hydration & Regional Mapping
The engine utilizes a Self-Hydrating Nerve System to maintain global coverage and regional narratives.

- **Master Registry**: A verified list of the Global 2000 organizations.
- **Geo-Tagging**: Every organization is mapped to one of four regions: North America, EMEA, APAC, LATAM.
- **The Orion Scout (Chron Job)**: An automated scraper that executes every 60 minutes, searching for strategic keywords (e.g., "Strategic Calibration," "Challenge Networks") to generate Tier 3 signals.
- **Timestamping**: Every data point is indexed with a last_updated UTC timestamp to ensure data "freshness" and auditability.

## 5. Taxonomy & Pillars
To ensure boardroom credibility, the engine standardizes all data into five distinct pillars:

1. **Signal Detection**: Measures the delta between environmental changes and institutional recognition context.
2. **Cognitive Framing**: Evaluates the cognitive framing (threat vs opportunity) of detected environmental shifts.
3. **Decision Alignment**: Measures the coherence and precision of decisions across the leadership system.
4. **Resource Calibration**: Observes the speed and precision of capital and talent redirection during disruption.
5. **Integrated Responsiveness**: Measures the translation of strategy into systemic, coordinated behavioral response.

## 6. Real-Time Broadcast Architecture
The system uses Supabase Realtime (Postgres Changes) to broadcast updates. When the Orion Scout injects a new Tier 3 signal for a company like NVIDIA, the following happens:
1. The database triggers a **Recalculation**.
2. The `organizations` table is updated with the new `last_updated` timestamp.
3. The **Frontend (React)** receives the broadcast and updates the "Verified Signals" count and the leaderboard position without a page refresh.
