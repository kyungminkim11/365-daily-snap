import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const base = await readFile(path.join(dist, 'index.html'), 'utf8');
const locales = {
  ko: { lang: 'ko', title: '365 Daily Snap | 서울 인물 스냅·프로필 촬영', description: '서울·수도권에서 자연스러운 인물 스냅, 프로필, 커플 촬영과 모델 포트폴리오 협업을 진행합니다.', locale: 'ko_KR' },
  ja: { lang: 'ja', title: '365 Daily Snap | ソウル・東京 ポートレート撮影', description: 'ソウル首都圏を中心に、自然なポートレート、プロフィール、カップル撮影を行います。', locale: 'ja_JP' },
  en: { lang: 'en', title: '365 Daily Snap | Seoul & Tokyo Portrait Photographer', description: 'Natural portrait, profile and couple sessions in Seoul, the capital area and selected Tokyo dates.', locale: 'en_US' },
};

for (const [code, meta] of Object.entries(locales)) {
  const dir = path.join(dist, code);
  await mkdir(dir, { recursive: true });
  const html = base
    .replace('<html lang="ko">', `<html lang="${meta.lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${meta.description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1https://snap.lavalabs.co.kr/${code}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1https://snap.lavalabs.co.kr/${code}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${meta.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${meta.description}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(" \/>)/, `$1${meta.locale}$2`);
  await writeFile(path.join(dir, 'index.html'), html);
}

await copyFile(path.join(dist, 'index.html'), path.join(dist, '404.html'));
for (const route of ['admin', 'manager']) {
  const dir = path.join(dist, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0; url=/admin-v2.html"><title>365 Daily Snap Admin</title></head><body><a href="/admin-v2.html">관리자 페이지로 이동</a></body></html>');
}
