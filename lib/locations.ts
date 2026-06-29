/**
 * Location utilities for Smart Choice Constructions
 * 
 * Architecture: Cities are stored in /public/data/cities.json
 * This allows adding/updating cities without changing code.
 * 
 * To add new cities: edit public/data/cities.json and redeploy.
 * To add new states: add to US_STATES in lib/data.ts AND cities.json.
 */

import { US_STATES } from "./data";

export function getStateBySlug(slug: string) {
  return US_STATES.find(s => s.slug === slug) ?? null;
}

export function getStateByCode(code: string) {
  return US_STATES.find(s => s.code === code) ?? null;
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function slugToCity(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function buildLocationUrl(stateSlug: string, citySlug?: string, serviceSlug?: string): string {
  let url = `/locations/${stateSlug}`;
  if (citySlug) url += `/${citySlug}`;
  if (serviceSlug) url += `/${serviceSlug}`;
  return url;
}

// Static params generators
export function getStateParams() {
  return US_STATES.map(s => ({ state: s.slug }));
}

export function getCityParams() {
  // Uses the cities from US_STATES for SSG
  const params: { state: string; city: string }[] = [];
  US_STATES.forEach(s => {
    s.cities.forEach(city => {
      params.push({ state: s.slug, city: cityToSlug(city) });
    });
  });
  return params;
}
