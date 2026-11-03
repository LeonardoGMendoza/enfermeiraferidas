// fetch com o token do painel; se o login expirou, volta para a tela de login
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('ef_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('ef_token');
    localStorage.removeItem('ef_user');
    if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
  }
  return res;
}
