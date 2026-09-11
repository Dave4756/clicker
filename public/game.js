const POPUP_TEXTS = [
  "you hurt my heart",
  "아이 시발",
  "손들어 임마",
  "이 negative",
]; // 문구를 늘리려면 이 배열에 문자열만 추가하세요.

const IDLE_IMAGE = "/assets/idle.png";
const CLICK_IMAGE = "/assets/click.png";

// 클릭 이미지 미리 로드 (Preload)
const clickImgPreload = new Image();
clickImgPreload.src = CLICK_IMAGE;
const scoreEl = document.querySelector("#score");
const powerEl = document.querySelector("#power");
const mineBtn = document.querySelector("#mineBtn");
const mineArea = document.querySelector("#mineArea");
const targetImage = document.querySelector("#targetImage");
const floatLayer = document.querySelector("#floatLayer");
const nicknameEl = document.querySelector("#nickname");
const statusEl = document.querySelector("#status");
const dialog = document.querySelector("#rankingDialog");
let score = Math.max(0, Number(localStorage.getItem("hairScore")) || 0);
let power = 1;
let imageTimer;

function render() { scoreEl.textContent = score.toLocaleString("ko-KR"); powerEl.textContent = `+${power}`; }
function popupText() {
  const el = document.createElement("span");
  el.className = "popup-text";
  el.textContent = POPUP_TEXTS[Math.floor(Math.random() * POPUP_TEXTS.length)];
  const maxX = Math.max(20, mineArea.clientWidth - 180);
  const maxY = Math.max(20, mineArea.clientHeight - 60);
  el.style.left = `${10 + Math.random() * (maxX - 10)}px`;
  el.style.top = `${10 + Math.random() * (maxY - 10)}px`;
  el.style.setProperty("--tilt", `${-12 + Math.random() * 24}deg`);
  floatLayer.append(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}
function mine() {
  score += power; localStorage.setItem("hairScore", String(score)); render(); popupText();
  targetImage.src = CLICK_IMAGE; clearTimeout(imageTimer);
  imageTimer = setTimeout(() => { targetImage.src = IDLE_IMAGE; }, 120);
  mineBtn.animate([{transform:"scale(1)"},{transform:"scale(.94)"},{transform:"scale(1)"}],{duration:130});
}
mineBtn.addEventListener("pointerdown", mine);
mineBtn.addEventListener("keydown", e => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); mine(); } });
async function loadRanking() {
  const list = document.querySelector("#rankingList"); list.innerHTML = "<li>불러오는 중...</li>"; dialog.showModal();
  try { const r = await fetch("/api/ranking"); const rows = await r.json(); if (!r.ok) throw new Error();
    list.innerHTML = rows.length ? rows.map((x,i)=>`<li><b>${i+1}</b><span></span><strong>${escapeHtml(x.nickname)}</strong><em>${Number(x.score).toLocaleString("ko-KR")}</em></li>`).join("") : "<li>첫 기록을 등록해 보세요.</li>";
  } catch { list.innerHTML = "<li>랭킹을 불러오지 못했습니다.</li>"; }
}
function escapeHtml(s){ const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }
document.querySelector("#rankingBtn").onclick = loadRanking;
document.querySelector("#closeRanking").onclick = () => dialog.close();
document.querySelector("#saveBtn").onclick = async () => {
  const nickname = nicknameEl.value.trim(); if (nickname.length < 2) { statusEl.textContent="닉네임을 2자 이상 입력하세요."; return; }
  statusEl.textContent="저장 중...";
  try { const r=await fetch("/api/score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nickname,score})}); const body=await r.json(); if(!r.ok) throw new Error(body.error); statusEl.textContent="점수가 저장되었습니다."; }
  catch(e){ statusEl.textContent=e.message || "저장에 실패했습니다."; }
};
render();
