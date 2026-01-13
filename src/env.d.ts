/// <reference types="vite/client" />

import type { TemplatesService, ExercisesService } from '@/types';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Global window augmentation for legacy JS services.
 * These services are exposed via window.* for backward compatibility
 * with the existing js/*.js code during the migration.
 */
declare global {
  interface Window {
    /** Templates service - manages workout templates */
    templates: TemplatesService;
    /** Exercises service - manages exercise library */
    exercises: ExercisesService;
  }
}
