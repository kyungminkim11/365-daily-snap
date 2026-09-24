async function refresh() {
 const el = document.getElementById("instagram-sync-health");
 el.textContent = "확인 중…";
 try {
  const [feed, status] = await Promise.all(["/portfolio/instagram-feed.json", "/portfolio/instagram-status.json"].map(async (url) => { const r = await fetch(url, {cache:"no-store"}); if (!r.ok) throw new Error(); return r.json(); }));
  el.textContent = `${status.status === "success" ? "연동 정상" : "연결 확인 필요"} · 게시물 ${feed.projects?.length || 0}개 · 마지막 성공 ${feed.updatedAt ? new Date(feed.updatedAt).toLocaleString("ko-KR", {timeZone:"Asia/Seoul"}) + " KST" : "아직 없음"} · ${status.error || ""}`;
 } catch { el.textContent = "상태를 읽지 못했습니다. 네트워크 및 동기화 기록을 확인해주세요."; }
}
document.getElementById("refresh-instagram-health").addEventListener("click", refresh);
refresh();
