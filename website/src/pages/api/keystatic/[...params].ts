/**
 * Custom Keystatic API route that explicitly passes environment variables
 * via process.env instead of relying on import.meta.env (which may not
 * be properly resolved for externalized node_modules in Vercel SSR).
 */
import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

export const all = makeHandler({
  config,
  clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: process.env.KEYSTATIC_SECRET,
});

export const ALL = all;
export const prerender = false;
