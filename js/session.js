// =========================================================
//  Сессия: проверка текущего пользователя и выход
// =========================================================

const SESSION_KEY = '_session';

/** Текущий вошедший пользователь или null */
function getCurrentUser() {
    return localStorage.getItem(SESSION_KEY);
}

/** Выход */
function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}

/**
 * Обновляет шапку на главной:
 * если вошёл — показывает имя и кнопку «Выйти»
 * если нет — оставляет «Вход» и «Регистрация»
 */
document.addEventListener('DOMContentLoaded', () => {
    const actions = document.querySelector('.header__actions');
    if (!actions) return;

    const username = getCurrentUser();
    if (!username) return;

    actions.innerHTML = `
        <span class="user-badge">🐾 ${username}</span>
        <button class="btn btn--ghost" id="logout-btn">Выйти</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
});