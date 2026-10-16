// =========================================================
//  LifeCat — страница племени
// =========================================================

document.addEventListener('DOMContentLoaded', async () => {
    const badge = document.getElementById('user-badge');
    const logoutBtn = document.getElementById('logout-btn');
    const actions = document.querySelector('.header__actions');

    const token = API.getToken();
    if (!token) {
        // Гость — показываем «Войти» и «Регистрация»
        if (actions) {
            actions.innerHTML = `
                <a href="login.html" class="btn btn--ghost">Вход</a>
                <a href="register.html" class="btn btn--primary">Регистрация</a>
            `;
        }
        return;
    }

    try {
        const me = await API.me();
        if (badge) badge.textContent = '🐾 ' + me.user.username;
    } catch {
        API.clearToken();
        return;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            API.clearToken();
            window.location.href = 'index.html';
        });
    }
});