/**
 * Surfaces Module
 *
 * Barrel export for all UI surfaces.
 * Each surface represents a major section of the application.
 */

export { default as AuthSurface } from './auth';
export type { AuthSubSurface, PasswordField } from './auth';

export { default as DashboardSurface } from './dashboard';
export type { UserChart } from './dashboard';
