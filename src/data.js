// =============================================
// DATA LAYER — localStorage persistence
// =============================================

const KEYS = {
  PATIENTS: 'ef_patients',
  HOMECARES: 'ef_homecares',
  APPOINTMENTS: 'ef_appointments',
  EVOLUTIONS: 'ef_evolutions',
  USER: 'ef_user',
};

const load = (key, fallback = []) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

// ── PATIENTS ──────────────────────────────────
export const getPatients = () => load(KEYS.PATIENTS);

export const savePatient = (patient) => {
  const list = getPatients();
  if (patient.id) {
    const idx = list.findIndex(p => p.id === patient.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...patient, updatedAt: new Date().toISOString() };
    else list.push(patient);
  } else {
    list.push({ ...patient, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: patient.status || 'ativo' });
  }
  save(KEYS.PATIENTS, list);
  return list;
};

export const deletePatient = (id) => {
  const list = getPatients().filter(p => p.id !== id);
  save(KEYS.PATIENTS, list);
  return list;
};

export const getPatientById = (id) => getPatients().find(p => p.id === id);

// ── HOMECARES ─────────────────────────────────
export const getHomecares = () => load(KEYS.HOMECARES);

export const saveHomecare = (hc) => {
  const list = getHomecares();
  if (hc.id) {
    const idx = list.findIndex(h => h.id === hc.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...hc, updatedAt: new Date().toISOString() };
    else list.push(hc);
  } else {
    list.push({ ...hc, id: uid(), createdAt: new Date().toISOString(), status: hc.status || 'prospectando' });
  }
  save(KEYS.HOMECARES, list);
  return list;
};

export const deleteHomecare = (id) => {
  const list = getHomecares().filter(h => h.id !== id);
  save(KEYS.HOMECARES, list);
  return list;
};

// ── APPOINTMENTS ─────────────────────────────
export const getAppointments = () => load(KEYS.APPOINTMENTS);

export const saveAppointment = (appt) => {
  const list = getAppointments();
  if (appt.id) {
    const idx = list.findIndex(a => a.id === appt.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...appt };
    else list.push(appt);
  } else {
    list.push({ ...appt, id: uid(), createdAt: new Date().toISOString(), status: appt.status || 'agendado' });
  }
  save(KEYS.APPOINTMENTS, list);
  return list;
};

export const deleteAppointment = (id) => {
  const list = getAppointments().filter(a => a.id !== id);
  save(KEYS.APPOINTMENTS, list);
  return list;
};

// ── EVOLUTIONS ────────────────────────────────
export const getEvolutions = (patientId) => load(KEYS.EVOLUTIONS).filter(e => e.patientId === patientId);

export const saveEvolution = (evolution) => {
  const list = load(KEYS.EVOLUTIONS);
  list.push({ ...evolution, id: uid(), createdAt: new Date().toISOString() });
  save(KEYS.EVOLUTIONS, list);
  return list;
};

// ── SEED DATA ─────────────────────────────────
export const seedData = () => {
  if (getPatients().length > 0) return;

  const homecares = [
    { id: uid(), nome: 'HomeCareSP Premium', contato: 'Dra. Ana Lima', telefone: '(11) 9 8765-4321', email: 'ana@homecaresp.com.br', bairro: 'Moema', status: 'parceira', pacientesEnviados: 8, createdAt: new Date().toISOString() },
    { id: uid(), nome: 'VidaCare Homecare', contato: 'Sr. Carlos Mendes', telefone: '(11) 9 7654-3210', email: 'carlos@vidacare.com.br', bairro: 'Pinheiros', status: 'parceira', pacientesEnviados: 5, createdAt: new Date().toISOString() },
    { id: uid(), nome: 'CuidarBem SP', contato: 'Sra. Maria Santos', telefone: '(11) 9 6543-2109', email: 'maria@cuidarbem.com.br', bairro: 'Santana', status: 'prospectando', pacientesEnviados: 0, createdAt: new Date().toISOString() },
    { id: uid(), nome: 'SaúdeLar Assistência', contato: 'Dr. Paulo Rocha', telefone: '(11) 9 5432-1098', email: 'paulo@saudela.com.br', bairro: 'Vila Mariana', status: 'prospectando', pacientesEnviados: 0, createdAt: new Date().toISOString() },
  ];
  save(KEYS.HOMECARES, homecares);

  const hc0 = homecares[0].id;
  const hc1 = homecares[1].id;

  const patients = [
    { id: uid(), nome: 'José Carlos Silva', idade: 72, telefone: '(11) 9 8888-1111', endereco: 'Rua das Flores, 123 - Moema', lat: -23.6015, lng: -46.6627, bairro: 'Moema', tipoFerida: 'Úlcera por pressão', grau: 'Grau III', homecareId: hc0, status: 'ativo', obs: 'Paciente acamado. Ferida na região sacral.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), nome: 'Maria Aparecida Souza', idade: 65, telefone: '(11) 9 7777-2222', endereco: 'Av. Paulista, 456 - Bela Vista', lat: -23.5636, lng: -46.6542, bairro: 'Bela Vista', tipoFerida: 'Úlcera diabética', grau: 'Grau II', homecareId: hc1, status: 'ativo', obs: 'Diabetes tipo 2. Ferida no pé esquerdo.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), nome: 'Antônio Ferreira Lima', idade: 78, telefone: '(11) 9 6666-3333', endereco: 'Rua Augusta, 789 - Consolação', lat: -23.5533, lng: -46.6613, bairro: 'Consolação', tipoFerida: 'Ferida cirúrgica', grau: 'Pós-op', homecareId: hc0, status: 'alta', obs: 'Pós-operatório de quadril. Em recuperação.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), nome: 'Rita de Cássia Alves', idade: 58, telefone: '(11) 9 5555-4444', endereco: 'Rua Oscar Freire, 321 - Jardins', lat: -23.5694, lng: -46.6674, bairro: 'Jardins', tipoFerida: 'Celulite infecciosa', grau: 'Moderado', homecareId: hc1, status: 'ativo', obs: 'Edema e rubor em membro inferior direito.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), nome: 'Francisco Santos Costa', idade: 83, telefone: '(11) 9 4444-5555', endereco: 'Rua da Consolação, 654 - Higienópolis', lat: -23.5486, lng: -46.6561, bairro: 'Higienópolis', tipoFerida: 'Úlcera venosa', grau: 'Grau II', homecareId: hc0, status: 'ativo', obs: 'Insuficiência venosa crônica. Curativo 3x/semana.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  save(KEYS.PATIENTS, patients);

  const today = new Date();
  const appts = [
    { id: uid(), patientId: patients[0].id, patientNome: patients[0].nome, data: today.toISOString().split('T')[0], hora: '09:00', tipo: 'Curativo', status: 'agendado', bairro: patients[0].bairro, createdAt: new Date().toISOString() },
    { id: uid(), patientId: patients[1].id, patientNome: patients[1].nome, data: today.toISOString().split('T')[0], hora: '10:30', tipo: 'Avaliação', status: 'agendado', bairro: patients[1].bairro, createdAt: new Date().toISOString() },
    { id: uid(), patientId: patients[3].id, patientNome: patients[3].nome, data: today.toISOString().split('T')[0], hora: '14:00', tipo: 'Curativo', status: 'agendado', bairro: patients[3].bairro, createdAt: new Date().toISOString() },
    { id: uid(), patientId: patients[4].id, patientNome: patients[4].nome, data: today.toISOString().split('T')[0], hora: '16:00', tipo: 'Curativo', status: 'realizado', bairro: patients[4].bairro, createdAt: new Date().toISOString() },
  ];
  save(KEYS.APPOINTMENTS, appts);
};
