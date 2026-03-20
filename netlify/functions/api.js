const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const { supabase: supabaseClient } = require('./lib/supabase.js');
const emailLib = require('./lib/email.js');
const emailTemplates = require('./lib/emailTemplates.js');
const { sendEmail, getSender } = emailLib;
const { INTERNAL, ESSENTIAL } = emailTemplates;

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. IMPORT NEW 10-LAYER ROUTES
const ingestRoutes = require('./routes/ingest');
const deliveryRoutes = require('./routes/delivery');

// 2. MOUNT ROUTES
// Mount at root since netlify.toml redirects /api/* to this function
app.use('/api/v1', ingestRoutes);
app.use('/api/v1/delivery', deliveryRoutes);

// 3. ENHANCED HEALTH CHECK (L10)
app.get(['/api/health', '/health'], async (req, res) => {
  res.json({
    status: 'ok',
    version: 'v3.1.0-10LAYER',
    timestamp: new Date().toISOString(),
    doctrine: 'AFERR-before-LAI'
  });
});

// 4. LEGACY ALIASES (Optional, for smoother migration)
// Redirect old /api/diagnostic to new 10-layer /api/v1/diagnostic/submit
app.post(['/api/diagnostic', '/diagnostic'], (req, res) => {
  res.redirect(307, '/api/v1/diagnostic/submit');
});

module.exports = { app };
module.exports.handler = serverless(app);
