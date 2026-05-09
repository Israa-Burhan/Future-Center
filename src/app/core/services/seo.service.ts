import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { filter } from 'rxjs';
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  SITE_ORIGIN,
  SeoRouteData,
} from '../config/seo.config';

function deepestRoute(snapshot: RouterStateSnapshot): ActivatedRouteSnapshot {
  let r = snapshot.root;
  while (r.firstChild) {
    r = r.firstChild;
  }
  return r;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** ربط مع أحداث التوجيه من الجذر (استدعِ applyFromRouter مرة عند init) */
  attachRouter(router: Router): void {
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.applyFromRouter(router));
  }

  applyFromRouter(router: Router): void {
    const path = router.url.split('?')[0] || '/';

    if (
      path.startsWith('/admin') ||
      path.startsWith('/staff') ||
      path === '/login'
    ) {
      this.applyPrivateArea(path);
      return;
    }

    const leaf = deepestRoute(router.routerState.snapshot);
    const seo = leaf.data['seo'] as SeoRouteData | undefined;

    const title = seo?.title ?? SITE_NAME;
    const description =
      seo?.description ??
      'سنتر تعليمي — مواعيد الحصص، المواد، التسجيل والتواصل.';
    const keywords = seo?.keywords ?? DEFAULT_KEYWORDS;

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    const canonical = `${SITE_ORIGIN}${path === '' ? '/' : path}`;
    this.setCanonical(canonical);

    const ogImage = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:locale', content: 'ar_EG' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: ogImage });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    if (path === '/' || path === '') {
      this.setOrganizationJsonLd(canonical);
    } else {
      this.removeOrganizationJsonLd();
    }
  }

  private applyPrivateArea(path: string): void {
    const short = path.startsWith('/admin')
      ? 'لوحة التحكم'
      : path.startsWith('/staff')
        ? 'بوابة الموظفين'
        : 'تسجيل الدخول';
    this.title.setTitle(`${short} | Future Center`);
    this.meta.updateTag({
      name: 'description',
      content: 'منطقة خاصة بالإدارة والموظفين.',
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.removeCanonical();
    this.removeOrganizationJsonLd();
  }

  private setCanonical(href: string): void {
    let link = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private removeCanonical(): void {
    this.document.querySelector('link[rel="canonical"]')?.remove();
  }

  private setOrganizationJsonLd(siteUrl: string): void {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Future Center — سنتر مستقبل للتعليم',
      url: siteUrl,
      description:
        'سنتر تعليمي يقدّم مواعيد حصص منظمة، مواد دراسية، وتسجيلاً للطلاب مع تواصل سهل مع الأسر.',
      inLanguage: 'ar',
    };

    let script = this.document.getElementById(
      'seo-org-jsonld'
    ) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'seo-org-jsonld';
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }

  private removeOrganizationJsonLd(): void {
    this.document.getElementById('seo-org-jsonld')?.remove();
  }
}
