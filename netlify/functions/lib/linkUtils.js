/**
 * Link Generation Utility for LAI Institutional Communication
 * Ensures consistent, verified URLs across production and development.
 */

const getBaseUrl = () => {
  // If we have an explicit APP_URL env, use it (Prod)
  if (process.env.APP_URL) return process.env.APP_URL;
  
  // Default to the known production domain if context looks like production
  if (process.env.CONTEXT === 'production') return 'https://adaptiveness.institute';
  
  // Fallback for local development
  return 'http://localhost:5000';
};

/**
 * Generates a fully qualified application link
 * @param {string} path - The relative path (e.g., '/report/123')
 * @param {object} params - Optional query parameters
 */
const generateAppLink = (path, params = {}) => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const url = new URL(cleanPath, baseUrl);
  
  Object.keys(params).forEach(key => {
    if (params[key]) url.searchParams.append(key, params[key]);
  });
  
  const finalUrl = url.toString();
  
  // Link Validation Check (Dev Safety)
  if (!finalUrl || !finalUrl.startsWith("http")) {
    console.warn("Invalid email link generated:", finalUrl);
  }
  
  console.log("Email Link Generated:", finalUrl);
  return finalUrl;
};

module.exports = { generateAppLink, getBaseUrl };
