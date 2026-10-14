// =========================================================
//  LifeCat — создание кота через сервер
// =========================================================

document.addEventListener('DOMContentLoaded', async () => {
    let me;
    try {
        me = await API.me();
        document.getElementById('user-badge').textContent = '🐾 ' + me.user.username;
    } catch (err) {
        console.error(err);
        window.location.href = 'login.html';
        return;
    }

    try {
        const cat = await CatAPI.get();
        if (cat) {
            window.location.href = 'my-cat.html';
            return;
        }
    } catch (err) {
        console.error('CatAPI.get ошибка:', err);
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        API.clearToken();
        window.location.href = 'index.html';
    });

    document.getElementById('create-cat-form').addEventListener('submit', handleCreateCat);
});

function showMessage(text, type = 'error') {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message form-message--' + type;
}

async function handleCreateCat(e) {
    e.preventDefault();

    const name   = document.getElementById('cat-name').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const tribe  = document.getElementById('tribe').value;

    if (name.length < 2 || name.length > 20)
        return showMessage('Имя кота: от 2 до 20 символов');
    if (!/^[a-zA-Zа-яА-ЯёЁ\- ]+$/.test(name))
        return showMessage('Имя: только буквы, дефис и пробел');
    if (!tribe)
        return showMessage('Выбери племя');

    try {
        await CatAPI.create(name, gender, tribe);
        showMessage('Кот создан! Входим в лагерь...', 'success');
        setTimeout(() => { window.location.href = 'my-cat.html'; }, 800);
    } catch (err) {
        showMessage(err.message);
    }
}