/**
 * Custom Keystatic API route that explicitly passes environment variables
 * via process.env instead of relying on import.meta.env (which may not
 * be properly resolved for externalized node_modules in Vercel SSR).
 *
 * The handler is created per-request to ensure env vars are always read
 * at runtime rather than potentially being captured at module init time.
 */
import { makeHandler } from '@keystatic/astro/api';
import type { APIContext } from 'astro';
import config from '../../../../keystatic.config';

export const prerender = false;

export async function ALL(context: APIContext) {
  const handler = makeHandler({
    config,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET,
  });
  return handler(context);
}

export const all = ALL;
