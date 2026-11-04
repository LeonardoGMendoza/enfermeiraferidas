// =============================================
// Lembretes de plantão no WhatsApp (plantões vêm do AgendaNurse)
//  - Plantão de HOSPITAL: 1 lembrete, 2h antes do horário salvo (06:00 → 04:00)
//  - Atendimento de FERIDAS: 2 lembretes, 2h e 1h30 antes (11:00 → 09:00 e 09:30)
// Os dados (horário, nome) são montados aqui no código; a IA da Oracle só escreve o recado.
// Se a Oracle falhar, o lembrete vai com o texto simples — nunca deixa de avisar.
//
// .env (opcional):
//   LEMBRETES_ATIVO=0   desliga os lembretes
//   HOSPITAIS=Salvalus,Santa Marcelina   nomes extras que contam como hospital
// =============================================

const FUSO = 'America/Sao_Paulo';
const JANELA_MIN = 20; // se o servidor estiver fora na hora exata, ainda avisa até 20 min depois

const AVISOS = {
  hospital: [{ chave: 'h120', antes: 120 }],
  feridas: [{ chave: 'f120', antes: 120 }, { chave: 'f90', antes: 90 }],
};

function ehHospital(nome) {
  const extras = (process.env.HOSPITAIS || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const n = String(nome || '').toLowerCase();
  return /plant[aã]o|salvalus|hospital|\bupa\b|pronto.?socorro|\bama\b|\bps\b/.test(n) || extras.some(h => n.includes(h));
}

const inicioDoPlantao = (p) => new Date(`${p.data}T${p.hora}:00-03:00`); // Brasil sem horário de verão
const horaSP = (d) => new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }).format(d);
const faltam = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, '0') : ''}` : `${min} min`);

function textoFixo(p, tipo, antes) {
  const titulo = tipo === 'hospital'
    ? `🏥 *Plantão${/plant[aã]o/i.test(p.paciente) ? '' : ` — ${p.paciente.trim()}`}*`
    : `🩹 *Atendimento de feridas — ${p.paciente.trim()}*`;
  const linhas = [`⏰ ${titulo}`, `Hoje às *${p.hora}* (faltam ${faltam(antes)}).`];
  if (p.servico) linhas.push(`📝 ${p.servico}`);
  return linhas.join('\n');
}

function promptIA(p, tipo, antes, horaAgora) {
  return [
    'Você escreve lembretes curtos de WhatsApp para a Sandra, enfermeira especialista em feridas, a pedido do marido dela.',
    `Agora são ${horaAgora}. ${tipo === 'hospital'
      ? `Ela tem plantão no hospital (${p.paciente.trim()}) às ${p.hora}.`
      : `Ela tem um atendimento de feridas com o paciente ${p.paciente.trim()} às ${p.hora}.`} Faltam ${faltam(antes)}.`,
    'Escreva no máximo 2 frases, em português, carinhosas e práticas (por exemplo: hora de acordar, separar o material, sair com folga para o trânsito).',
    'Se for de madrugada, seja um despertar gentil. Não repita o horário nem o nome, não invente endereço, trânsito ou informação clínica. Sem emojis em excesso.',
  ].join('\n');
}

export function iniciarLembretes(pool, { listarPlantoes, agendaNurseConfigurado, enviarWhatsApp, destinatarios, perguntarOracle, ociConfigurado }) {
  if (process.env.LEMBRETES_ATIVO === '0') {
    console.log('Lembretes: desligados (LEMBRETES_ATIVO=0).');
    return;
  }
  if (!agendaNurseConfigurado()) {
    console.log('Lembretes: AgendaNurse não configurado, lembretes desligados.');
    return;
  }

  const prontos = pool.query(`
    CREATE TABLE IF NOT EXISTS plantao_lembretes (
      plantao_id VARCHAR(100) NOT NULL,
      aviso VARCHAR(20) NOT NULL,
      enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (plantao_id, aviso)
    )`).catch(e => console.error('Lembretes: erro ao criar tabela:', e.message));

  console.log(`Lembretes: ligados para ${destinatarios().length} número(s) (hospital 2h antes; feridas 2h e 1h30 antes).`);

  let rodando = false;
  const verificar = async () => {
    if (rodando) return;
    rodando = true;
    try {
      await prontos;
      const nums = destinatarios();
      if (!nums.length) return;
      const agora = Date.now();
      const plantoes = await listarPlantoes();

      for (const p of plantoes) {
        if (p.status === 'cancelado') continue;
        const inicio = inicioDoPlantao(p).getTime();
        if (isNaN(inicio) || inicio < agora) continue;
        const tipo = ehHospital(p.paciente) ? 'hospital' : 'feridas';

        for (const av of AVISOS[tipo]) {
          const alvo = inicio - av.antes * 60000;
          if (agora < alvo || agora > alvo + JANELA_MIN * 60000) continue;

          // marca antes de enviar: se dois processos rodarem juntos, só um envia
          const marcou = await pool.query(
            'INSERT INTO plantao_lembretes (plantao_id, aviso) VALUES ($1,$2) ON CONFLICT DO NOTHING', [p.id, av.chave]);
          if (!marcou.rowCount) continue;

          const minutos = Math.round((inicio - agora) / 60000);
          let texto = textoFixo(p, tipo, minutos);
          if (ociConfigurado()) {
            try {
              const recado = await perguntarOracle(promptIA(p, tipo, minutos, horaSP(new Date())));
              if (recado) texto += `\n\n${recado}`;
            } catch (e) {
              console.error('Lembretes: Oracle falhou, vai o texto simples:', e.message);
            }
          }

          const ok = [];
          for (const n of nums) {
            try { await enviarWhatsApp(n, texto); ok.push(n.slice(-4)); }
            catch (e) { console.error(`Lembretes: falha ao enviar para ${n.slice(-4)}:`, e.message); }
          }
          if (!ok.length) {
            // ninguém recebeu: libera para tentar de novo na próxima volta (ainda dentro da janela)
            await pool.query('DELETE FROM plantao_lembretes WHERE plantao_id = $1 AND aviso = $2', [p.id, av.chave]);
          }
          console.log(`Lembretes: ${tipo} "${p.paciente.trim()}" ${p.data} ${p.hora} (${av.chave}) → ${ok.join(', ') || 'ninguém'}`);
        }
      }
    } catch (err) {
      console.error('Lembretes: erro na verificação:', err.message);
    } finally {
      rodando = false;
    }
  };

  setInterval(verificar, 2 * 60 * 1000).unref();
  setTimeout(verificar, 45 * 1000).unref();
}
