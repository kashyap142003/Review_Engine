// USE_MOCK = true when no n8n URL is configured (local development / demo)
export const USE_MOCK = !import.meta.env.VITE_N8N_BASE_URL || import.meta.env.VITE_USE_MOCK === '1';

export const product = {
  name: import.meta.env.VITE_PRODUCT_NAME || 'Review Engine',
  logoUrl: import.meta.env.VITE_PRODUCT_LOGO_URL || '',
  accent: import.meta.env.VITE_PRODUCT_ACCENT || '#4F46E5',
};