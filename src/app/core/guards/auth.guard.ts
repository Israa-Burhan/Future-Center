import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

export const AuthGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    const session = await auth.getSession();
    if (!session)
      return router.parseUrl(
        '/login?returnUrl=' + encodeURIComponent(state.url)
      );

    const allowed = route.data?.['roles'] as string[] | undefined;
    if (!allowed) return true;

    const role = await auth.getRole();
    return allowed.includes(role) ? true : router.parseUrl('/admin/dashboard');
  } catch (e) {
    console.error('AuthGuard error:', e);
    return router.parseUrl('/login');
  }
};
