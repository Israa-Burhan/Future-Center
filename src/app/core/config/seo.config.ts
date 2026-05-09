/**
 * غيّر SITE_ORIGIN إلى رابط موقعك الكامل مع HTTPS بعد ربط الدومين.
 * استخدم نفس القيمة في src/assets/robots.txt و src/assets/sitemap.xml (بحث واستبدال سريع داخل المجلد).
 */
export const SITE_ORIGIN = 'https://future-center.example';

/** مسار صورة المشاركة الافتراضية (مسار مطلق من جذر الموقع) */
export const DEFAULT_OG_IMAGE_PATH = '/favicon.ico';

export const SITE_NAME = 'Future Center — سنتر مستقبل للتعليم';

export const DEFAULT_KEYWORDS =
  'سنتر تعليمي، دروس تقوية، مستقبل للتعليم، مواعيد الحصص، تسجيل طلاب، سنتر دروس';

export interface SeoRouteData {
  title: string;
  description: string;
  keywords?: string;
}
