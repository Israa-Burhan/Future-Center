// core/guards/login-block.guard.ts
import { inject } from '@angular/core';
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
  const role = localStorage.getItem('sb_role');
  if (role) {
    return router.parseUrl(
      role === 'staff' ? '/staff/dashboard' : '/admin/dashboard'
    );
  }
  return true;
};
