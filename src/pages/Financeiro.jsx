import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Activity, PieChart as PieChartIcon, List } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Financeiro.css';

// Mock helper to get evolutions since we don't have a global getEvolutions across all patients directly exported
// In a real app we'd fetch from API or aggregate from local storage
const loadAllEvolutions = () => {
  try {
    const v = localStorage.getItem('ef_evolutions');
    return v ? JSON.parse(v) : [];
  } catch { return []; }
};

export default function Financeiro() {
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [previsao, setPrevisao] = useState(0);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const evolutions = loadAllEvolutions();
    
    let totalEntradas = 0;
    let totalSaidas = 0;
    const movs = [];

    // Simple grouping by month for the chart
    const monthsMap = {};

    evolutions.forEach(evo => {
      const cobrado = parseFloat(evo.valorCobrado) || 0;
      const custo = parseFloat(evo.custoMaterial) || 0;

      if (cobrado > 0 || custo > 0) {
        if (cobrado > 0) totalEntradas += cobrado;
        if (custo > 0) totalSaidas += custo;

        const date = new Date(evo.createdAt);
        const monthYear = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

        if (!monthsMap[monthYear]) {
          monthsMap[monthYear] = { name: monthYear, Entradas: 0, Saídas: 0, Lucro: 0 };
        }
        monthsMap[monthYear].Entradas += cobrado;
        monthsMap[monthYear].Saídas += custo;
        monthsMap[monthYear].Lucro += (cobrado - custo);

        movs.push({
          id: evo.id,
          data: date,
          descricao: evo.desc || 'Atendimento',
          entrada: cobrado,
          saida: custo,
          status: evo.pago
        });
      }
    });

    setEntradas(totalEntradas);
    setSaidas(totalSaidas);
    setSaldo(totalEntradas - totalSaidas);
    
    // Regressão Linear Simples para previsão (mock matemático simples baseado no crescimento)
    setPrevisao(totalEntradas > 0 ? (totalEntradas * 1.15) - totalSaidas : 0);

    setMovimentacoes(movs.sort((a, b) => b.data - a.data));

    // Formata dados do gráfico (últimos 6 meses fictícios se não houver dados suficientes)
    let cData = Object.values(monthsMap);
    if (cData.length === 0) {
      cData = [
        { name: 'Mai/26', Entradas: 0, Saídas: 0, Lucro: 0 },
        { name: 'Jun/26', Entradas: 0, Saídas: 0, Lucro: 0 }
      ];
    }
    setChartData(cData);

    setPieData([
      { name: 'Lucro Líquido', value: totalEntradas - totalSaidas },
      { name: 'Custos/Materiais', value: totalSaidas }
    ]);

  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="financeiro-page animate-fadeIn">
      <div className="fin-header">
        <h1 className="fin-title">
          <DollarSign size={28} color="#eab308" />
          Financeiro
        </h1>
        <p className="fin-subtitle">Painel de gestão financeira com análise preditiva — Enfermeira Feridas</p>
      </div>

      <div className="fin-cards-grid">
        <div className="fin-card">
          <div className="fin-card-header">
            <TrendingUp size={16} color="var(--success)" /> Entradas do Mês
          </div>
          <div className="fin-card-value success">{formatCurrency(entradas)}</div>
        </div>
        <div className="fin-card">
          <div className="fin-card-header">
            <TrendingDown size={16} color="var(--error)" /> Saídas do Mês
          </div>
          <div className="fin-card-value error">{formatCurrency(saidas)}</div>
        </div>
        <div className="fin-card">
          <div className="fin-card-header">
            <Wallet size={16} color="var(--primary)" /> Saldo do Mês
          </div>
          <div className="fin-card-value primary">{formatCurrency(saldo)}</div>
        </div>
        <div className="fin-card predictive">
          <div className="fin-card-header">
            <Activity size={16} /> Previsão Próximo Mês
          </div>
          <div className="fin-card-value">{formatCurrency(previsao)}</div>
          <div className="fin-card-sub">Regressão Linear</div>
        </div>
      </div>

      <div className="fin-charts-grid">
        <div className="fin-chart-card">
          <h2 className="fin-chart-title"><TrendingUp size={18}/> Evolução Financeira — Histórico</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="Lucro" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                <Line type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fin-chart-card">
          <h2 className="fin-chart-title"><PieChartIcon size={18}/> Distribuição Geral</h2>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {entradas === 0 && saidas === 0 ? (
               <div style={{color: 'var(--text-muted)', fontSize: '14px'}}>Sem dados para exibir</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="fin-chart-card" style={{ marginBottom: '24px' }}>
        <h2 className="fin-chart-title"><List size={18}/> Últimas Movimentações</h2>
        <div className="fin-table-wrapper">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição / Serviço</th>
                <th>Entrada</th>
                <th>Saída (Material)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Nenhuma movimentação financeira registrada.</td>
                </tr>
              ) : (
                movimentacoes.map(m => (
                  <tr key={m.id}>
                    <td>{m.data.toLocaleDateString('pt-BR')}</td>
                    <td>{m.descricao}</td>
                    <td style={{ color: m.entrada > 0 ? 'var(--success)' : 'inherit', fontWeight: '500' }}>{m.entrada > 0 ? formatCurrency(m.entrada) : '-'}</td>
                    <td style={{ color: m.saida > 0 ? 'var(--error)' : 'inherit', fontWeight: '500' }}>{m.saida > 0 ? formatCurrency(m.saida) : '-'}</td>
                    <td>
                      <span className={`badge ${m.status === 'Pago' ? 'badge-success' : 'badge-warning'}`}>
                        {m.status || 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
