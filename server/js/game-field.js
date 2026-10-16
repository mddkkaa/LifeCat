// =========================================================
//  LifeCat — игровое поле
// =========================================================

const SEASONS = ['Весна', 'Лето', 'Осень', 'Зима'];

// Для теста — ускоренное время. 1 реальная сек = 1 игровая минута.
// Позже настроим.
const TIME_SPEED = 60;

let cat = null;
let gameTime = new Date();

document.addEventListener('DOMContentLoaded', async () => {
    // Проверка токена
    let me;
    try {
        me = await API.me();
    } catch {
        window.location.href = 'login.html';
        return;
    }

    // Получаем кота
    try {
        cat = await CatAPI.get();
    } catch (err) {
        console.error(err);
    }

    if (!cat) {
        window.location.href = 'create-cat.html';
        return;
    }

    // Ставим фон локации (пока — лагерь Ветра)
    setFieldBackground(cat.tribe);

    // Запускаем игровое время
    startClock();

    // Рендер данных
    renderSkills(cat);
    renderState(cat);
    renderFamily(cat);
    renderStory(cat);

    // Кнопки действий
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => onAction(btn.dataset.action));
    });
});

// ---------- Фон локации ----------

function setFieldBackground(tribe) {
    // Пока — только для Ветра. Позже сделаем по локациям.
    const bg = document.getElementById('field-bg');
    if (tribe === 'wind') {
        bg.style.backgroundImage = "url('img/locations/wind-camp.jpg')";
    } else {
        // Заглушка — градиент
        bg.style.backgroundImage = 'linear-gradient(135deg, #2a3a2a 0%, #1a1f2a 100%)';
    }
}

// ---------- Игровое время ----------

function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    // Пока — реальное время + ускорение. Позже привяжем к БД.
    gameTime = new Date(gameTime.getTime() + TIME_SPEED * 1000);

    const hours = String(gameTime.getHours()).padStart(2, '0');
    const minutes = String(gameTime.getMinutes()).padStart(2, '0');

    // Часть суток
    const h = gameTime.getHours();
    let partOfDay = 'Ночь';
    if (h >= 5 && h < 12) partOfDay = 'Утро';
    else if (h >= 12 && h < 17) partOfDay = 'День';
    else if (h >= 17 && h < 22) partOfDay = 'Вечер';

    document.getElementById('field-time').textContent = `${hours}:${minutes} · ${partOfDay}`;

    // Сезон — для теста по месяцу. Позже — по игровым дням.
    const month = gameTime.getMonth();
    let season = 'Зима';
    if (month >= 2 && month < 5) season = 'Весна';
    else if (month >= 5 && month < 8) season = 'Лето';
    else if (month >= 8 && month < 11) season = 'Осень';
    document.getElementById('field-season').textContent = season;

    // Год — считаем от создания кота, 1 луна = 2 дня. Пока — просто 1.
    document.getElementById('field-year').textContent = '1 год';
}

// ---------- Навыки ----------

function renderSkills(cat) {
    // Пока — заглушки. Позже берём из cat.skills
    const skills = cat.skills || {
        combat: 0, smell: 0, swim: 0, climb: 0, hunt: 0,
    };

    document.getElementById('skill-combat').textContent = skills.combat;
    document.getElementById('skill-smell').textContent  = skills.smell;
    document.getElementById('skill-swim').textContent   = skills.swim;
    document.getElementById('skill-climb').textContent  = skills.climb;
    document.getElementById('skill-hunt').textContent   = skills.hunt;

    // Максимум — 0/1 (первый уровень)
    ['combat','smell','swim','climb','hunt'].forEach(k => {
        document.getElementById(`skill-${k}-max`).textContent = '0/1';
    });
}

// ---------- Состояние ----------

function renderState(cat) {
    const state = {
        hp:      cat.hp      ?? 100,
        hunger:  cat.hunger  ?? 100,
        thirst:  cat.thirst  ?? 100,
        sleep:   cat.sleep   ?? 100,
        need:    cat.need    ?? 100,
        mood:    cat.mood    ?? 100,
    };

    for (const [key, value] of Object.entries(state)) {
        const bar = document.getElementById(`state-${key}`);
        const val = document.getElementById(`state-${key}-value`);
        if (bar) bar.style.width = value + '%';
        if (val) val.textContent = value + '/100';
    }
}

// ---------- Семья ----------

function renderFamily(cat) {
    const family = cat.family || {};
    document.getElementById('family-mother').textContent = family.mother || '— неизвестна —';
    document.getElementById('family-father').textContent = family.father || '— неизвестен —';
    document.getElementById('family-mate').textContent   = family.mate   || '— нет —';
    document.getElementById('family-kits').textContent   = (family.kits && family.kits.length)
        ? family.kits.join(', ')
        : '— нет —';
}

// ---------- История ----------

function renderStory(cat) {
    const list = document.getElementById('story-list');
    const story = cat.story || [];

    if (story.length === 0) {
        // Стартовая запись
        story.push({
            time: cat.created_at,
            text: 'Родился. Теперь я знаю, что такое мир!',
        });
    }

    list.innerHTML = story.map(entry => {
        const date = new Date(entry.time);
        const dateStr = `${String(date.getDate()).padStart(2,'0')}.${String(date.getMonth()+1).padStart(2,'0')}.${date.getFullYear()}`;
        return `
            <div class="story-entry">
                <span class="story-entry__time">${dateStr}</span>
                ${entry.text}
            </div>
        `;
    }).join('');
}

// ---------- Действия ----------

function onAction(action) {
    // Пока — заглушка. Позже — реальные действия через API.
    const labels = {
        sniff: 'Нюхать',
        sleep: 'Спать',
        eat:   'Есть',
        drink: 'Пить',
        hunt:  'Охота',
    };
    alert(`Действие «${labels[action]}» скоро появится.`);
}