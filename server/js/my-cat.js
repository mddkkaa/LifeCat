// =========================================================
//  LifeCat — страница "Мой кот"
// =========================================================

const HOURS_PER_MOON = 48;

const TRIBE_NAMES = {
    thunder: 'Грозовое Племя', river: 'Речное Племя',
    shadow: 'Племя Теней',   wind:  'Племя Ветра',
};
const TRIBE_EMOJI = { thunder: '⚡', river: '💧', shadow: '🌑', wind: '🍃' };
const GENDER_NAMES = { male: 'Кот ♂', female: 'Кошка ♀' };
const RANK_NAMES = {
    kit: 'Котёнок', apprentice: 'Оруженосец', warrior: 'Воин',
    deputy: 'Глашатай', leader: 'Предводитель', elder: 'Старейшина',
};

let currentCat = null;

function calculateMoons(createdAt) {
    const hours = (Date.now() - createdAt) / (1000 * 60 * 60);
    return Math.floor(hours / HOURS_PER_MOON);
}
function showMessage(id, text, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message form-message--' + type;
}
function genderEmoji(g) { return g === 'female' ? '♀' : '♂'; }

document.addEventListener('DOMContentLoaded', async () => {
    let me;
    try {
        me = await API.me();
    } catch (err) {
        alert('Ошибка API.me: ' + err.message);
        console.error(err);
        return;
    }

    document.getElementById('user-badge').textContent = '🐾 ' + me.user.username;
    document.getElementById('logout-btn').addEventListener('click', () => {
        API.clearToken();
        window.location.href = 'index.html';
    });

    try {
        currentCat = await CatAPI.get();
    } catch (err) {
        alert('Ошибка CatAPI.get: ' + err.message);
        console.error(err);
        return;
    }

    if (!currentCat) {
        window.location.href = 'create-cat.html';
        return;
    }

    renderCat(currentCat);
    initAvatar();
    initChangePassword();
    initChangeEmail();
    initDeleteCat();
});

function renderCat(cat) {
    document.getElementById('cat-name').textContent =
        `${genderEmoji(cat.gender)} ${cat.name}`;
    document.getElementById('cat-subtitle').textContent =
        `${TRIBE_EMOJI[cat.tribe]} ${TRIBE_NAMES[cat.tribe]}`;

    document.getElementById('cat-gender').textContent = GENDER_NAMES[cat.gender] || '—';
    document.getElementById('cat-moons').textContent  = calculateMoons(cat.created_at) + ' 🌙';
    document.getElementById('cat-rank').textContent   = RANK_NAMES[cat.rank] || cat.rank;
    document.getElementById('cat-tribe').textContent  =
        `${TRIBE_EMOJI[cat.tribe]} ${TRIBE_NAMES[cat.tribe]}`;
    document.getElementById('cat-activity').textContent = cat.activity ?? 0;
    document.getElementById('cat-id').textContent = cat.id;

    // Дата регистрации
    const date = new Date(cat.created_at);
    const months = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря'];
    document.getElementById('cat-created-date').textContent =
        `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} года`;

    // Раскрывающийся блок «Луны»
    const moonsRow = document.getElementById('moons-row');
    const moonsDetails = document.getElementById('moons-details');
    moonsRow.addEventListener('click', () => {
        moonsDetails.hidden = !moonsDetails.hidden;
        moonsRow.classList.toggle('cat-card__row--open', !moonsDetails.hidden);
    });

    // Кнопка окраса
    const colorBtn = document.getElementById('color-btn');
    if (cat.color_fur) colorBtn.textContent = '🎨 Изменить окрас';

    // Кнопка "В игровое поле"
    document.getElementById('enter-game-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Игровое поле скоро появится. Пока это заглушка.');
    });

    // Заглушки навигации
    document.getElementById('about-tribe-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Страница «О племени» скоро появится.');
    });
    document.getElementById('rules-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Страница «Правила» скоро появится.');
    });

    renderAvatar(cat);
}

function renderAvatar(cat) {
    const box = document.getElementById('cat-avatar');
    const removeBtn = document.getElementById('avatar-remove');

    if (cat.avatar) {
        box.innerHTML = `<img src="${cat.avatar}" alt="${cat.name}" class="cat-avatar-img">`;
        removeBtn.hidden = false;
    } else {
        const furColor = cat.color_fur || '#d98c3f';
        const eyeColor = cat.color_eye || '#6ea36e';
        box.innerHTML = CatSVG.render({ fur: furColor, eye: eyeColor });
        removeBtn.hidden = true;
    }
}

function initAvatar() {
    const input  = document.getElementById('avatar-input');
    const remove = document.getElementById('avatar-remove');

    input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 3.4 * 1024 * 1024) {
            alert('Файл больше 3.4 МБ');
            input.value = '';
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            if (img.width > 600 || img.height > 400) {
                alert(`Максимум 600×400. У тебя ${img.width}×${img.height}`);
                input.value = '';
                return;
            }

            const form = new FormData();
            form.append('avatar', file);

            try {
                const token = API.getToken();
                const res = await fetch('/api/cat/avatar', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: form,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');

                currentCat = data.cat;
                renderAvatar(currentCat);
            } catch (err) {
                alert(err.message);
            }
            input.value = '';
        };
    });

    remove.addEventListener('click', async () => {
        if (!confirm('Удалить аватар?')) return;
        try {
            await API.del('/api/cat/avatar');
            currentCat.avatar = null;
            renderAvatar(currentCat);
        } catch (err) {
            alert(err.message);
        }
    });
}

function initChangePassword() {
    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldP = document.getElementById('old-password').value;
        const newP = document.getElementById('new-password').value;
        const newP2 = document.getElementById('new-password2').value;

        if (newP.length < 6) return showMessage('password-message', 'Новый пароль минимум 6 символов');
        if (newP !== newP2)  return showMessage('password-message', 'Новые пароли не совпадают');

        try {
            await CatAPI.changePassword(oldP, newP);
            e.target.reset();
            showMessage('password-message', 'Пароль изменён!', 'success');
        } catch (err) {
            showMessage('password-message', err.message);
        }
    });
}

function initChangeEmail() {
    document.getElementById('change-email-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('new-email').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return showMessage('email-message', 'Введите корректный email');

        try {
            await CatAPI.changeEmail(email);
            e.target.reset();
            showMessage('email-message', 'Email обновлён!', 'success');
        } catch (err) {
            showMessage('email-message', err.message);
        }
    });
}

function initDeleteCat() {
    const deleteBtn = document.getElementById('delete-cat-btn');
    const cancelBtn = document.getElementById('cancel-deletion-btn');
    const banner    = document.getElementById('deletion-banner');

    if (currentCat.deletion_requested_at && Date.now() < currentCat.deletion_available_at) {
        banner.hidden = false;
        const days = Math.ceil((currentCat.deletion_available_at - Date.now()) / (1000*60*60*24));
        document.getElementById('days-left').textContent = days;
        deleteBtn.hidden = true;
    }

    deleteBtn.addEventListener('click', async () => {
        if (!confirm(`Удалить кота ${currentCat.name}? Через 7 дней он исчезнет навсегда. Пока идёт срок — играть нельзя, но можно отменить.`)) return;
        try {
            await CatAPI.requestDeletion();
            location.reload();
        } catch (err) {
            alert(err.message);
        }
    });

    cancelBtn.addEventListener('click', async () => {
        if (!confirm('Отменить удаление? Кот вернётся в игру.')) return;
        try {
            await CatAPI.cancelDeletion();
            location.reload();
        } catch (err) {
            alert(err.message);
        }
    });
}