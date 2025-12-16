// easter-egg.js — DALE ALERTA = FULL VIRUS PANIC MODE (2025 EDITION)
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.querySelector('.search');
    if (!searchBar) return;

    // Real XP Critical Stop sound
    const xpSound = new Audio('https://cdn.freesound.org/previews/639/639697_5674468-lq.mp3');
    xpSound.preload = 'auto';

    // Softer, creepier shake (feels like the box is glitching, not having a stroke)
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes virusShake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10%  { transform: translate(-4px, -3px) rotate(-1deg); }
            20%  { transform: translate(5px, -2px) rotate(1.5deg); }
            30%  { transform: translate(-3px, 4px) rotate(-1deg); }
            40%  { transform: translate(4px, -3px) rotate(1deg); }
            50%  { transform: translate(-5px, 3px) rotate(-1.5deg); }
            60%  { transform: translate(3px, 2px) rotate(1deg); }
            70%  { transform: translate(-4px, -4px) rotate(-1deg); }
            80%  { transform: translate(3px, 3px) rotate(1.5deg); }
            90%  { transform: translate(-3px, -2px) rotate(-1deg); }
        }
        .virus-box {
            animation: virusShake 0.8s infinite ease-in-out;  /* slower = creepier */
            position: fixed !important;
            z-index: 999999 !important;
            font-family: Tahoma, sans-serif;
            user-select: none;
            pointer-events: none; /* so they can't accidentally click the fake OK */
        }
    `;
    document.head.appendChild(shakeStyle);

    let triggered = false;

    searchBar.addEventListener('input', function () {
        const val = this.value.trim().toLowerCase();
        if ((val === 'dale alerta' || val === 'dalealerta') && !triggered) {
            triggered = true;

            // Play sound
            xpSound.currentTime = 0;
            xpSound.play().catch(() => {});

            // Spawn 6 virus boxes in random positions
            const messages = [
                "YOUR IP ADDRESS HAS BEEN LEAKED",
                "SYSTEM32 IS BEING DELETED",
                "ALL FILES ENCRYPTED",
                "RANSOMWARE ACTIVATED",
                "DATA BREACH DETECTED",
                "VIRUS SPREADING...",
            ];

            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const box = document.createElement('div');
                    box.className = 'virus-box';
                    const left = Math.random() * 70 + 10;
                    const top = Math.random() * 70 + 10;
                    const msg = messages[i % messages.length];

                    box.innerHTML = `
                        <div style="background:#c0c0c0;border:3px outset white;width:380px;">
                            <div style="background:navy;color:white;padding:8px 14px;font-weight:bold;display:flex;align-items:center;gap:10px;">
                                <div style="width:16px;height:16px;background:red;border-radius:50%;"></div>
                                Microsoft Windows
                            </div>
                            <div style="padding:30px 20px;text-align:center;background:#f0f0f0;">
                                <h2 style="margin:0 0 20px;color:#c00000;font-size:26px;font-weight:bold;">
                                    ${msg}
                                </h2>
                                <button style="padding:8px 24px;background:#c0c0c0;border:2px outset white;cursor:pointer;">
                                    OK
                                </button>
                            </div>
                        </div>
                    `;
                    box.style.left = `${left}vw`;
                    box.style.top = `${top}vh`;
                    document.body.appendChild(box);

                    // Fake OK button does nothing
                    box.querySelector('button').onclick = (e) => e.preventDefault();
                }, i * 300); // staggered spawn
            }

            // Auto cleanup after 12 seconds
            setTimeout(() => {
                document.querySelectorAll('.virus-box').forEach(b => b.remove());
                searchBar.value = '';
                searchBar.style.cssText = '';
                triggered = false;
            }, 5000);
        }
    });
});