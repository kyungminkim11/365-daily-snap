import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PLACES } from '../src/data/shootPlaces.js';
import { LESSONS } from '../src/data/photoLessons.js';

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
  const pages = [['locations','촬영지 찾기'],['portfolio','포트폴리오'],['guide','촬영 안내'],['about','소개'],['faq','자주 묻는 질문'],['contact','촬영 문의'],['plan','촬영 계획'], ['learn','사진 배우기'],['learn/labs','사진 실험실'],['learn/glossary','사진 용어 사전'],...LESSONS.map(l=>[`learn/${l.id}`,l.title]), ...PLACES.map(p => [`locations/${p.id}`,p.name])];
  for (const [route,title] of pages) {
    const pageDir = path.join(dir,route);
    await mkdir(pageDir,{recursive:true});
    const safeTitle = title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
    const url = `https://snap.lavalabs.co.kr/${code}/${route.split('/').map(encodeURIComponent).join('/')}`;
    await writeFile(path.join(pageDir,'index.html'),html.replace(/<title>.*?<\/title>/,`<title>${safeTitle} | 365 Daily Snap</title>`).replace(/(<meta property="og:title" content=")[^"]*(")/,`$1${safeTitle} | 365 Daily Snap$2`).replace(/(<link rel="canonical" href=")[^"]*(")/,`$1${url}$2`).replace(/(<meta property="og:url" content=")[^"]*(")/,`$1${url}$2`));
  }
}

await copyFile(path.join(dist, 'index.html'), path.join(dist, '404.html'));
for (const route of ['admin', 'manager']) {
  const dir = path.join(dist, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0; url=/admin-v2.html"><title>365 Daily Snap Admin</title></head><body><a href="/admin-v2.html">관리자 페이지로 이동</a></body></html>');
}
