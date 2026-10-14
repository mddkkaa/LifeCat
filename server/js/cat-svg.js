// =========================================================
//  LifeCat — SVG-кот (генератор)
//  Рисует стилизованного кота по слоям.
//  Цвета задаются через CSS-переменные:
//    --fur      — цвет шерсти
//    --fur-dark — затемнение (лапы, тени)
//    --ear-in   — внутренняя часть уха
//    --eye      — цвет глаз
//    --collar   — цвет ошейника (по племени)
// =========================================================

window.CatSVG = {
    /**
     * Возвращает строку SVG-кота.
     * @param {Object} opts
     * @param {string} opts.fur    — HEX цвет шерсти, например '#d98c3f'
     * @param {string} opts.eye    — HEX цвет глаз
     * @param {string} [opts.collar] — HEX цвет ошейника (если не задан — берётся из племени)
     * @param {string} [opts.size] — размер в px (по умолчанию 100% контейнера)
     */
    render(opts = {}) {
        const fur    = opts.fur    || '#d98c3f';
        const eye    = opts.eye    || '#6ea36e';

        // Производные цвета: чуть темнее/светлее базового
        const furDark = shade(fur, -20);
        const earIn   = shade(fur, +25);

        return `
<svg class="cat-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Кот">
    <style>
        .cat-svg .fur      { fill: ${fur}; }
        .cat-svg .fur-dark { fill: ${furDark}; }
        .cat-svg .ear-in   { fill: ${earIn}; }
        .cat-svg .eye      { fill: ${eye}; }
        .cat-svg .pupil    { fill: #1a1a1a; }
        .cat-svg .nose     { fill: #d97a8a; }
        .cat-svg .whisker  { stroke: #e8e6e1; stroke-width: 1.4; stroke-linecap: round; opacity: .85; }
        .cat-svg .outline  { stroke: rgba(0,0,0,.25); stroke-width: 1; }
    </style>

    <!-- ХВОСТ -->
    <path class="fur outline"
          d="M 148 150 Q 180 140 178 105 Q 176 85 162 80 Q 168 100 158 118 Q 150 132 138 140 Z" />

    <!-- ТЕЛО -->
    <ellipse class="fur outline" cx="100" cy="150" rx="46" ry="34" />

    <!-- ЛАПЫ (передние) -->
    <ellipse class="fur-dark outline" cx="78" cy="176" rx="13" ry="9" />
    <ellipse class="fur-dark outline" cx="122" cy="176" rx="13" ry="9" />

   

    <!-- УШИ -->
    <path class="fur outline" d="M 60 70 L 52 30 L 92 56 Z" />
    <path class="fur outline" d="M 140 70 L 148 30 L 108 56 Z" />
    <path class="ear-in" d="M 62 66 L 58 40 L 84 58 Z" />
    <path class="ear-in" d="M 138 66 L 142 40 L 116 58 Z" />

    <!-- ГОЛОВА -->
    <ellipse class="fur outline" cx="100" cy="90" rx="52" ry="46" />

    <!-- ГЛАЗА -->
    <ellipse class="eye" cx="80"  cy="90" rx="10" ry="12" />
    <ellipse class="eye" cx="120" cy="90" rx="10" ry="12" />
    <ellipse class="pupil" cx="80"  cy="90" rx="3.5" ry="7" />
    <ellipse class="pupil" cx="120" cy="90" rx="3.5" ry="7" />
    <circle cx="77" cy="86" r="2.4" fill="#ffffff" opacity=".9" />
    <circle cx="117" cy="86" r="2.4" fill="#ffffff" opacity=".9" />

    <!-- НОС -->
    <path class="nose" d="M 96 108 L 104 108 L 100 114 Z" />

    <!-- РОТ -->
    <path d="M 100 114 Q 95 120 90 118" stroke="#1a1a1a" stroke-width="1.4"
          fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M 100 114 Q 105 120 110 118" stroke="#1a1a1a" stroke-width="1.4"
          fill="none" stroke-linecap="round" opacity=".7"/>

    <!-- УСЫ -->
    <line class="whisker" x1="70" y1="112" x2="40" y2="108" />
    <line class="whisker" x1="70" y1="116" x2="40" y2="118" />
    <line class="whisker" x1="130" y1="112" x2="160" y2="108" />
    <line class="whisker" x1="130" y1="116" x2="160" y2="118" />
</svg>`;
    }
};

/**
 * Осветляет/затемняет HEX-цвет.
 * @param {string} hex
 * @param {number} percent  — отрицательное = темнее, положительное = светлее
 */
function shade(hex, percent) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * percent / 100)));
    const g = Math.max(0, Math.min(255, ((n >>  8) & 0xff) + Math.round(255 * percent / 100)));
    const b = Math.max(0, Math.min(255, ( n        & 0xff) + Math.round(255 * percent / 100)));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/** Цвет ошейника по племени */
window.TRIBE_COLLAR = {
    thunder: '#e0a84a',
    river:   '#4a8fd9',
    shadow:  '#7a5cc0',
    wind:    '#6ea36e',
};