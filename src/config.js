/**
 * SmartDine Admin — API Endpoint Configuration
 *
 * Two separate API surfaces power this system:
 *
 *  API_URL        — Local Spring Boot POS hub (localhost:8080 in dev)
 *                   Offline-first. Used for all live POS operations:
 *                   orders, menu, tables, KDS, waiter sync.
 *                   Works without internet (LAN only).
 *
 *  CLOUD_API_URL  — GCP App Engine gateway (always internet-facing)
 *                   Used ONLY for account registration and cloud management.
 *                   Routes registrations to the correct GCP Cloud SQL database:
 *                     isTest=true  → smartdine_dev (sandbox)
 *                     isTest=false → smartdine     (production)
 *
 * Environment values are injected by Vite at build time from .env.* files.
 */

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const CLOUD_API_URL =
  import.meta.env.VITE_CLOUD_API_URL || 'https://smartdine-saas.ew.r.appspot.com';
