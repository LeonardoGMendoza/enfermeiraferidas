import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import {
  BarChart3, MousePointerClick, MessageCircle, Percent, UserCheck, Wallet, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, Table2, RefreshCw,
} from 'lucide-react';
import { authFetch } from '../api';
import './Relatorios.css';

// ---------- paleta (validada: categórica 5 cores + rampa sequencial azul) ----------
const SERIE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];
const OUTROS = '#a3a29c';
const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'];
const FUNIL = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#0d366b'];

// cada origem tem cor FIXA (a cor segue a origem, não a posição)
const ORIGEM = {
  google: { label: 'Google Ads', cor: SERIE[0], ordem: 0 },
  direto: { label: 'Direto', cor: SERIE[1], ordem: 1 },
  google_organico: { label: 'Google (busca)', cor: SERIE[2], ordem: 2 },
  indicacao: { label: 'Indicação', cor: SERIE[3], ordem: 3 },
  facebook: { label: 'Facebook', cor: SERIE[4], ordem: 4 },
};
const NOMES_OUTROS = {
  instagram: 'Instagram', site: 'Site', whatsapp: 'WhatsApp', outro: 'Outro', nao_informado: 'Não informado',
};

const PERIODOS = [7, 30, 90];
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

function agruparOrigens(linhas) {
  const fixas = [], outros = { nome: 'Outros', total: 0, cor: OUTROS, detalhe: [] };
  for (const r of linhas || []) {
    const o = ORIGEM[r.origem];
    if (o) fixas.push({ nome: o.label, total: r.total, cor: o.cor, ordem: o.ordem });
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
          <Line type="monotone" dataKey={chave} stroke={cor} strokeWidth={2} dot={false} isAnimationActive={false} />
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
  if (!active || !payload?.length) return null;
  return (
    <div className="bi-tooltip">
      <div className="bi-tooltip-titulo">{diaCurto(label)}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="bi-tooltip-linha">
          <span className="bi-chip" style={{ background: p.color }} /> {p.name}: <strong>{num(p.value)}</strong>
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
                     startAngle={90} endAngle={-270} stroke="#ffffff" strokeWidth={dados.length > 1 ? 2 : 0} isAnimationActive={false}>
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
                  <div className="bi-funil-barra" style={{ width: `${Math.max((e.valor / max) * 100, e.valor ? 2 : 0)}%`, background: FUNIL[i + 1] }}
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
                {i.valor > 0 && <div className="bi-barra" style={{ width: `${(i.valor / max) * 100}%` }} />}
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
  const mapa = useMemo(() => {
    const m = {};
    for (const r of linhas || []) m[`${r.dow}-${r.hora}`] = r.total;
    return m;
  }, [linhas]);
  const max = Math.max(0, ...Object.values(mapa));
  const [foco, setFoco] = useState(null);
  const horas = Array.from({ length: 24 }, (_, h) => h);
  const cor = (v) => (!v ? '#f4f4f1' : SEQ[Math.min(SEQ.length - 1, Math.floor((v / max) * (SEQ.length - 1) + 0.0001))]);
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

// ---------- página ----------
export default function Relatorios() {
  const [dias, setDias] = useState(30);
  const [canal, setCanal] = useState('google');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tabela, setTabela] = useState(false);

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

  const a = dados ? derivados(dados.atual) : null;
  const b = dados ? derivados(dados.anterior) : null;
  const origensVisitas = useMemo(() => agruparOrigens(dados?.origens_visitas), [dados]);
  const origensPacientes = useMemo(() => agruparOrigens(dados?.origens_pacientes), [dados]);
  const nomeCanal = canal === 'todos' ? 'todas as origens' : canal === 'facebook' ? 'Facebook' : 'Google Ads';
  const temSerie = dados?.serie?.some(d => d.visitas || d.contatos);

  return (
    <div className="bi animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Marketing e resultados — {nomeCanal}, últimos {dias} dias</p>
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
          <button className={canal === 'google' ? 'ativo' : ''} onClick={() => setCanal('google')}>Google Ads</button>
          <button className={canal === 'facebook' ? 'ativo' : ''} onClick={() => setCanal('facebook')}>Facebook</button>
          <button className={canal === 'todos' ? 'ativo' : ''} onClick={() => setCanal('todos')}>Todas as origens</button>
        </div>
        <div className="bi-filtros-fim">
          <button className="btn btn-ghost btn-sm" onClick={() => setTabela(t => !t)}>
            <Table2 size={14} /> {tabela ? 'Ver gráficos' : 'Ver tabela'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={carregar} disabled={carregando} title="Atualizar">
            <RefreshCw size={14} className={carregando ? 'bi-girando' : ''} />
          </button>
        </div>
      </div>

      {erro && <div className="bi-erro">Não foi possível carregar o relatório agora.</div>}

      {a && (
        <>
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
                      <LineChart data={dados.serie} margin={{ top: 10, right: 16, bottom: 0, left: -18 }}>
                        <CartesianGrid stroke="#ecebe7" vertical={false} />
                        <XAxis dataKey="dia" tickFormatter={diaCurto} tick={{ fill: '#6b6a65', fontSize: 11 }} axisLine={false} tickLine={false}
                               minTickGap={24} />
                        <YAxis allowDecimals={false} tick={{ fill: '#6b6a65', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<TooltipLinha />} cursor={{ stroke: '#b9b8b2', strokeWidth: 1 }} />
                        <Line type="monotone" dataKey="visitas" name="Visitas" stroke={SERIE[0]} strokeWidth={2} dot={false}
                              activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                        <Line type="monotone" dataKey="contatos" name="Contatos" stroke={SERIE[1]} strokeWidth={2} dot={false}
                              activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <Funil t={a} />
              </div>

              <div className="bi-linha bi-linha-3">
                <Rosca titulo="De onde vêm as visitas" dados={origensVisitas} unidade="visitas" />
                <Rosca titulo="Origem dos pacientes" dados={origensPacientes} unidade="pacientes" />
                <Contatos t={a} />
              </div>

              <div className="bi-linha bi-linha-2-1">
                <MapaCalor linhas={dados.calor} />
                <div className="bi-card">
                  <div className="bi-card-titulo">Palavras do anúncio</div>
                  {!dados.termos?.length ? <Vazio texto="Aparece quando o anúncio enviar as palavras pesquisadas" /> : (
                    <table className="bi-termos">
                      <thead><tr><th>Palavra</th><th>Visitas</th><th>Contatos</th></tr></thead>
                      <tbody>
                        {dados.termos.map(t => (
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
        </>
      )}
    </div>
  );
}
