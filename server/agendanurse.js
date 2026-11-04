// =============================================
// Ligação com o AgendaNurse (app Flutter da Sandra, Firebase "agendanurse")
// Lê os plantões de users/{uid}/plantoes e cria novos lá também,
// para que a agenda seja uma só nos dois sistemas.
//
// Variáveis no .env do servidor:
//   FIREBASE_SA_B64     chave da conta de serviço do Firebase (JSON em base64)
//   AGENDANURSE_EMAIL   e-mail(s) com que a Sandra entra no AgendaNurse, separados por vírgula.
//                       Lê os plantões de todos; os novos vão para o PRIMEIRO.
//   AGENDANURSE_UID     (opcional) uid(s) no lugar dos e-mails, também separados por vírgula
// =============================================

const FUSO = 'America/Sao_Paulo';
const COR_PADRAO = 0xff1976d2; // Colors.blue[700], a mesma do app

let estado = null; // { db, Timestamp, uids }

export const agendaNurseConfigurado = () => Boolean(process.env.FIREBASE_SA_B64);

async function conectar() {
  if (estado) return estado;
  if (!agendaNurseConfigurado()) {
    const e = new Error('AgendaNurse não configurado (falta FIREBASE_SA_B64 no .env)');
    e.status = 503;
    throw e;
  }
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, Timestamp } = await import('firebase-admin/firestore');
  const { getAuth } = await import('firebase-admin/auth');

  const conta = JSON.parse(Buffer.from(process.env.FIREBASE_SA_B64, 'base64').toString('utf8'));
  const app = getApps().find(a => a.name === 'agendanurse') || initializeApp({ credential: cert(conta) }, 'agendanurse');

  const lista = (v) => String(v || '').split(',').map(s => s.trim()).filter(Boolean);
  let uids = lista(process.env.AGENDANURSE_UID);
  if (!uids.length) {
    const emails = lista(process.env.AGENDANURSE_EMAIL);
    if (!emails.length) {
      const e = new Error('Falta AGENDANURSE_EMAIL (ou AGENDANURSE_UID) no .env');
      e.status = 503;
      throw e;
    }
    for (const email of emails) {
      try { uids.push((await getAuth(app).getUserByEmail(email)).uid); }
      catch (err) { console.error(`AgendaNurse: conta ${email} não encontrada:`, err.message); }
    }
    if (!uids.length) {
      const e = new Error('Nenhuma conta do AGENDANURSE_EMAIL foi encontrada no Firebase');
      e.status = 503;
      throw e;
    }
  }
  estado = { db: getFirestore(app), Timestamp, uids };
  return estado;
}

// Date -> { data: 'yyyy-MM-dd', hora: 'HH:mm' } no horário de São Paulo
function partesSP(d) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map(x => [x.type, x.value])
  );
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

export async function listarPlantoes() {
  const { db, uids } = await conectar();
  const snaps = await Promise.all(uids.map(uid => db.collection('users').doc(uid).collection('plantoes').get()));
  return snaps.flatMap(s => s.docs)
    .map(doc => {
      const x = doc.data();
      const quando = x.data?.toDate ? x.data.toDate() : (x.data ? new Date(x.data) : null);
      if (!quando || isNaN(quando)) return null;
      const { data, hora } = partesSP(quando);
      return {
        id: doc.id,
        origem: 'agendanurse',
        data,
        hora,
        paciente: x.paciente || 'Plantão',
        servico: x.observacao || '',
        status: String(x.status || 'PENDENTE').toLowerCase(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
}

export async function criarPlantao({ paciente, data, hora, servico, endereco }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '') || !/^\d{2}:\d{2}$/.test(hora || '')) {
    const e = new Error('Data ou hora inválida');
    e.status = 400;
    throw e;
  }
  const { db, Timestamp, uids } = await conectar();
  const uid = uids[0];
  // o Brasil não tem horário de verão desde 2019: São Paulo é sempre -03:00
  const quando = new Date(`${data}T${hora}:00-03:00`);
  const observacao = [servico, endereco].map(s => String(s || '').trim()).filter(Boolean).join(' — ');
  const ref = await db.collection('users').doc(uid).collection('plantoes').add({
    data: Timestamp.fromDate(quando),
    paciente: String(paciente || '').trim() || 'Plantão',
    observacao: observacao.slice(0, 500),
    cor: COR_PADRAO,
    status: 'PENDENTE',
  });
  return { id: ref.id, origem: 'agendanurse', data, hora, paciente, servico: observacao, status: 'pendente' };
}
