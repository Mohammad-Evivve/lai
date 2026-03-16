import dotenv from 'dotenv';
dotenv.config();

import { app } from './netlify/functions/api.js';

const PORT = process.env.PORT || 8889;
app.listen(PORT, () => {
  console.log(`[LAI-DEV-API] Local API Server running at http://localhost:${PORT}`);
  console.log(`[LAI-DEV-API] Health Check: http://localhost:${PORT}/api/health`);
});
