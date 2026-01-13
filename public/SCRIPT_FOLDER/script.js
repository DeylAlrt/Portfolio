import { startClock } from './utils.js';
import { initDesktopIcons } from './desktop-icons.js';
import { initModals } from './modals.js';
import { initGithubClient } from './github-client.js';

// Initialize modules after DOM is ready: modals, desktop icons, GitHub client
document.addEventListener('DOMContentLoaded', async function() {
    // initialize organized modules and skip legacy inline logic
    await initModals();
    await initDesktopIcons();
    await initGithubClient();
    return; // legacy inline code below is preserved but skipped
    // --- Time/Date ---
    function updateDateTimeUAE() {
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
    updateDateTimeUAE();
    setInterval(updateDateTimeUAE, 1000);
});