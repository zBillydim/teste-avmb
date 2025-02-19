// src/middleware/auth.ts
import { parseCookies } from 'nookies'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const token = parseCookies().avmb
  if (token) {
    return next()
  }
  return next({ path: '/' })
}
