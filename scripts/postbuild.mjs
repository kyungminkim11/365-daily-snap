import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const origin = 'https://snap.lavalabs.co.kr';
const base = await readFile(path.join(dist, 'index.html'), 'utf8');
const portfolio = JSON.parse(await readFile(path.join(dist, 'portfolio', 'portfolio.json'), 'utf8'));
const projects = Array.isArray(portfolio.projects) ? portfolio.projects : [];

const locales = {
  ko: {
    lang: 'ko',
    title: '365 Daily Snap | 서울 인물 스냅·프로필 촬영',
    description: '당신다운 순간이 오래 남는 장면이 되도록. 서울·수도권을 중심으로 자연스러운 인물 스냅, 프로필, 커플 촬영을 진행합니다.',
    locale: 'ko_KR',
  },
  ja: {
    lang: 'ja',
    title: '365 Daily Snap | ソウル・東京 ポートレート撮影',
    description: '会話や動きの中に生まれる自然な表情を大切にした、ソウル首都圏中心のポートレート撮影です。',
    locale: 'ja_JP',
  },
  en: {
    lang: 'en',
    title: '365 Daily Snap | Seoul & Tokyo Portrait Photographer',
    description: 'Natural portrait, profile and couple sessions around Seoul and the capital area, with selected Tokyo dates.',
    locale: 'en_US',
  },
};

const seoPages = {
  'seoul-portrait': {
    ko: ['서울에서 자연스럽게 남기는 인물 스냅', '성수, 연남, 한강, 서울숲을 중심으로 개인 인물 스냅과 프로필 촬영을 진행합니다.'],
    ja: ['ソウルで自然に残すポートレート', '聖水、延南、漢江、ソウル森などを中心に人物スナップを撮影します。'],
    en: ['Natural portrait sessions in Seoul', 'Personal portraits and profile sessions around Seongsu, Yeonnam, Hangang and Seoul Forest.'],
  },
  'ilsan-profile': {
    ko: ['일산 프로필 촬영', '일산·고양을 중심으로 호수공원, 카페, 거리에서 자연스러운 프로필 촬영을 진행합니다.'],
    ja: ['一山エリアのプロフィール撮影', '一山・高陽を中心に、公園、カフェ、街で自然なプロフィール写真を撮影します。'],
    en: ['Profile sessions around Ilsan', 'Natural profile sessions around Ilsan and Goyang, including parks, cafes and street locations.'],
  },
  'couple-snap': {
    ko: ['자연스러운 커플·데이트 스냅', '걷고 대화하는 흐름 속에서 두 사람다운 표정과 분위기를 기록합니다.'],
    ja: ['自然なカップルスナップ', '歩きながら会話する流れの中で、二人らしい表情と雰囲気を残します。'],
    en: ['Relaxed couple and date sessions', 'Natural couple portraits shaped around walking, conversation and genuine movement.'],
  },
};

const escapeAttribute = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const escapeXml = (value = '') => escapeAttribute(value).replaceAll("'", '&apos;');

const absoluteUrl = (value = '') => {
  const src = String(value || '').trim();
  if (!src) return `${origin}/brand-symbol.svg`;
  if (/^https?:\/\//i.test(src)) return src;
  return `${origin}${src.startsWith('/') ? src : `/${src}`}`;
};

function renderHtml({ code, route = '', title, description, image }) {
  const meta = locales[code];
  const routePath = `/${code}${route ? `/${route}` : ''}`;
  const canonical = `${origin}${routePath}`;
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);
  const safeImage = escapeAttribute(absoluteUrl(image));

  return base
    .replace(/<html lang="[^"]*">/, `<html lang="${meta.lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${safeDescription}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${safeTitle}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${safeDescription}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(" \/>)/, `$1${meta.locale}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(" \/>)/, `$1${safeImage}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${safeTitle}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${safeDescription}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(" \/>)/, `$1${safeImage}$2`);
}

async function writeRoute(code, route, options) {
  const directory = path.join(dist, code, ...route.split('/').filter(Boolean));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), renderHtml({ code, route, ...options }));
}

const sitemapRoutes = [];
const addSitemapRoute = (route, priority, alternates = []) => sitemapRoutes.push({ route, priority, alternates });

for (const [code, meta] of Object.entries(locales)) {
  await writeRoute(code, '', { title: meta.title, description: meta.description, image: portfolio.projects?.[0]?.cover });
  addSitemapRoute(`/${code}`, code === 'ko' ? '1.0' : '0.9', Object.keys(locales).map((language) => ({ language, route: `/${language}` })));

  for (const [slug, page] of Object.entries(seoPages)) {
    const [pageTitle, pageDescription] = page[code];
    await writeRoute(code, slug, {
      title: `${pageTitle} | 365 Daily Snap`,
      description: pageDescription,
      image: portfolio.projects?.[0]?.cover,
    });
    addSitemapRoute(`/${code}/${slug}`, code === 'ko' ? '0.8' : '0.7', Object.keys(locales).map((language) => ({ language, route: `/${language}/${slug}` })));
  }

  for (const project of projects) {
    const id = encodeURIComponent(String(project.id || project.title || 'project').trim());
    const title = `${project.title || 'Portrait Project'} | 365 Daily Snap`;
    const description = project.description || meta.description;
    const image = project.cover || project.media?.[0]?.src;
    await writeRoute(code, `work/${id}`, { title, description, image });
    addSitemapRoute(`/${code}/work/${id}`, code === 'ko' ? '0.7' : '0.6');
  }
}

addSitemapRoute('/learn/', '0.9');

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapRoutes.map(({ route, priority, alternates }) => `  <url>
    <loc>${escapeXml(`${origin}${route}`)}</loc>
${alternates.map(({ language, route: alternateRoute }) => `    <xhtml:link rel="alternate" hreflang="${language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en'}" href="${escapeXml(`${origin}${alternateRoute}`)}" />`).join('\n')}${alternates.length ? '\n' : ''}    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await copyFile(path.join(dist, 'index.html'), path.join(dist, '404.html'));

const analyticsPath = path.join(dist, 'analytics.html');
try {
  const analyticsHtml = await readFile(analyticsPath, 'utf8');
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  await writeFile(
    analyticsPath,
    analyticsHtml
      .replaceAll('__SUPABASE_URL__', supabaseUrl)
      .replaceAll('__SUPABASE_PUBLISHABLE_KEY__', supabasePublishableKey),
  );
} catch {
  // Analytics dashboard is optional in local builds.
}

for (const route of ['admin', 'manager']) {
  const dir = path.join(dist, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0; url=/admin-v2.html"><title>365 Daily Snap Admin</title></head><body><a href="/admin-v2.html">관리자 페이지로 이동</a></body></html>');
}
