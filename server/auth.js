// =========================================================
//  LifeCat — утилиты авторизации (bcrypt + JWT)
// =========================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// СЕКРЕТ для подписи токенов.
// В продакшене — обязательно в переменной окружения!
// Пока — просто длинная строка.
const JWT_SECRET = 'lifecat-super-secret-key-change-me-in-prod';
const JWT_EXPIRES = '30d';   // токен живёт 30 дней

// ---------- Пароли ----------

/** Хеширует пароль. Возвращает строку-хеш. */
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/** Проверяет пароль против хеша. true/false. */
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// ---------- Токены ----------

/** Создаёт JWT-токен для пользователя. */
function createToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

/** Проверяет токен. Возвращает payload или null. */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// ---------- Middleware для защиты маршрутов ----------

/**
 * Проверяет токен в заголовке Authorization: Bearer <token>.
 * Если токен валиден — кладёт пользователя в req.user и пропускает дальше.
 * Если нет — отвечает 401.
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Нет токена' });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Токен невалиден' });
    }

    req.user = payload;
    next();
}

module.exports = {
    hashPassword,
    verifyPassword,
    createToken,
    verifyToken,
    requireAuth,
};