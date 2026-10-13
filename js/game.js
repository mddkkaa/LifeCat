// =========================================================
//  LifeCat — игровая страница (заглушка)
// =========================================================

const TRIBE_NAMES = {
    thunder: 'Племя Грозы',
    river:   'Племя Реки',
    shadow:  'Племя Тени',
    wind:    'Племя Ветра',
};
const TRIBE_EMOJI = {
    thunder: '⚡', river: '💧', shadow: '🌑', wind: '🍃',
};
const GENDER_EMOJI = { male: '♂', female: '♀' };

document.addEventListener('DOMContentLoaded', () => {
    const user = LC.getCurrentUser();
    if (!user || !user.cat) return;

    document.getElementById('user-badge').textContent = '🐾 ' + user.username;
    document.getElementById('logout-btn').addEventListener('click', () => LC.logout());

    const cat = user.cat;

    // Заголовок
    document.getElementById('cat-title').textContent =
        `${GENDER_EMOJI[cat.gender]} ${cat.name}`;
    document.getElementById('cat-subtitle').textContent =
        `${TRIBE_EMOJI[cat.tribe]} ${TRIBE_NAMES[cat.tribe]} • Ранг: ${cat.rank}`;

    // Инфо
    document.getElementById('cat-info').innerHTML = `
        <div class="stat-row"><span>Здоровье</span><b>${cat.stats.hp}/100</b></div>
        <div class="stat-row"><span>Сытость</span><b>${cat.stats.hunger}/100</b></div>
        <div class="stat-row"><span>Опыт</span><b>${cat.stats.exp}</b></div>
    `;

    // Удаление
    const deleteBtn = document.getElementById('delete-cat-btn');
    const cancelBtn = document.getElementById('cancel-deletion-btn');
    const banner    = document.getElementById('deletion-banner');

    // Показать баннер, если удаление запрошено
    document.addEventListener('lc:deletion-pending', () => {
        showDeletionBanner();
    });
    if (LC.isDeletionPending(cat)) showDeletionBanner();

    function showDeletionBanner() {
        banner.hidden = false;
        document.getElementById('days-left').textContent = LC.daysLeft(user.cat);
        // Скрываем кнопку удаления и заменяем на «отменить»
        deleteBtn.hidden = true;
        // Можно играть? По твоему решению — НЕТ. Тогда блокируем всё:
        document.getElementById('cat-info').style.opacity = '0.4';
        document.getElementById('cat-info').style.pointerEvents = 'none';
        document.querySelector('main').classList.add('game--locked');
    }

    // Запрос удаления
    deleteBtn.addEventListener('click', () => {
        if (!confirm(`Удалить кота ${cat.name}? Через ${LC.DELETION_DAYS} дней он исчезнет навсегда. Пока идёт срок — играть нельзя, но можно отменить.`)) return;
        const now = Date.now();
        user.cat.deletion = {
            requestedAt: now,
            availableAt: now + LC.DELETION_DAYS * 24 * 60 * 60 * 1000,
        };
        LC.saveCurrentUser(user);
        location.reload();
    });

    // Отмена удаления
    cancelBtn.addEventListener('click', () => {
        if (!confirm('Отменить удаление? Кот вернётся в игру.')) return;
        user.cat.deletion = null;
        LC.saveCurrentUser(user);
        location.reload();
    });
});