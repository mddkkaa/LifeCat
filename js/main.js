// Плавная прокрутка по якорям уже работает через CSS (scroll-behavior).
// Здесь — заготовка под будущую логику.

document.addEventListener('DOMContentLoaded', () => {
    // Заглушка для кнопок "Играть" / "Вход" — позже заменим на реальные страницы.
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Скоро здесь будет переход:', link.textContent.trim());
            // TODO: заменить на переход к /login и /game
        });
    });

    // Лёгкая анимация появления секций при скролле.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature, .tribe, .rank, .faq__item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity .5s ease, transform .5s ease';
        observer.observe(el);
    });
});