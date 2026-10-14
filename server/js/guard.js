// =========================================================
//  LifeCat — защита страниц
//  Подключается на защищённых страницах:
//    <script src="js/guard.js"></script>  (ДО остальных скриптов)
//
//  Устанавливает window.LC — общий объект с текущим юзером.
// =========================================================

const LC_USERS_KEY   = 'lifecat_users';
const LC_SESSION_KEY = 'lifecat_session';

// Срок удаления кота. Меняй тут.
const LC_DELETION_DAYS = 7;

window.LC = {
    DELETION_DAYS: LC_DELETION_DAYS,

    getUsers() {
        try { return JSON.parse(localStorage.getItem(LC_USERS_KEY)) || []; }
        catch { return []; }
    },
    saveUsers(users) {
        localStorage.setItem(LC_USERS_KEY, JSON.stringify(users));
    },
    getCurrentUsername() {
        return localStorage.getItem(LC_SESSION_KEY);
    },
    getCurrentUser() {
        const name = this.getCurrentUsername();
        if (!name) return null;
        return this.getUsers().find(u => u.username === name) || null;
    },
    saveCurrentUser(user) {
        const users = this.getUsers().map(u =>
            u.username === user.username ? user : u
        );
        this.saveUsers(users);
    },
    logout() {
        localStorage.removeItem(LC_SESSION_KEY);
        window.location.href = 'index.html';
    },

    // ---- Состояние кота ----
    catExists(user) {
        return !!(user && user.cat);
    },
    isDeletionPending(cat) {
        return !!(cat && cat.deletion && Date.now() < cat.deletion.availableAt);
    },
    isDeletionReady(cat) {
        return !!(cat && cat.deletion && Date.now() >= cat.deletion.availableAt);
    },
    daysLeft(cat) {
        if (!this.isDeletionPending(cat)) return 0;
        return Math.ceil((cat.deletion.availableAt - Date.now()) / (1000*60*60*24));
    },
};

// ---------- Автопроверки при загрузке ----------

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page || '';
    const user = LC.getCurrentUser();

    // 1. Не вошёл — на логин (кроме страниц входа/регистрации)
    if (!user && (page === 'create-cat' || page === 'my-cat')) {
        window.location.href = 'login.html';
        return;
    }
    if (!user) return;

    // 2. Страница создания кота
    if (page === 'create-cat') {
        if (user.cat) {
            // Кот уже есть — нельзя создавать второго
            window.location.href = 'my-cat.html';
            return;
        }
    }
        // 2b. Страница окраса — нужен кот, но не в процессе удаления
    if (page === 'create-color') {
        if (!user.cat) {
            window.location.href = 'create-cat.html';
            return;
        }
        if (LC.isDeletionPending(user.cat)) {
            window.location.href = 'my-cat.html';
            return;
        }
    }

    // 3. Игровая страница
    if (page === 'my-cat') {
        if (!user.cat) {
            // Кота нет — на создание
            window.location.href = 'create-cat.html';
            return;
        }
        // Если удаление уже истекло — удаляем кота по-настоящему
        if (LC.isDeletionReady(user.cat)) {
            user.cat = null;
            LC.saveCurrentUser(user);
            window.location.href = 'create-cat.html';
            return;
        }
        // Если удаление запрошено — играть нельзя, показываем экран ожидания
        if (LC.isDeletionPending(user.cat)) {
            document.dispatchEvent(new CustomEvent('lc:deletion-pending'));
        }
    }
});