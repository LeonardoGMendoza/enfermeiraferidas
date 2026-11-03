import { useState, useEffect, useCallback } from 'react';
import { Target, MousePointerClick, MessageCircle, UserCheck, Wallet, TrendingUp, Plus, Trash2, Bot, Send } from 'lucide-react';
import { authFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import './GoogleAdsCard.css';

const brl = (v) =>
  v === null || v === undefined
    ? '—'
    : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CANAIS = {
  google: { nome: 'Google Ads', curto: 'Google' },
  facebook: { nome: 'Facebook', curto: 'Facebook' },
};

const PERIODOS = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '90 dias' },
];

export default function GoogleAdsCard() {
  const [dias, setDias] = useState(30);
  const [canal, setCanal] = useState('google');
  const C = CANAIS[canal];
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);
  const [investimentos, setInvestimentos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [previa, setPrevia] = useState(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const navigate = useNavigate();

  const carregar = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        authFetch(`/api/marketing/resumo?dias=${dias}&canal=${canal}`),
        authFetch('/api/marketing/investimentos'),
      ]);
      if (!r1.ok) throw new Error();
      setDados(await r1.json());
      setInvestimentos(r2.ok ? (await r2.json()).filter(i => i.canal === canal) : []);
      setErro(false);
    } catch {
      setErro(true);
    }
  }, [dias, canal]);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarInvestimento = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await authFetch('/api/marketing/investimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal, valor, descricao }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erro');
      setValor(''); setDescricao(''); setMostrarForm(false);
      carregar();
    } catch (err) {
      alert('Não foi possível salvar: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    if (!confirm('Excluir este lançamento?')) return;
    await authFetch(`/api/marketing/investimentos/${id}`, { method: 'DELETE' });
    carregar();
  };

  const verPrevia = async () => {
    setCarregandoIA(true);
    try {
      const res = await authFetch('/api/marketing/resumo/previa');
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erro');
      setPrevia(d);
    } catch (err) {
      alert('Não foi possível gerar a análise: ' + err.message);
    } finally {
      setCarregandoIA(false);
    }
  };

  const enviarAgora = async () => {
    if (!confirm('Enviar este resumo agora para o WhatsApp do Leonardo e da Sandra?')) return;
    setCarregandoIA(true);
    try {
      const res = await authFetch('/api/marketing/resumo/enviar', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erro');
      setPrevia(p => ({ ...(p || {}), texto: d.texto, ia: d.ia }));
      alert(d.enviados?.length
        ? `Enviado para ${d.enviados.length} número(s).` + (d.falhas?.length ? `\nFalhou: ${d.falhas.join('; ')}` : '')
        : `Não enviou: ${d.falhas?.join('; ') || 'sem números configurados'}`);
    } catch (err) {
      alert('Não foi possível enviar: ' + err.message);
    } finally {
      setCarregandoIA(false);
    }
  };

  const veredito = () => {
    if (!dados) return null;
    if (!dados.investido) return { cls: 'neutro', txt: 'Lance quanto você investiu para calcular o retorno.' };
    if (dados.retorno === null || dados.recebido === 0) {
      return dados.contatos > 0
        ? { cls: 'atencao', txt: `${dados.contatos} contato(s) até agora, ainda sem pagamento confirmado de paciente do ${C.curto}.` }
        : { cls: 'atencao', txt: 'Ainda sem contatos vindos do anúncio neste período.' };
    }
    if (dados.retorno >= 1) return { cls: 'bom', txt: `Valeu a pena: cada R$ 1 investido voltou R$ ${dados.retorno.toFixed(2).replace('.', ',')}.` };
    return { cls: 'atencao', txt: `Ainda não se pagou: voltou R$ ${dados.retorno.toFixed(2).replace('.', ',')} para cada R$ 1.` };
  };

  const v = veredito();

  const metricas = dados ? [
    { icon: MousePointerClick, label: `Visitas do ${C.curto}`, valor: dados.visitas, sub: dados.taxa_contato !== null ? `${dados.taxa_contato}% viraram contato` : 'pessoas que entraram no site' },
    { icon: MessageCircle, label: 'Contatos', valor: dados.contatos, sub: `${dados.cliques_whatsapp} WhatsApp · ${dados.cliques_telefone} ligação · ${dados.orcamentos} orçamento` },
    { icon: UserCheck, label: `Pacientes do ${C.curto}`, valor: dados.pacientes, sub: dados.custo_por_paciente !== null ? `${brl(dados.custo_por_paciente)} por paciente` : 'marque a origem em Pacientes' },
    { icon: Wallet, label: 'Investido', valor: brl(dados.investido), sub: dados.custo_por_contato !== null ? `${brl(dados.custo_por_contato)} por contato` : 'lançado manualmente' },
    { icon: TrendingUp, label: 'Recebido', valor: brl(dados.recebido), sub: 'PIX confirmados desses pacientes' },
  ] : [];

  return (
    <div className="card gads-card">
      <div className="gads-header">
        <div className="gads-title">
          <Target size={18} className="icon-primary" />
          Anúncios — valeu a pena?
          <div className="gads-periodos gads-canais">
            {Object.entries(CANAIS).map(([k, c]) => (
              <button key={k} className={`gads-periodo ${canal === k ? 'ativo' : ''}`} onClick={() => { setCanal(k); setMostrarForm(false); setPrevia(null); }}>
                {c.nome}
              </button>
            ))}
          </div>
        </div>
        <div className="gads-actions">
          <div className="gads-periodos">
            {PERIODOS.map(p => (
              <button key={p.dias} className={`gads-periodo ${dias === p.dias ? 'ativo' : ''}`} onClick={() => setDias(p.dias)}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/relatorios')}>
            Relatório completo
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setMostrarForm(s => !s)}>
            <Plus size={14} /> Lançar investimento
          </button>
        </div>
      </div>

      {mostrarForm && (
        <form className="gads-form" onSubmit={salvarInvestimento}>
          <input className="form-input" inputMode="decimal" placeholder={`Valor no ${C.curto} (ex.: 25,00)`} value={valor} onChange={e => setValor(e.target.value)} required />
          <input className="form-input" placeholder={canal === 'facebook' ? 'Descrição (ex.: Curativo Domiciliar SP - Facebook)' : 'Descrição (ex.: Campanha Curativo Domiciliar SP)'} value={descricao} onChange={e => setDescricao(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        </form>
      )}

      {erro && <p className="gads-erro">Não foi possível carregar os números agora.</p>}

      {dados && (
        <>
          <div className="gads-grid">
            {metricas.map((m, i) => (
              <div key={i} className="gads-metric">
                <div className="gads-metric-label"><m.icon size={14} /> {m.label}</div>
                <div className="gads-metric-value">{m.valor}</div>
                <div className="gads-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {v && <div className={`gads-veredito ${v.cls}`}>{v.txt}</div>}

          {dados.termos?.length > 0 && (
            <div className="gads-termos">
              <span>Palavras que mais trouxeram visitas:</span>
              {dados.termos.map(t => <span key={t.termo} className="badge badge-primary">{t.termo} ({t.total})</span>)}
            </div>
          )}

          {investimentos.length > 0 && (
            <details className="gads-lancamentos">
              <summary>Lançamentos de investimento ({investimentos.length})</summary>
              <ul>
                {investimentos.map(i => (
                  <li key={i.id}>
                    <span>{new Date(i.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    <span>{i.descricao || C.nome}</span>
                    <strong>{brl(i.valor)}</strong>
                    <button type="button" className="icon-action danger" title="Excluir" onClick={() => excluir(i.id)}><Trash2 size={13} /></button>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="gads-ia">
            <div className="gads-ia-botoes">
              <button type="button" className="btn btn-ghost btn-sm" onClick={verPrevia} disabled={carregandoIA}>
                <Bot size={14} /> {carregandoIA ? 'Analisando…' : 'Ver análise da IA'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={enviarAgora} disabled={carregandoIA}>
                <Send size={14} /> Enviar no WhatsApp agora
              </button>
            </div>
            {previa && (
              <>
                <pre className="gads-previa">{previa.texto}</pre>
                {previa.ia !== 'ok' && (
                  <p className="gads-nota">
                    {previa.oci === false || previa.ia === 'sem-ia'
                      ? 'A IA da Oracle ainda não está configurada no servidor — por enquanto vão só os números.'
                      : 'A IA da Oracle não respondeu agora — a mensagem vai só com os números.'}
                  </p>
                )}
              </>
            )}
          </div>

          <p className="gads-nota">
            Visitas e cliques são contados no site. {canal === 'google'
              ? 'Ligações feitas direto pelo botão do anúncio aparecem só no Google Ads.'
              : 'Pessoas que só curtiram ou comentaram o anúncio aparecem só no Gerenciador de Anúncios da Meta.'}
          </p>
        </>
      )}
    </div>
  );
}
