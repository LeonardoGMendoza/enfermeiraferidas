import { useState, useEffect, useCallback, useMemo, useRef, useContext, createContext } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import {
  BarChart3, MousePointerClick, MessageCircle, Percent, UserCheck, Wallet, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, Table2, RefreshCw, Moon, Sun, Maximize2, Minimize2, Target, Pencil,
} from 'lucide-react';
import { authFetch } from '../api';
import './Relatorios.css';

// ---------- paleta (validada: categórica 5 cores + rampa sequencial azul) ----------
const SERIE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];
const OUTROS = '#a3a29c';
const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'];
const FUNIL = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#0d366b'];

// tema escuro: mesmas 5 cores, nos tons validados para o fundo azul-marinho #111a2e
// (validador: contraste >= 3:1, daltonismo ΔE 8,4, visão normal ΔE 19,3 — tudo passa)
const TEMAS = {
  claro: {
    serie: SERIE, outros: OUTROS, seq: SEQ, funil: FUNIL.slice(1),
    bom: '#0ca30c', celulaVazia: '#f4f4f1', grade: '#ecebe7', eixo: '#6b6a65', cursor: '#b9b8b2', superficie: '#ffffff', trilho: '#f4f4f1',
  },
  escuro: {
    serie: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181'], outros: '#8a8f99',
    seq: ['#184f95', '#1c5cab', '#256abf', '#3987e5', '#5598e7', '#86b6ef', '#cde2fb'],
    funil: ['#86b6ef', '#5598e7', '#3987e5', '#256abf'],
    bom: '#2fc22f', celulaVazia: '#1a2540', grade: 'rgba(148,170,220,0.10)', eixo: '#9aa3b5', cursor: '#4a5878', superficie: '#111a2e', trilho: '#1a2540',
  },
};
const TemaCtx = createContext(TEMAS.claro);

// cada origem tem cor FIXA (a cor segue a origem, não a posição)
const ORIGEM = {
  google: { label: 'Google Ads', slot: 0, ordem: 0 },
  direto: { label: 'Direto', slot: 1, ordem: 1 },
  google_organico: { label: 'Google (busca)', slot: 2, ordem: 2 },
  indicacao: { label: 'Indicação', slot: 3, ordem: 3 },
  facebook: { label: 'Facebook', slot: 4, ordem: 4 },
};
const NOMES_OUTROS = {
  instagram: 'Instagram', tiktok: 'TikTok', site: 'Site', whatsapp: 'WhatsApp', outro: 'Outro', nao_informado: 'Não informado',
};

const PERIODOS = [7, 30, 90];
// canais com botão no filtro (o investimento de cada um é lançado no Dashboard)
const CANAIS = [
  { id: 'google', nome: 'Google Ads' },
  { id: 'facebook', nome: 'Facebook' },
  { id: 'instagram', nome: 'Instagram' },
  { id: 'tiktok', nome: 'TikTok' },
  { id: 'whatsapp', nome: 'WhatsApp' },
];
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const brl = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
const num = (v) => Number(v || 0).toLocaleString('pt-BR');
const pct = (v) => `${Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const diaCurto = (iso) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };

function derivados(t) {
  return {
    ...t,
    taxa: t.visitas ? (t.contatos / t.visitas) * 100 : null,
    custo_contato: t.investido && t.contatos ? t.investido / t.contatos : null,
    retorno: t.investido ? t.recebido / t.investido : null,
  };
}

function agruparOrigens(linhas, tema = TEMAS.claro) {
  const fixas = [], outros = { nome: 'Outros', total: 0, cor: tema.outros, detalhe: [] };
  for (const r of linhas || []) {
    const o = ORIGEM[r.origem];
    if (o) fixas.push({ nome: o.label, total: r.total, cor: tema.serie[o.slot], ordem: o.ordem });
    else { outros.total += r.total; outros.detalhe.push(NOMES_OUTROS[r.origem] || r.origem); }
  }
  fixas.sort((a, b) => a.ordem - b.ordem);
  if (outros.total) fixas.push(outros);
  const soma = fixas.reduce((s, x) => s + x.total, 0);
  return fixas.map(x => ({ ...x, pct: soma ? (x.total / soma) * 100 : 0 }));
}

// ---------- peças ----------
function Variacao({ atual, anterior, melhorMenor = false }) {
  if (atual === null || anterior === null || anterior === undefined) return <span className="bi-var neutro"><Minus size={12} /> sem base</span>;
  if (!anterior) return atual ? <span className="bi-var neutro">novo no período</span> : <span className="bi-var neutro"><Minus size={12} /> estável</span>;
  const d = ((atual - anterior) / anterior) * 100;
  if (Math.abs(d) < 0.5) return <span className="bi-var neutro"><Minus size={12} /> estável</span>;
  const subiu = d > 0;
  const bom = melhorMenor ? !subiu : subiu;
  const Icone = subiu ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`bi-var ${bom ? 'bom' : 'ruim'}`}>
      <Icone size={13} /> {subiu ? '+' : ''}{pct(d)} <span className="bi-var-ref">vs período anterior</span>
    </span>
  );
}

function Sparkline({ dados, chave, cor }) {
  if (!dados?.some(d => d[chave])) return null; // sem movimento: não desenha linha reta no zero
  return (
    <div className="bi-spark" aria-hidden="true">
      <ResponsiveContainer width="100%" height={34}>
        <LineChart data={dados} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey={chave} stroke={cor} strokeWidth={2} dot={false} isAnimationActive animationBegin={0} animationDuration={1100} animationEasing="ease-out" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Kpi({ icone: Icone, titulo, valor, ajuda, children, spark }) {
  return (
    <div className="bi-kpi">
      <div className="bi-kpi-top"><Icone size={15} /> {titulo}</div>
      <div className="bi-kpi-valor">{valor}</div>
      <div className="bi-kpi-rodape">{children}</div>
      {ajuda && <div className="bi-kpi-ajuda">{ajuda}</div>}
      {spark}
    </div>
  );
}

function Vazio({ texto = 'Sem dados neste período' }) {
  return <div className="bi-vazio">{texto}</div>;
}

function TooltipLinha({ active, payload, label }) {
  const SERIE_TOOLTIP = useContext(TemaCtx).serie;
  if (!active || !payload?.length) return null;
  return (
    <div className="bi-tooltip">
      <div className="bi-tooltip-titulo">{diaCurto(label)}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="bi-tooltip-linha">
          <span className="bi-chip" style={{ background: p.dataKey === 'contatos' ? SERIE_TOOLTIP[1] : SERIE_TOOLTIP[0] }} /> {p.name}: <strong>{num(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function TooltipPizza({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bi-tooltip">
      <div className="bi-tooltip-linha">
        <span className="bi-chip" style={{ background: p.cor }} /> {p.nome}: <strong>{num(p.total)}</strong> ({pct(p.pct)})
      </div>
      {p.detalhe?.length > 0 && <div className="bi-tooltip-sub">{p.detalhe.join(', ')}</div>}
    </div>
  );
}

function Rosca({ titulo, dados, unidade }) {
  const tema = useContext(TemaCtx);
  const total = dados.reduce((s, d) => s + d.total, 0);
  return (
    <div className="bi-card">
      <div className="bi-card-titulo">{titulo}</div>
      {!total ? <Vazio /> : (
        <div className="bi-rosca">
          <div className="bi-rosca-grafico">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={dados} dataKey="total" nameKey="nome" innerRadius="62%" outerRadius="92%"
                     startAngle={90} endAngle={-270} stroke={tema.superficie} strokeWidth={dados.length > 1 ? 2 : 0} isAnimationActive animationBegin={0} animationDuration={1100} animationEasing="ease-out">
                  {dados.map(d => <Cell key={d.nome} fill={d.cor} />)}
                </Pie>
                <Tooltip content={<TooltipPizza />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="bi-rosca-centro">
              <strong>{num(total)}</strong>
              <span>{unidade}</span>
            </div>
          </div>
          <ul className="bi-legenda">
            {dados.map(d => (
              <li key={d.nome}>
                <span className="bi-chip" style={{ background: d.cor }} />
                <span className="bi-legenda-nome">{d.nome}</span>
                <span className="bi-legenda-valor">{num(d.total)} · {pct(d.pct)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Funil({ t }) {
  const tema = useContext(TemaCtx);
  const etapas = [
    { nome: 'Visitas no site', valor: t.visitas },
    { nome: 'Contatos', valor: t.contatos },
    { nome: 'Pacientes cadastrados', valor: t.pacientes },
    { nome: 'Pagamentos confirmados', valor: t.pagos },
  ];
  const max = Math.max(...etapas.map(e => e.valor), 1);
  return (
    <div className="bi-card">
      <div className="bi-card-titulo">Funil: da visita ao pagamento</div>
      {!t.visitas && !t.contatos && !t.pacientes ? <Vazio /> : (
        <div className="bi-funil">
          {etapas.map((e, i) => {
            const conv = i > 0 && etapas[i - 1].valor ? (e.valor / etapas[i - 1].valor) * 100 : null;
            return (
              <div key={e.nome} className="bi-funil-etapa">
                <div className="bi-funil-rotulo">
                  <span>{e.nome}</span>
                  <strong>{num(e.valor)}</strong>
                </div>
                <div className="bi-funil-trilho">
                  <div className="bi-funil-barra" style={{ width: `${Math.max((e.valor / max) * 100, e.valor ? 2 : 0)}%`, background: tema.funil[i] }}
                       title={`${e.nome}: ${num(e.valor)}`} />
                </div>
                {conv !== null && <div className="bi-funil-conv">{pct(conv)} da etapa anterior</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Contatos({ t }) {
  const tema = useContext(TemaCtx);
  const itens = [
    { nome: 'WhatsApp', valor: t.whatsapp },
    { nome: 'Ligação', valor: t.telefone },
    { nome: 'Orçamento no site', valor: t.orcamentos },
  ];
  const max = Math.max(...itens.map(i => i.valor), 1);
  return (
    <div className="bi-card">
      <div className="bi-card-titulo">Como as pessoas entraram em contato</div>
      {!t.contatos ? <Vazio /> : (
        <div className="bi-barras">
          {itens.map(i => (
            <div key={i.nome} className="bi-barra-linha" title={`${i.nome}: ${num(i.valor)}`}>
              <span className="bi-barra-nome">{i.nome}</span>
              <div className="bi-barra-trilho">
                {i.valor > 0 && <div className="bi-barra" style={{ width: `${(i.valor / max) * 100}%`, background: tema.serie[0] }} />}
              </div>
              <strong className="bi-barra-valor">{num(i.valor)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MapaCalor({ linhas }) {
  const tema = useContext(TemaCtx);
  const SEQ = tema.seq;
  const mapa = useMemo(() => {
    const m = {};
    for (const r of linhas || []) m[`${r.dow}-${r.hora}`] = r.total;
    return m;
  }, [linhas]);
  const max = Math.max(0, ...Object.values(mapa));
  const [foco, setFoco] = useState(null);
  const horas = Array.from({ length: 24 }, (_, h) => h);
  const cor = (v) => (!v ? tema.celulaVazia : SEQ[Math.min(SEQ.length - 1, Math.floor((v / max) * (SEQ.length - 1) + 0.0001))]);
  return (
    <div className="bi-card bi-card-largo">
      <div className="bi-card-titulo">
        Quando as pessoas procuram
        <span className="bi-card-sub">{foco ? `${DIAS_SEMANA[foco.d - 1]} às ${foco.h}h: ${num(foco.v)} evento(s)` : 'passe o mouse nos quadrados'}</span>
      </div>
      {!max ? <Vazio /> : (
        <div className="bi-calor" onMouseLeave={() => setFoco(null)}>
          <div className="bi-calor-grade">
            <span />
            {horas.map(h => <span key={h} className="bi-calor-hora">{h % 3 === 0 ? `${h}h` : ''}</span>)}
            {DIAS_SEMANA.map((nome, di) => (
              <div key={nome} className="bi-calor-linha">
                <span className="bi-calor-dia">{nome}</span>
                {horas.map(h => {
                  const v = mapa[`${di + 1}-${h}`] || 0;
                  return (
                    <span key={h} className="bi-calor-celula" style={{ background: cor(v) }}
                          onMouseEnter={() => setFoco({ d: di + 1, h, v })}
                          aria-label={`${nome} ${h}h: ${v}`} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="bi-calor-escala">
            <span>menos</span>
            {SEQ.map(c => <span key={c} className="bi-calor-amostra" style={{ background: c }} />)}
            <span>mais</span>
          </div>
        </div>
      )}
    </div>
  );
}

// medidor tipo velocímetro: contatos do período contra a meta
function Medidor({ valor }) {
  const tema = useContext(TemaCtx);
  const [meta, setMeta] = useState(() => {
    try { return parseInt(localStorage.getItem('ef_meta_contatos'), 10) || 10; } catch { return 10; }
  });
  const [editando, setEditando] = useState(false);
  const salvarMeta = (v) => {
    const n = Math.max(1, parseInt(v, 10) || 1);
    setMeta(n);
    try { localStorage.setItem('ef_meta_contatos', String(n)); } catch { /* navegador sem armazenamento */ }
  };
  const feito = Math.min(valor, meta);
  const pctMeta = meta ? Math.round((valor / meta) * 100) : 0;
  const fatias = [{ nome: 'feito', v: feito }, { nome: 'falta', v: Math.max(meta - feito, 0) }];
  return (
    <div className="bi-card bi-medidor">
      <div className="bi-card-titulo">
        <span><Target size={14} /> Meta de contatos</span>
        <button type="button" className="bi-meta-editar" onClick={() => setEditando(e => !e)} title="Mudar a meta">
          <Pencil size={12} /> meta {meta}
        </button>
      </div>
      {editando && (
        <input className="bi-meta-input" type="number" min="1" defaultValue={meta} autoFocus
               onBlur={(e) => { salvarMeta(e.target.value); setEditando(false); }}
               onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
      )}
      <div className="bi-medidor-grafico">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={fatias} dataKey="v" startAngle={180} endAngle={0} cx="50%" cy="88%"
                 innerRadius={84} outerRadius={108} stroke="none" isAnimationActive animationBegin={0} animationDuration={1100} animationEasing="ease-out" cornerRadius={4}>
              <Cell fill={valor >= meta ? tema.bom : tema.serie[0]} />
              <Cell fill={tema.trilho} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="bi-medidor-centro">
          <strong>{num(valor)}<span>/{num(meta)}</span></strong>
          <em className={valor >= meta ? 'bi-meta-batida' : ''}>{valor >= meta ? '✔ Meta batida!' : `${pctMeta}% da meta`}</em>
        </div>
      </div>
    </div>
  );
}

// ---------- página ----------
export default function Relatorios() {
  const [dias, setDias] = useState(30);
  const [canal, setCanal] = useState('google');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tabela, setTabela] = useState(false);
  const [escuro, setEscuro] = useState(() => {
    try { return localStorage.getItem('ef_bi_tema') !== 'claro'; } catch { return true; }
  });
  const [telaCheia, setTelaCheia] = useState(false);
  const raiz = useRef(null);
  const tema = escuro ? TEMAS.escuro : TEMAS.claro;

  const trocarTema = () => {
    setEscuro(e => {
      try { localStorage.setItem('ef_bi_tema', e ? 'claro' : 'escuro'); } catch { /* sem armazenamento */ }
      return !e;
    });
  };
  const alternarTelaCheia = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else raiz.current?.requestFullscreen?.();
  };
  useEffect(() => {
    const aoMudar = () => setTelaCheia(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await authFetch(`/api/marketing/bi?dias=${dias}&canal=${canal}`);
      if (!res.ok) throw new Error();
      setDados(await res.json());
      setErro(false);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, [dias, canal]);

  useEffect(() => { carregar(); }, [carregar]);
  // painel vivo: a cada INTERVALO_SEG segundos busca os números de novo e as barras sobem outra vez
  const INTERVALO_SEG = 10;
  const [rodada, setRodada] = useState(0);
  const [faltam, setFaltam] = useState(INTERVALO_SEG);
  useEffect(() => {
    const id = setInterval(() => {
      setFaltam(f => {
        if (f > 1) return f - 1;
        if (!document.hidden) { carregar(); setRodada(r => r + 1); }
        return INTERVALO_SEG;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [carregar]);

  const a = dados ? derivados(dados.atual) : null;
  const b = dados ? derivados(dados.anterior) : null;
  const origensVisitas = useMemo(() => agruparOrigens(dados?.origens_visitas, tema), [dados, tema]);
  const origensPacientes = useMemo(() => agruparOrigens(dados?.origens_pacientes, tema), [dados, tema]);
  const nomeCanal = canal === 'todos' ? 'todas as origens' : (CANAIS.find(c => c.id === canal)?.nome || 'Google Ads');
  const temSerie = dados?.serie?.some(d => d.visitas || d.contatos);
  // o Facebook manda o código do conjunto de anúncios no lugar da palavra: não é palavra pesquisada
  const termosLimpos = (dados?.termos || []).filter(t => t.termo && !/^\d{6,}$/.test(String(t.termo).trim()));

  const SERIE = tema.serie;

  return (
    <TemaCtx.Provider value={tema}>
    <div ref={raiz} className={`bi animate-fadeIn ${escuro ? 'bi-escuro' : ''}`}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">
            <span className="bi-aovivo"><span className="bi-aovivo-ponto" /> AO VIVO</span>
            Marketing e resultados — {nomeCanal}, últimos {dias} dias · atualiza em {faltam}s
          </p>
        </div>
      </div>

      {/* filtros: uma linha acima de todos os gráficos */}
      <div className="bi-filtros">
        <div className="bi-segmento" role="group" aria-label="Período">
          {PERIODOS.map(p => (
            <button key={p} className={dias === p ? 'ativo' : ''} onClick={() => setDias(p)}>{p} dias</button>
          ))}
        </div>
        <div className="bi-segmento" role="group" aria-label="Origem">
          {CANAIS.map(c => (
            <button key={c.id} className={canal === c.id ? 'ativo' : ''} onClick={() => setCanal(c.id)}>{c.nome}</button>
          ))}
          <button className={canal === 'todos' ? 'ativo' : ''} onClick={() => setCanal('todos')}>Todas as origens</button>
        </div>
        <div className="bi-filtros-fim">
          <button className="btn btn-ghost btn-sm" onClick={() => setTabela(t => !t)}>
            <Table2 size={14} /> {tabela ? 'Ver gráficos' : 'Ver tabela'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={trocarTema} title={escuro ? 'Modo claro' : 'Modo escuro'}>
            {escuro ? <Sun size={14} /> : <Moon size={14} />} {escuro ? 'Claro' : 'Escuro'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={alternarTelaCheia} title="Tela cheia">
            {telaCheia ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={carregar} disabled={carregando} title="Atualizar">
            <RefreshCw size={14} className={carregando ? 'bi-girando' : ''} />
          </button>
        </div>
      </div>

      {erro && <div className="bi-erro">Não foi possível carregar o relatório agora.</div>}

      {a && (
        <div key={rodada} className="bi-conteudo">
          <div className="bi-kpis">
            <Kpi icone={MousePointerClick} titulo="Visitas" valor={num(a.visitas)}
                 spark={<Sparkline dados={dados.serie} chave="visitas" cor={SERIE[0]} />}>
              <Variacao atual={a.visitas} anterior={b.visitas} />
            </Kpi>
            <Kpi icone={MessageCircle} titulo="Contatos" valor={num(a.contatos)}
                 spark={<Sparkline dados={dados.serie} chave="contatos" cor={SERIE[1]} />}>
              <Variacao atual={a.contatos} anterior={b.contatos} />
            </Kpi>
            <Kpi icone={Percent} titulo="Taxa de contato" valor={a.taxa === null ? '—' : pct(a.taxa)} ajuda="contatos ÷ visitas">
              <Variacao atual={a.taxa} anterior={b.taxa} />
            </Kpi>
            <Kpi icone={UserCheck} titulo="Pacientes" valor={num(a.pacientes)} ajuda={`${num(a.pagos)} com pagamento confirmado`}>
              <Variacao atual={a.pacientes} anterior={b.pacientes} />
            </Kpi>
            <Kpi icone={Wallet} titulo="Custo por contato" valor={brl(a.custo_contato)} ajuda={`investido ${brl(a.investido)}`}>
              <Variacao atual={a.custo_contato} anterior={b.custo_contato} melhorMenor />
            </Kpi>
            <Kpi icone={TrendingUp} titulo="Retorno" valor={a.retorno === null ? '—' : `${a.retorno.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x`}
                 ajuda={`recebido ${brl(a.recebido)}`}>
              <Variacao atual={a.retorno} anterior={b.retorno} />
            </Kpi>
          </div>

          {tabela ? (
            <div className="bi-card">
              <div className="bi-card-titulo">Dados por dia</div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Dia</th><th>Visitas</th><th>Contatos</th><th>Taxa</th></tr></thead>
                  <tbody>
                    {[...dados.serie].reverse().map(d => (
                      <tr key={d.dia}>
                        <td>{diaCurto(d.dia)}</td><td>{num(d.visitas)}</td><td>{num(d.contatos)}</td>
                        <td>{d.visitas ? pct((d.contatos / d.visitas) * 100) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              <div className="bi-linha bi-linha-2-1">
                <div className="bi-card">
                  <div className="bi-card-titulo">
                    Visitas e contatos por dia
                    <span className="bi-legenda-inline">
                      <span><span className="bi-chip" style={{ background: SERIE[0] }} /> Visitas</span>
                      <span><span className="bi-chip" style={{ background: SERIE[1] }} /> Contatos</span>
                    </span>
                  </div>
                  {!temSerie ? <Vazio /> : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={dados.serie} margin={{ top: 10, right: 16, bottom: 0, left: -18 }} barGap={3} barCategoryGap="22%">
                        <defs>
                          <linearGradient id="biGradVisitas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={escuro ? '#86b6ef' : SERIE[0]} />
                            <stop offset="100%" stopColor={SERIE[0]} />
                          </linearGradient>
                          <linearGradient id="biGradContatos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={escuro ? '#f08a5d' : SERIE[1]} />
                            <stop offset="100%" stopColor={SERIE[1]} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={tema.grade} vertical={false} />
                        <XAxis dataKey="dia" tickFormatter={diaCurto} tick={{ fill: tema.eixo, fontSize: 11 }} axisLine={false} tickLine={false}
                               minTickGap={16} />
                        <YAxis allowDecimals={false} tick={{ fill: tema.eixo, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<TooltipLinha />} cursor={{ fill: escuro ? 'rgba(134,182,239,0.08)' : 'rgba(15,23,42,0.05)' }} />
                        <Bar dataKey="visitas" name="Visitas" fill="url(#biGradVisitas)" radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive animationBegin={0} animationDuration={1100} animationEasing="ease-out" />
                        <Bar dataKey="contatos" name="Contatos" fill="url(#biGradContatos)" radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive animationBegin={0} animationDuration={1100} animationEasing="ease-out" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <Funil t={a} />
              </div>

              <div className="bi-linha bi-linha-4">
                <Medidor valor={a.contatos} />
                <Rosca titulo="De onde vêm as visitas" dados={origensVisitas} unidade="visitas" />
                <Rosca titulo="Origem dos pacientes" dados={origensPacientes} unidade="pacientes" />
                <Contatos t={a} />
              </div>

              <div className="bi-linha bi-linha-2-1">
                <MapaCalor linhas={dados.calor} />
                <div className="bi-card">
                  <div className="bi-card-titulo">Palavras do anúncio</div>
                  {!termosLimpos.length ? <Vazio texto={canal !== 'google' && canal !== 'todos' ? `O ${nomeCanal} não informa palavras pesquisadas — só o Google Ads` : 'Aparece quando o anúncio enviar as palavras pesquisadas'} /> : (
                    <table className="bi-termos">
                      <thead><tr><th>Palavra</th><th>Visitas</th><th>Contatos</th></tr></thead>
                      <tbody>
                        {termosLimpos.map(t => (
                          <tr key={t.termo}><td>{t.termo}</td><td>{num(t.visitas)}</td><td>{num(t.contatos)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
          <p className="bi-nota">
            <BarChart3 size={12} /> Visitas e cliques são medidos no site. Ligações feitas direto pelo botão do anúncio aparecem só no Google Ads.
            A origem dos pacientes vem da coluna "Origem" em Pacientes.
          </p>
        </div>
      )}
    </div>
    </TemaCtx.Provider>
  );
}
