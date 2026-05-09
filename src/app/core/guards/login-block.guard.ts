// core/guards/login-block.guard.ts
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  CanMatchFn,
  Route,
  UrlSegment,
  Router,
  UrlTree,
} from '@angular/router';

export const loginBlockGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const role = localStorage.getItem('sb_role');
  if (role) {
    return router.parseUrl(
      role === 'staff' ? '/staff/dashboard' : '/admin/dashboard'
    );
  }
  return true;
};
