// =============================================
// Analista de IA da campanha (Oracle OCI Generative AI)
// Mesma conta, mesmas variáveis OCI_* e mesmo modelo do VinaCare/Omni.
// Os NÚMEROS são montados aqui no código (nunca pela IA); a IA só escreve o comentário.
// Se a Oracle falhar, a mensagem vai só com os números.
// =============================================

const MODELO = process.env.OCI_MODELO || 'cohere.command-a-03-2025';
const FUSO = 'America/Sao_Paulo';

// ---------- datas no fuso de São Paulo ----------
function agoraSP() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false,
    }).formatToParts(new Date()).map(x => [x.type, x.value])
  );
  return { data: `${p.year}-${p.month}-${p.day}`, hora: parseInt(p.hour, 10) % 24 };
}
const dataBR = (iso) => iso.split('-').reverse().join('/');
const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ---------- Oracle (importa o SDK só no primeiro uso, igual ao VinaCare) ----------
let clienteOCI = null;

function chavePrivada(env) {
  if (env.OCI_KEY_CONTENT) return env.OCI_KEY_CONTENT.replace(/\\n/g, '\n');
  if (env.OCI_KEY_B64) return Buffer.from(env.OCI_KEY_B64, 'base64').toString('utf-8');
  return '';
}

export function ociConfigurado(env = process.env) {
  return Boolean(env.OCI_USER && env.OCI_FINGERPRINT && env.OCI_TENANCY && env.OCI_REGION && env.OCI_COMPARTMENT_ID && chavePrivada(env));
}

async function perguntarOracle(prompt) {
  if (!ociConfigurado()) throw new Error('OCI não configurado');
  if (!clienteOCI) {
    const commonMod = await import('oci-common');
    const genaiMod = await import('oci-generativeaiinference');
    const common = commonMod.default || commonMod;
    const genai = genaiMod.default || genaiMod;
    const regiao = common.Region.fromRegionId(process.env.OCI_REGION);
    const provider = new common.SimpleAuthenticationDetailsProvider(
      process.env.OCI_TENANCY, process.env.OCI_USER, process.env.OCI_FINGERPRINT,
      chavePrivada(process.env), null, regiao
    );
    clienteOCI = new genai.GenerativeAiInferenceClient({ authenticationDetailsProvider: provider });
    clienteOCI.region = regiao;
  }
  const resp = await clienteOCI.chat({
    chatDetails: {
      compartmentId: process.env.OCI_COMPARTMENT_ID,
      servingMode: { servingType: 'ON_DEMAND', modelId: MODELO },
      chatRequest: { apiFormat: 'COHERE', message: prompt, maxTokens: 300, temperature: 0.3 },
    },
  });
  return (resp?.chatResult?.chatResponse?.text || '').trim();
}

// ---------- números ----------
const CANAIS = [
  { id: 'google', nome: 'Google Ads', curto: 'Google' },
  { id: 'facebook', nome: 'Facebook', curto: 'Facebook' },
];

async function numerosDeOntem(pool, canal) {
  const r = await pool.query(`
    SELECT tipo, COUNT(*)::int AS total FROM site_eventos
     WHERE origem = $1
       AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE '${FUSO}')::date = (NOW() AT TIME ZONE '${FUSO}')::date - 1
     GROUP BY tipo`, [canal]);
  const t = Object.fromEntries(r.rows.map(x => [x.tipo, x.total]));
  return {
    visitas: t.visita || 0,
    whatsapp: t.whatsapp || 0,
    telefone: t.telefone || 0,
    orcamento: t.orcamento || 0,
    contatos: (t.whatsapp || 0) + (t.telefone || 0) + (t.orcamento || 0),
  };
}

const ativo = (c) => c.m.visitas > 0 || c.m.contatos > 0 || c.m.investido > 0 || c.ontem.visitas > 0;

function blocoCanal({ info, ontem, m }) {
  const linhas = [
    `*${info.nome}*`,
    `Ontem: ${ontem.visitas} visita(s) · ${ontem.contatos} contato(s)` +
      (ontem.contatos ? ` (${ontem.whatsapp} WhatsApp, ${ontem.telefone} ligação, ${ontem.orcamento} orçamento)` : ''),
    `Últimos ${m.dias} dias:`,
    `• Visitas: ${m.visitas}`,
    `• Contatos: ${m.contatos}` + (m.taxa_contato !== null ? ` (${String(m.taxa_contato).replace('.', ',')}% das visitas)` : ''),
    `• Pacientes: ${m.pacientes}`,
    `• Investido: ${brl(m.investido)}` + (m.custo_por_contato !== null ? ` · ${brl(m.custo_por_contato)} por contato` : ''),
    `• Recebido: ${brl(m.recebido)}` + (m.retorno !== null && m.recebido ? ` · retorno ${String(m.retorno).replace('.', ',')}x` : ''),
  ];
  if (m.termos?.length && info.id === 'google') linhas.push(`• Palavras que mais trouxeram visitas: ${m.termos.map(t => t.termo).join(', ')}`);
  return linhas.join('\n');
}

function textoNumeros(hoje, canais) {
  const mostrar = canais.filter(ativo);
  const partes = [`📊 *Enfermeira Feridas — Anúncios* (${dataBR(hoje)})`, ''];
  canais.forEach((c, i) => {
    if (i) partes.push('');
    partes.push(ativo(c) ? blocoCanal(c) : `*${c.info.nome}*\nAinda sem visitas nem investimento lançado nos últimos 30 dias.`);
  });
  if (mostrar.length > 1) {
    const inv = mostrar.reduce((s, c) => s + Number(c.m.investido || 0), 0);
    const cont = mostrar.reduce((s, c) => s + c.m.contatos, 0);
    partes.push('', `*Total:* ${brl(inv)} investido · ${cont} contato(s)` + (cont && inv ? ` · ${brl(inv / cont)} por contato` : ''));
  }
  return partes.join('\n');
}

function promptAnalista(canais) {
  const dados = canais.filter(ativo).map(({ info, ontem, m }) => ({
    canal: info.nome, ontem,
    periodo_dias: m.dias, visitas: m.visitas, contatos: m.contatos, whatsapp: m.cliques_whatsapp, ligacoes: m.cliques_telefone,
    orcamentos: m.orcamentos, pacientes: m.pacientes, investido_reais: m.investido, recebido_reais: m.recebido,
    custo_por_contato: m.custo_por_contato, retorno: m.retorno,
    palavras: info.id === 'google' ? (m.termos?.map(t => t.termo) || []) : undefined,
  }));
  return [
    'Você é um analista de marketing que ajuda uma enfermeira autônoma de São Paulo que faz curativos em domicílio.',
    'Ela está testando anúncios pequenos (Google Ads e/ou Facebook). Abaixo estão os números REAIS por canal. Não invente nenhum número novo e não repita a lista inteira.',
    'Escreva em português do Brasil, para ler no WhatsApp: no máximo 3 frases curtas e simples, sem jargão.',
    '1) diga em uma frase como está indo; 2) se houver mais de um canal, diga qual está trazendo contato mais barato; 3) dê UMA sugestão prática para os próximos dias.',
    'Se ainda há poucos dados (menos de 20 visitas num canal), diga que ainda é cedo para concluir sobre ele. Não fale de diagnóstico nem de saúde de pacientes.',
    'Responda só com o texto, sem título e sem emojis no começo.',
    '',
    JSON.stringify(dados),
  ].join('\n');
}

export async function montarResumo(pool, resumoMarketing) {
  const { data } = agoraSP();
  const canais = await Promise.all(CANAIS.map(async (info) => {
    const [ontem, m] = await Promise.all([numerosDeOntem(pool, info.id), resumoMarketing(30, info.id)]);
    return { info, ontem, m };
  }));
  let texto = textoNumeros(data, canais);
  let ia = 'sem-ia';
  const temAtividade = canais.some(ativo);
  if (temAtividade && ociConfigurado()) {
    try {
      const comentario = await perguntarOracle(promptAnalista(canais));
      if (comentario) {
        texto += `\n\n🤖 *Análise:* ${comentario.slice(0, 700)}`;
        ia = 'ok';
      }
    } catch (err) {
      console.warn('Analista: Oracle falhou, enviando só os números:', err.message);
      ia = 'erro';
    }
  }
  return { texto, ia, data, temAtividade };
}

// ---------- WhatsApp (WAHA ou Z-API, configurado no .env) ----------
export function destinatarios(env = process.env) {
  return (env.RESUMO_WHATSAPP || '')
    .split(',').map(n => n.replace(/\D/g, '')).filter(n => n.length >= 12);
}

async function enviarWhatsApp(numero, texto) {
  const prov = (process.env.WHATSAPP_PROVIDER || 'waha').toLowerCase();
  let url, body, headers = { 'Content-Type': 'application/json' };
  if (prov === 'zapi') {
    if (!process.env.ZAPI_INSTANCE || !process.env.ZAPI_TOKEN) throw new Error('Z-API não configurada');
    url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`;
    if (process.env.ZAPI_CLIENT_TOKEN) headers['Client-Token'] = process.env.ZAPI_CLIENT_TOKEN;
    body = { phone: numero, message: texto };
  } else {
    if (!process.env.WAHA_URL) throw new Error('WAHA_URL não configurado');
    url = `${process.env.WAHA_URL.replace(/\/$/, '')}/api/sendText`;
    if (process.env.WAHA_API_KEY) headers['X-Api-Key'] = process.env.WAHA_API_KEY;
    body = { session: process.env.WAHA_SESSION || 'default', chatId: `${numero}@c.us`, text: texto };
  }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`WhatsApp respondeu ${res.status}`);
}

export async function enviarResumo(pool, resumoMarketing, { forcar = false } = {}) {
  const nums = destinatarios();
  if (!nums.length) throw new Error('Nenhum número em RESUMO_WHATSAPP');
  const r = await montarResumo(pool, resumoMarketing);
  if (!forcar && !r.temAtividade) return { ...r, enviados: [], pulado: 'sem atividade nos últimos 30 dias' };
  const enviados = [], falhas = [];
  for (const n of nums) {
    try { await enviarWhatsApp(n, r.texto); enviados.push(n.slice(-4)); }
    catch (err) { falhas.push(`${n.slice(-4)}: ${err.message}`); }
  }
  if (!enviados.length && !forcar) return { ...r, enviados, falhas }; // tenta de novo daqui a 10 min
  await pool.query(
    `INSERT INTO marketing_resumos (data, texto, enviados, falhas) VALUES ($1,$2,$3,$4)
     ON CONFLICT (data) DO UPDATE SET texto = EXCLUDED.texto, enviados = EXCLUDED.enviados, falhas = EXCLUDED.falhas, enviado_em = NOW()`,
    [r.data, r.texto, enviados.join(','), falhas.join(' | ') || null]
  );
  return { ...r, enviados, falhas };
}

// ---------- agendamento diário ----------
export async function iniciarAnalista(pool, resumoMarketing) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS marketing_resumos (
      data DATE PRIMARY KEY,
      texto TEXT,
      enviados VARCHAR(255),
      falhas TEXT,
      enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  if (process.env.RESUMO_ATIVO !== '1') {
    console.log('Analista: envio automático desligado (RESUMO_ATIVO diferente de 1).');
    return;
  }
  const hora = parseInt(process.env.RESUMO_HORA || '8', 10);
  console.log(`Analista: resumo diário às ${hora}h para ${destinatarios().length} número(s). IA Oracle: ${ociConfigurado() ? 'configurada' : 'não configurada'}.`);

  let rodando = false;
  const verificar = async () => {
    if (rodando) return;
    rodando = true;
    try {
      const { data, hora: h } = agoraSP();
      if (h < hora || h > hora + 3) return; // janela das 8h às 11h, caso o servidor reinicie
      const ja = await pool.query('SELECT 1 FROM marketing_resumos WHERE data = $1', [data]);
      if (ja.rowCount) return;
      const r = await enviarResumo(pool, resumoMarketing);
      if (r.pulado) {
        await pool.query('INSERT INTO marketing_resumos (data, texto) VALUES ($1,$2) ON CONFLICT DO NOTHING', [data, `pulado: ${r.pulado}`]);
      }
      console.log('Analista: resumo do dia', data, r.pulado ? `(pulado: ${r.pulado})` : `enviado para ${r.enviados.join(', ') || 'ninguém'}`);
    } catch (err) {
      console.error('Analista: erro no envio diário:', err.message);
    } finally {
      rodando = false;
    }
  };
  setInterval(verificar, 10 * 60 * 1000).unref();
  setTimeout(verificar, 30 * 1000).unref();
}
