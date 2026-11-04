// =============================================
// Medição de visitas e contatos (Google Ads e outras origens)
// Não guarda dados pessoais: só de onde a pessoa veio e o que clicou.
// =============================================

const KEY_ORIGEM = 'ef_origem';
const KEY_SESSAO = 'ef_sessao';
const VALIDADE_DIAS = 30;
const WA_NUMBER = '5511914339705';

const safeGet = (store, k) => { try { return store.getItem(k); } catch { return null; } };
const safeSet = (store, k, v) => { try { store.setItem(k, v); } catch { /* navegador bloqueou */ } };

function detectarOrigem() {
  const p = new URLSearchParams(window.location.search);
  const gclid = p.get('gclid') || p.get('gbraid') || p.get('wbraid');
  const src = (p.get('utm_source') || '').toLowerCase();
  const medium = (p.get('utm_medium') || '').toLowerCase();
  const campanha = p.get('utm_campaign') || null;
  const termo = p.get('utm_term') || null;

  if (gclid || (src === 'google' && /cpc|ppc|paid|ads/.test(medium))) {
    return { origem: 'google', campanha, termo, gclid };
  }
  if (src) {
    const map = { facebook: 'facebook', fb: 'facebook', instagram: 'instagram', ig: 'instagram', tiktok: 'tiktok', tt: 'tiktok', whatsapp: 'whatsapp', wa: 'whatsapp' };
    return { origem: map[src] || 'outro', campanha, termo, gclid: null };
  }
  const ref = document.referrer || '';
  if (ref && !ref.includes(window.location.hostname)) {
    if (/google\./.test(ref)) return { origem: 'google_organico', campanha: null, termo: null, gclid: null };
    if (/facebook\.|fb\./.test(ref)) return { origem: 'facebook', campanha: null, termo: null, gclid: null };
    if (/instagram\./.test(ref)) return { origem: 'instagram', campanha: null, termo: null, gclid: null };
    if (/tiktok\./.test(ref)) return { origem: 'tiktok', campanha: null, termo: null, gclid: null };
    return { origem: 'outro', campanha: null, termo: null, gclid: null };
  }
  return null; // sem informação nova
}

// Origem guardada (primeiro contato pago vence; vale 30 dias)
export function getOrigem() {
  try {
    const raw = safeGet(localStorage, KEY_ORIGEM);
    if (!raw) return { origem: 'direto' };
    const o = JSON.parse(raw);
    if (Date.now() - o.ts > VALIDADE_DIAS * 864e5) return { origem: 'direto' };
    return o;
  } catch { return { origem: 'direto' }; }
}

function getSessao() {
  let s = safeGet(sessionStorage, KEY_SESSAO);
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    safeSet(sessionStorage, KEY_SESSAO, s);
  }
  return s;
}

export function track(tipo) {
  const o = getOrigem();
  const body = JSON.stringify({
    tipo,
    origem: o.origem,
    campanha: o.campanha || null,
    termo: o.termo || null,
    gclid: o.gclid || null,
    pagina: window.location.pathname,
    sessao: getSessao(),
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch { /* medição nunca pode quebrar o site */ }
}

let iniciado = false;

// Chamar uma vez na página inicial
export function initTracking() {
  if (iniciado) return;
  iniciado = true;

  const nova = detectarOrigem();
  if (nova) {
    const atual = getOrigem();
    // não troca uma origem "google" por uma visita orgânica posterior
    if (!(atual.origem === 'google' && nova.origem !== 'google')) {
      safeSet(localStorage, KEY_ORIGEM, JSON.stringify({ ...nova, ts: Date.now() }));
    }
  }

  if (!safeGet(sessionStorage, 'ef_visita_ok')) {
    safeSet(sessionStorage, 'ef_visita_ok', '1');
    track('visita');
  }

  // Conta cliques em qualquer botão de WhatsApp da Sandra ou de telefone
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('tel:')) track('telefone');
    else if (/wa\.me\/|api\.whatsapp\.com/.test(href) && href.includes(WA_NUMBER)) track('whatsapp');
  }, true);
}
