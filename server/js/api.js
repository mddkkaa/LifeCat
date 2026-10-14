// =========================================================
//  LifeCat — API-клиент (работа с сервером)
// =========================================================

const API_BASE = '';
const TOKEN_KEY = 'lifecat_token';

const API = {
    setToken(token) { localStorage.setItem(TOKEN_KEY, token); },
    getToken()      { return localStorage.getItem(TOKEN_KEY); },
    clearToken()    { localStorage.removeItem(TOKEN_KEY); },

    async request(method, url, body = null) {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const res  = await fetch(API_BASE + url, opts);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || ('Ошибка ' + res.status));
        }
        return data;
    },

    get(url)         { return this.request('GET', url); },
    post(url, body)  { return this.request('POST', url, body); },
    put(url, body)   { return this.request('PUT', url, body); },
    del(url)         { return this.request('DELETE', url); },

    register(username, email, password) {
        return this.post('/api/register', { username, email, password });
    },
    login(username, password) {
        return this.post('/api/login', { username, password });
    },
    me() {
        return this.get('/api/me');
    },
};