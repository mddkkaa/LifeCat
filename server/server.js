// =========================================================
//  LifeCat — сервер (с поддержкой Volume на Railway)
// =========================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const db      = require('./db');
const auth    = require('./auth');

const app  = express();
const PORT = process.env.PORT || 3000;

const DELETION_DAYS = 7;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ---------- Загрузка аватарок ----------

// Если есть Volume (Railway) — кладём туда. Иначе — рядом с файлом.
const UPLOADS_ROOT = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? process.env.RAILWAY_VOLUME_MOUNT_PATH
    : __dirname;

const uploadsDir = path.join(UPLOADS_ROOT, 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `user_${req.user.id}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 3565158 },   // 3.4 МБ
    fileFilter: (req, file, cb) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
            return cb(new Error('Только изображения (jpg, png, webp, gif)'));
        }
        cb(null, true);
    },
});

app.use('/uploads', express.static(path.join(UPLOADS_ROOT, 'uploads')));

// ---------- Главная ----------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------- Тестовые маршруты ----------

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Привет от LifeCat!' });
});

app.get('/api/db-test', (req, res) => {
    const count = db.prepare('SELECT COUNT(*) AS n FROM users').get();
    res.json({ message: 'База работает!', usersCount: count.n });
});

// ---------- Регистрация ----------

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || username.length < 3 || username.length > 20)
            return res.status(400).json({ error: 'Логин: 3–20 символов' });
        if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(username))
            return res.status(400).json({ error: 'Логин: буквы, цифры, дефис, подчёркивание' });
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: 'Некорректный email' });
        if (!password || password.length < 6)
            return res.status(400).json({ error: 'Пароль: минимум 6 символов' });

        if (db.prepare('SELECT id FROM users WHERE username = ?').get(username))
            return res.status(409).json({ error: 'Логин уже занят' });
        if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
            return res.status(409).json({ error: 'Email уже используется' });

        const passwordHash = await auth.hashPassword(password);
        const info = db.prepare(`
            INSERT INTO users (username, email, password_hash, created_at)
            VALUES (?, ?, ?, ?)
        `).run(username, email, passwordHash, Date.now());

        const user = { id: info.lastInsertRowid, username };
        const token = auth.createToken(user);

        res.json({ success: true, token, user: { id: user.id, username } });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// ---------- Вход ----------

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ error: 'Заполни все поля' });

        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) return res.status(401).json({ error: 'Пользователь не найден' });

        const ok = await auth.verifyPassword(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: 'Неверный пароль' });

        const token = auth.createToken(user);
        res.json({ success: true, token, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// ---------- Кто я ----------

app.get('/api/me', auth.requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user });
});

// =========================================================
//  КОТ
// =========================================================

app.get('/api/cat', auth.requireAuth, (req, res) => {
    const cat = db.prepare('SELECT * FROM cats WHERE user_id = ?').get(req.user.id);
    res.json({ cat: cat || null });
});

app.post('/api/cat', auth.requireAuth, (req, res) => {
    try {
        const { name, gender, tribe } = req.body;

        if (!name || name.length < 2 || name.length > 20)
            return res.status(400).json({ error: 'Имя кота: 2–20 символов' });
        if (!/^[a-zA-Zа-яА-ЯёЁ\- ]+$/.test(name))
            return res.status(400).json({ error: 'Имя: только буквы, дефис, пробел' });
        if (!['male', 'female'].includes(gender))
            return res.status(400).json({ error: 'Некорректный пол' });
        if (!['thunder', 'river', 'shadow', 'wind'].includes(tribe))
            return res.status(400).json({ error: 'Некорректное племя' });

        const existing = db.prepare('SELECT id FROM cats WHERE user_id = ?').get(req.user.id);
        if (existing)
            return res.status(409).json({ error: 'У тебя уже есть кот' });

        const info = db.prepare(`
            INSERT INTO cats (user_id, name, gender, tribe, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.user.id, name, gender, tribe, Date.now());

        const cat = db.prepare('SELECT * FROM cats WHERE id = ?').get(info.lastInsertRowid);
        res.json({ success: true, cat });
    } catch (err) {
        console.error('Ошибка создания кота:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.put('/api/cat/color', auth.requireAuth, (req, res) => {
    const { fur, eye } = req.body;
    if (!/^#[0-9a-fA-F]{6}$/.test(fur)) return res.status(400).json({ error: 'Некорректный цвет шерсти' });
    if (!/^#[0-9a-fA-F]{6}$/.test(eye)) return res.status(400).json({ error: 'Некорректный цвет глаз' });

    const cat = db.prepare('SELECT id FROM cats WHERE user_id = ?').get(req.user.id);
    if (!cat) return res.status(404).json({ error: 'Кота нет' });

    db.prepare('UPDATE cats SET color_fur = ?, color_eye = ? WHERE user_id = ?')
      .run(fur, eye, req.user.id);

    const updated = db.prepare('SELECT * FROM cats WHERE user_id = ?').get(req.user.id);
    res.json({ success: true, cat: updated });
});

app.post('/api/cat/avatar', auth.requireAuth, (req, res) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });

        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        db.prepare('UPDATE cats SET avatar = ? WHERE user_id = ?')
          .run(avatarPath, req.user.id);

        const cat = db.prepare('SELECT * FROM cats WHERE user_id = ?').get(req.user.id);
        res.json({ success: true, cat });
    });
});

app.delete('/api/cat/avatar', auth.requireAuth, (req, res) => {
    const cat = db.prepare('SELECT avatar FROM cats WHERE user_id = ?').get(req.user.id);
    if (!cat) return res.status(404).json({ error: 'Кота нет' });

    if (cat.avatar) {
        const filePath = path.join(UPLOADS_ROOT, cat.avatar.replace('/uploads/', 'uploads/'));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.prepare('UPDATE cats SET avatar = NULL WHERE user_id = ?').run(req.user.id);
    res.json({ success: true });
});

app.post('/api/cat/delete', auth.requireAuth, (req, res) => {
    const cat = db.prepare('SELECT * FROM cats WHERE user_id = ?').get(req.user.id);
    if (!cat) return res.status(404).json({ error: 'Кота нет' });
    if (cat.deletion_requested_at)
        return res.status(409).json({ error: 'Удаление уже запрошено' });

    const now = Date.now();
    const availableAt = now + DELETION_DAYS * 24 * 60 * 60 * 1000;

    db.prepare(`
        UPDATE cats
        SET deletion_requested_at = ?, deletion_available_at = ?
        WHERE user_id = ?
    `).run(now, availableAt, req.user.id);

    res.json({ success: true, deletionAvailableAt: availableAt });
});

app.post('/api/cat/cancel-delete', auth.requireAuth, (req, res) => {
    db.prepare(`
        UPDATE cats
        SET deletion_requested_at = NULL, deletion_available_at = NULL
        WHERE user_id = ?
    `).run(req.user.id);
    res.json({ success: true });
});

// ---------- Смена пароля/email ----------

app.post('/api/change-password', auth.requireAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword)
            return res.status(400).json({ error: 'Заполни все поля' });
        if (newPassword.length < 6)
            return res.status(400).json({ error: 'Новый пароль: минимум 6 символов' });

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        const ok = await auth.verifyPassword(oldPassword, user.password_hash);
        if (!ok) return res.status(401).json({ error: 'Неверный текущий пароль' });

        const newHash = await auth.hashPassword(newPassword);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка' });
    }
});

app.post('/api/change-email', auth.requireAuth, (req, res) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ error: 'Некорректный email' });

    const taken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (taken) return res.status(409).json({ error: 'Email уже используется' });

    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, req.user.id);
    res.json({ success: true });
});

// ---------- Запуск ----------

app.listen(PORT, () => {
    console.log(`🐾 LifeCat server запущен: http://localhost:${PORT}`);
    console.log(`🗄️  База данных: ${process.env.RAILWAY_VOLUME_MOUNT_PATH ? 'Volume' : 'локально'}`);
});