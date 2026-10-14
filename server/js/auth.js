// =========================================================
//  LifeCat — авторизация через сервер
// =========================================================

function showMessage(text, type = 'error') {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message form-message--' + type;
}

// ---------- Регистрация ----------

async function handleRegister(e) {
    e.preventDefault();

    const username  = document.getElementById('username').value.trim();
    const email     = document.getElementById('email').value.trim();
    const password  = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const agree     = document.getElementById('agree').checked;

    // Быстрая валидация на фронте
    if (username.length < 3 || username.length > 20)
        return showMessage('Логин должен быть от 3 до 20 символов');
    if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(username))
        return showMessage('Логин: буквы, цифры, дефис, подчёркивание');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return showMessage('Введите корректный email');
    if (password.length < 6)
        return showMessage('Пароль должен быть минимум 6 символов');
    if (password !== password2)
        return showMessage('Пароли не совпадают');
    if (!agree)
        return showMessage('Нужно согласиться с правилами');

    try {
        const data = await API.register(username, email, password);
        API.setToken(data.token);
        showMessage('Аккаунт создан! Переходим к созданию кота...', 'success');
        setTimeout(() => { window.location.href = 'create-cat.html'; }, 900);
    } catch (err) {
        showMessage(err.message);
    }
}

// ---------- Вход ----------

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) return showMessage('Заполните все поля');

    try {
        const data = await API.login(username, password);
        API.setToken(data.token);
        showMessage('Вход выполнен!', 'success');

        // Позже здесь будем проверять, есть ли у игрока кот.
        // Пока — просто на «Мой кот».
        setTimeout(() => { window.location.href = 'my-cat.html'; }, 600);
    } catch (err) {
        showMessage(err.message);
    }
}

// ---------- Привязка ----------

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm    = document.getElementById('login-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginForm)    loginForm.addEventListener('submit', handleLogin);
});