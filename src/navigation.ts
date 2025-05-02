import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';

export const locales = ['en', 'ar'] as const;
export const localePrefix = 'always'; // Default

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, use
  // the usual string syntax
  '/': '/',
  '/admin': '/admin',

  // If locales use different paths, use an object
//   '/about': {
//     en: '/about',
//     de: '/ueber-uns'
//   },

  // Dynamic params are supported via square brackets
//   '/news/[articleSlug]-[articleId]': {
//     en: '/news/[articleSlug]-[articleId]',
//     de: '/neuigkeiten/[articleSlug]-[articleId]'
//   },

  // Also (optional) catch-all segments are supported
//   '/categories/[...slug]': {
//     en: '/categories/[...slug]',
//     de: '/kategorien/[...slug]'
//   }
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});
