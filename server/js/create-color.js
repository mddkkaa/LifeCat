// =========================================================
//  LifeCat — окрас через сервер
// =========================================================

const PRESETS = [
    { name: 'Рыжий',    fur: '#d98c3f', eye: '#6ea36e' },
    { name: 'Чёрный',   fur: '#2a2a2a', eye: '#e0a84a' },
    { name: 'Белый',    fur: '#e8e6e1', eye: '#4a8fd9' },
    { name: 'Серый',    fur: '#7a7f88', eye: '#6ea36e' },
    { name: 'Бурый',    fur: '#6b4a2b', eye: '#d98c3f' },
    { name: 'Пятнистый',fur: '#c9b48a', eye: '#7a5cc0' },
    { name: 'Дымчатый', fur: '#9aa4b0', eye: '#e07878' },
    { name: 'Кремовый', fur: '#e6d3b3', eye: '#4a8fd9' },
];

function showMessage(text, type = 'error') {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message form-message--' + type;
}

let cat = null;

document.addEventListener('DOMContentLoaded', async () => {
    let me;
    try {
        me = await API.me();
        document.getElementById('user-badge').textContent = '🐾 ' + me.user.username;
    } catch {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        API.clearToken();
        window.location.href = 'index.html';
    });

    try {
        cat = await CatAPI.get();
    } catch {}

    if (!cat) {
        window.location.href = 'create-cat.html';
        return;
    }

    const furInput    = document.getElementById('fur-color');
    const furText     = document.getElementById('fur-color-text');
    const eyeInput    = document.getElementById('eye-color');
    const eyeText     = document.getElementById('eye-color-text');
    const previewBody = document.getElementById('cat-preview-body');
    const palette     = document.getElementById('palette');

    if (cat.color_fur) {
        furInput.value = cat.color_fur; furText.value = cat.color_fur;
        eyeInput.value = cat.color_eye; eyeText.value = cat.color_eye;
    }
    updatePreview();

    furInput.addEventListener('input', () => { furText.value = furInput.value; updatePreview(); });
    furText.addEventListener('input',  () => {
        if (/^#[0-9a-fA-F]{6}$/.test(furText.value)) {
            furInput.value = furText.value; updatePreview();
        }
    });
    eyeInput.addEventListener('input', () => { eyeText.value = eyeInput.value; updatePreview(); });
    eyeText.addEventListener('input',  () => {
        if (/^#[0-9a-fA-F]{6}$/.test(eyeText.value)) {
            eyeInput.value = eyeText.value; updatePreview();
        }
    });

    palette.innerHTML = PRESETS.map((p, i) => `
        <button type="button" class="palette-item" data-i="${i}" title="${p.name}">
            <span class="palette-item__fur" style="background:${p.fur}"></span>
            <span class="palette-item__eye" style="background:${p.eye}"></span>
            <span class="palette-item__name">${p.name}</span>
        </button>
    `).join('');

    palette.addEventListener('click', (e) => {
        const btn = e.target.closest('.palette-item');
        if (!btn) return;
        const p = PRESETS[+btn.dataset.i];
        furInput.value = p.fur; furText.value = p.fur;
        eyeInput.value = p.eye; eyeText.value = p.eye;
        updatePreview();
    });

    function updatePreview() {
        previewBody.innerHTML = CatSVG.render({
            fur: furInput.value,
            eye: eyeInput.value,
        });
    }

    document.getElementById('color-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fur = furInput.value;
        const eye = eyeInput.value;

        if (!/^#[0-9a-fA-F]{6}$/.test(fur)) return showMessage('Некорректный цвет шерсти');
        if (!/^#[0-9a-fA-F]{6}$/.test(eye)) return showMessage('Некорректный цвет глаз');

        try {
            await CatAPI.saveColor(fur, eye);
            showMessage('Окрас сохранён! Возвращаемся...', 'success');
            setTimeout(() => { window.location.href = 'my-cat.html'; }, 700);
        } catch (err) {
            showMessage(err.message);
        }
    });
});