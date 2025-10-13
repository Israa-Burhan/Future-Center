import { inject } from '@angular/core';
import {
  CanMatchFn,
  CanActivateChildFn,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

async function requireSessionOrRedirect(
  attemptedUrl: string
): Promise<true | UrlTree> {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = await auth.getSession();
  if (!session) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: attemptedUrl },
    });
  }
  return true;
}

export const adminCanMatch: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  const attemptedUrl = '/' + segments.map((s) => s.path).join('/') || '/admin';
  return requireSessionOrRedirect(attemptedUrl);
};
export const adminCanActivateChild: CanActivateChildFn = async (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ok = await requireSessionOrRedirect(state.url);
  if (ok !== true) return ok;
  const required =
    (childRoute.data?.['roles'] as ('admin' | 'staff')[] | undefined) ?? [];
  if (!required.length) return true;

  const roleOrRoles = await auth.getRole();
  const userRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];

  return required.some((r) => userRoles.includes(r))
    ? true
    : router.parseUrl('/admin/dashboard');
};
