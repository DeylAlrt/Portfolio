// Utilities: time/date, DOM helpers, draggable, bringToFront
// updateDateTimeUAE: update `.time` and `.date` elements to UAE time
export function updateDateTimeUAE() {
  const now = new Date();
  const uae = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (4 * 60 * 60000));
  let hours = uae.getHours();
  const minutes = uae.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeEl = document.querySelector('.time');
  const dateEl = document.querySelector('.date');
  if (timeEl && dateEl) {
    timeEl.textContent = `${hours}:${minutes} ${ampm}`;
    dateEl.textContent = `${uae.getMonth()+1}/${uae.getDate()}/${uae.getFullYear()}`;
  }
}

// startClock: initialize periodic clock updates
export function startClock() {
  updateDateTimeUAE();
  setInterval(updateDateTimeUAE, 1000);
}

// getLangColor: return a color string for a given programming language
export function getLangColor(lang) {
  if (!lang) return '#999';
  const map = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    C: '#555',
    'C#': '#178600',
    default: '#6c757d'
  };
  return map[lang] || map.default;
}

// bringToFront: increase z-index to place `modal` above other app modals
export function bringToFront(modal) {
  const modals = document.querySelectorAll('.app-modal');
  let maxZ = 0;
  modals.forEach(m => {
    const z = parseInt(window.getComputedStyle(m).zIndex) || 0;
    if (z > maxZ) maxZ = z;
  });
  modal.style.zIndex = (maxZ + 1).toString();
}

// makeDraggable: make `modal` movable by dragging its `titlebar`
export function makeDraggable(modal, titlebar) {
  if (!modal || !titlebar) return;
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  titlebar.addEventListener('mousedown', function(e) {
    if (e.target.closest('button')) return;
    isDragging = true;
    const rect = modal.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = 'none';
    function onMouseMove(ev) {
      if (!isDragging) return;
      modal.style.left = (ev.clientX - offsetX) + 'px';
      modal.style.top = (ev.clientY - offsetY) + 'px';
    }
    function onMouseUp() {
      isDragging = false;
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}
