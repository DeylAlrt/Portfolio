document.addEventListener('DOMContentLoaded', function() {
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

    // --- App Modal Logic ---
    const appModal = document.getElementById('app-modal');
    const appTitlebar = document.getElementById('app-titlebar');
    const appMinimize = document.getElementById('app-minimize');
    const appMaximize = document.getElementById('app-maximize');
    const appClose = document.getElementById('app-close');
    const taskbarApps = document.getElementById('taskbar-apps');
    let isAppOpen = false;
    let isAppMaximized = false;
    let isAppMinimized = false;
    let dragOffsetX = 0, dragOffsetY = 0, draggingApp = false;

    // --- Desktop Icon Grid ---
    const icons = Array.from(document.querySelectorAll('.desktop-icons .icon'));
    const gridX = 32; // left margin
    const gridY = 32; // top margin
    const cellWidth = 80; // icon width
    const cellHeight = 109; // icon height + gap
    const taskbar = document.querySelector('.taskbar');
    const desktopHeight = window.innerHeight - (taskbar ? taskbar.offsetHeight : 48) - gridY;
    const desktopWidth = window.innerWidth - gridX;
    const cols = Math.floor(desktopWidth / cellWidth);
    const rows = Math.floor(desktopHeight / cellHeight);

    // Track grid occupancy
    let gridMap = Array(cols * rows).fill(null);

    // Initial placement
    icons.forEach((icon, i) => {
        const col = Math.floor(i / rows);
        const row = i % rows;
        icon.dataset.gridCol = col;
        icon.dataset.gridRow = row;
        icon.style.position = 'absolute';
        icon.style.left = `${gridX + col * cellWidth}px`;
        icon.style.top = `${gridY + row * cellHeight}px`;
        gridMap[row + col * rows] = icon;
    });

    // Snap icon to grid on drag, only to empty cells
    icons.forEach(icon => {
        icon.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;

            // Prevent dragging "About me" icon
            const label = icon.querySelector('span').textContent.trim();
            if (label === 'About me') return;

            const rect = icon.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            function onMouseMove(ev) {
                let x = ev.clientX - offsetX;
                let y = ev.clientY - offsetY;

                let gridCol = Math.max(0, Math.min(cols - 1, Math.round((x - gridX) / cellWidth)));
                let gridRow = Math.max(0, Math.min(rows - 1, Math.round((y - gridY) / cellHeight)));
                let gridIndex = gridRow + gridCol * rows;

                // Only snap if cell is empty or it's the icon's own cell
                if (gridMap[gridIndex] === null || gridMap[gridIndex] === icon) {
                    icon.style.zIndex = 1000;
                    icon.style.left = `${gridX + gridCol * cellWidth}px`;
                    icon.style.top = `${gridY + gridRow * cellHeight}px`;
                    icon.dataset.gridCol = gridCol;
                    icon.dataset.gridRow = gridRow;
                }
            }

            function onMouseUp() {
                // Update gridMap
                // Remove icon from previous cell
                let prevCol = parseInt(icon.dataset.gridCol);
                let prevRow = parseInt(icon.dataset.gridRow);
                gridMap[prevRow + prevCol * rows] = null;

                // Place icon in new cell
                let newCol = Math.round((parseInt(icon.style.left) - gridX) / cellWidth);
                let newRow = Math.round((parseInt(icon.style.top) - gridY) / cellHeight);
                icon.dataset.gridCol = newCol;
                icon.dataset.gridRow = newRow;
                gridMap[newRow + newCol * rows] = icon;

                icon.style.zIndex = '';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });

    // Highlight on single click, bright highlight on double click
    icons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            icons.forEach(ic => ic.classList.remove('icon-selected', 'icon-opened'));
            icon.classList.add('icon-selected');
        });

        icon.addEventListener('dblclick', function(e) {
            icons.forEach(ic => ic.classList.remove('icon-opened'));
            icon.classList.add('icon-opened');
            setTimeout(() => {
                icon.classList.remove('icon-opened');
            }, 400);

            const label = icon.querySelector('span').textContent.trim();
            if (label === 'About me') {
                openAppWindow('📘 About Me - Notepad');
            }
            if (label === 'Projects') {
                openProjectsWindow();
            }
        });

        document.body.addEventListener('click', function(e) {
            if (!e.target.closest('.icon')) {
                icon.classList.remove('icon-selected');
            }
        });
    });

    // --- App Modal Logic (unchanged) ---
    let lastModalRect = null;

    // Helper to bring a modal to front
    function bringToFront(modal) {
        // Find the highest z-index among modals
        const modals = document.querySelectorAll('.app-modal');
        let maxZ = 10000;
        modals.forEach(m => {
            const z = parseInt(window.getComputedStyle(m).zIndex) || 10000;
            if (z > maxZ) maxZ = z;
        });
        modal.style.zIndex = maxZ + 1;
    }

    // Bring to front when opening About Me
    function openAppWindow(title) {
        appModal.style.display = 'block';
        appModal.classList.remove('maximized', 'minimized');
        document.getElementById('app-title').textContent = title;
        isAppOpen = true;
        isAppMaximized = false;
        isAppMinimized = false;
        restoreModalSizeAndPosition();
        addTaskbarButton(title);
        bringToFront(appModal);
    }

    function addTaskbarButton(title) {
        let btn = document.getElementById('taskbar-btn-about');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'taskbar-app-btn active';
            btn.id = 'taskbar-btn-about';
            btn.textContent = title;
            btn.onclick = function() {
                if (isAppMinimized) {
                    appModal.classList.remove('minimized');
                    appModal.style.display = 'block';
                    isAppMinimized = false;
                    restoreModalSizeAndPosition();
                } else {
                    appModal.classList.add('minimized');
                    appModal.style.display = 'none';
                    isAppMinimized = true;
                    saveModalSizeAndPosition();
                }
            };
            taskbarApps.appendChild(btn);
        } else {
            btn.classList.add('active');
            appModal.style.display = 'block';
            appModal.classList.remove('minimized');
            isAppMinimized = false;
            restoreModalSizeAndPosition();
        }
    }

    function saveModalSizeAndPosition() {
        lastModalRect = {
            width: appModal.style.width,
            height: appModal.style.height,
            left: appModal.style.left,
            top: appModal.style.top
        };
    }

    function restoreModalSizeAndPosition() {
        if (lastModalRect) {
            appModal.style.width = lastModalRect.width;
            appModal.style.height = lastModalRect.height;
            appModal.style.left = lastModalRect.left;
            appModal.style.top = lastModalRect.top;
        }
    }

    appMinimize.onclick = function() {
        saveModalSizeAndPosition();
        appModal.classList.add('minimized');
        appModal.style.display = 'none';
        isAppMinimized = true;
    };

    appMaximize.onclick = function() {
        if (!isAppMaximized) {
            appModal.classList.add('maximized');
            isAppMaximized = true;
        } else {
            appModal.classList.remove('maximized');
            restoreModalSizeAndPosition();
            isAppMaximized = false;
        }
    };

    appClose.onclick = function() {
        appModal.style.display = 'none';
        isAppOpen = false;
        isAppMaximized = false;
        isAppMinimized = false;
        let btn = document.getElementById('taskbar-btn-about');
        if (btn) btn.remove();
    };

    // Dragging logic for app window
    appTitlebar.addEventListener('mousedown', function(e) {
        if (isAppMaximized) return;
        draggingApp = true;
        const rect = appModal.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';

        function onMouseMove(ev) {
            if (!draggingApp || isAppMaximized) return;
            appModal.style.left = (ev.clientX - dragOffsetX) + 'px';
            appModal.style.top = (ev.clientY - dragOffsetY) + 'px';
            appModal.style.transform = 'none';
        }

        function onMouseUp() {
            draggingApp = false;
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // --- Projects Modal Logic ---
    const projectsIcon = document.getElementById('projects-icon');
    const projectsModal = document.getElementById('projects-modal');
    const projectsTitlebar = document.getElementById('projects-titlebar');
    const projectsMinimize = document.getElementById('projects-minimize');
    const projectsMaximize = document.getElementById('projects-maximize');
    const projectsClose = document.getElementById('projects-close');
    let draggingProjects = false, dragOffsetX2 = 0, dragOffsetY2 = 0;

    function addProjectsTaskbarButton() {
        let btn = document.getElementById('taskbar-btn-projects');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'taskbar-app-btn active';
            btn.id = 'taskbar-btn-projects';
            btn.textContent = '📁 Projects';
            btn.onclick = function() {
                if (projectsModal.style.display === 'none' || projectsModal.classList.contains('minimized')) {
                    openProjectsWindow();
                } else {
                    projectsModal.classList.add('minimized');
                    projectsModal.style.display = 'none';
                }
            };
            taskbarApps.appendChild(btn);
        } else {
            btn.classList.add('active');
            openProjectsWindow();
        }
    }

    // Bring to front when opening Projects
    function openProjectsWindow() {
        projectsModal.style.display = 'block';
        projectsModal.classList.remove('maximized', 'minimized');
        bringToFront(projectsModal);
        addProjectsTaskbarButton();
    }

    // Minimize
    projectsMinimize.onclick = function() {
        projectsModal.classList.add('minimized');
        projectsModal.style.display = 'none';
    };

    // Maximize/Restore
    let projectsWasMaximized = false;
    let projectsLastRect = null;

    projectsMaximize.onclick = function() {
        if (!projectsWasMaximized) {
            projectsLastRect = {
                top: projectsModal.style.top || '5%',
                left: projectsModal.style.left || '10%',
                width: projectsModal.style.width || '80%',
                height: projectsModal.style.height || '85%'
            };
            projectsModal.classList.add('maximized');
            projectsWasMaximized = true;
        } else {
            projectsModal.classList.remove('maximized');
            if (projectsLastRect) {
                projectsModal.style.top = projectsLastRect.top;
                projectsModal.style.left = projectsLastRect.left;
                projectsModal.style.width = projectsLastRect.width;
                projectsModal.style.height = projectsLastRect.height;
            }
            projectsWasMaximized = false;
        }
    };


    // Close
    projectsClose.onclick = function() {
        projectsModal.style.display = 'none';
        let btn = document.getElementById('taskbar-btn-projects');
        if (btn) btn.remove();
    };

    projectsTitlebar.addEventListener('mousedown', function(e) {
        if (isProjectsMaximized) return;
        draggingProjects = true;
        const rect = projectsModal.getBoundingClientRect();
        dragOffsetX2 = e.clientX - rect.left;
        dragOffsetY2 = e.clientY - rect.top;
        document.body.style.userSelect = 'none';

        function onMouseMove(ev) {
            if (!draggingProjects || isProjectsMaximized) return;
            projectsModal.style.left = (ev.clientX - dragOffsetX2) + 'px';
            projectsModal.style.top = (ev.clientY - dragOffsetY2) + 'px';
            projectsModal.style.transform = 'none';
        }

        function onMouseUp() {
            draggingProjects = false;
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Also bring to front when clicking on the modal
    [appModal, projectsModal].forEach(modal => {
        modal.addEventListener('mousedown', function() {
            bringToFront(modal);
        });
    });

        // === RESUME DOUBLE CLICK ===
    document.querySelectorAll('.icon').forEach(icon => {
        if (icon.querySelector('span')?.textContent.trim() === 'Resume') {
            icon.addEventListener('dblclick', () => {
                const resume = document.getElementById('resume-modal');
                resume.style.display = 'block';
                bringToFront(resume);
                addTaskbarButton('Resume - Google Chrome', resume);
            });
        }
    });

    // Close resume
    document.getElementById('resume-close')?.addEventListener('click', () => {
            document.getElementById('resume-modal').style.display = 'none';
        });

        // ============= RESUME WINDOW CONTROLS (was missing) =============
    const resumeModal = document.getElementById('resume-modal');
    const resumeMinimize = document.getElementById('resume-minimize');
    const resumeMaximize = document.getElementById('resume-maximize');
    const resumeClose = document.getElementById('resume-close');

    let isResumeMaximized = false;

    resumeClose.onclick = () => resumeModal.style.display = 'none';

    resumeMinimize.onclick = () => {
        resumeModal.style.display = 'none';
        addTaskbarIcon('resume', 'Resume', 'https://img.icons8.com/color/48/chrome--v1.png');
    };

    resumeMaximize.onclick = () => {
        if (!isResumeMaximized) {
            resumeModal.classList.add('maximized');
            isResumeMaximized = true;
        } else {
            resumeModal.classList.remove('maximized');
            isResumeMaximized = false;
        }
    };

    // make titlebar draggable
    makeDraggable(resumeModal, document.getElementById('resume-titlebar'));

        // ========= DALE ALERTA = BRUH (NO CORS, NO BULLSHIT, WORKS 1000% OF THE TIME) =========
    const searchBar = document.querySelector('.search');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            const value = this.value.trim().toLowerCase();
            if (value === 'dale alerta' || value === 'dalealerta') {
                // instant visual chaos
                this.value = 'BRUH NIGGA 😭🔥';
                this.style.cssText = 'background:#ff0000 !important; color:white !important; font-size:22px !important; font-weight:900 !important; text-align:center !important; border:4px solid yellow !important;';

                // this sound is hosted on a site that allows CORS — literally cannot be blocked
                const bruh = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
                bruh.volume = 1;
                bruh.play();

                // shake the whole fucking screen
                document.body.style.animation = 'shake 0.5s';
                
                setTimeout(() => {
                    this.value = '';
                    this.style.cssText = '';
                    document.body.style.animation = '';
                }, 3000);
            }
        });
    }

    // add this in script.js
    icons.forEach(icon => {
        icon.draggable = true;
        icon.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', icon.querySelector('span').textContent);
            draggingIcon = icon;
        });
    });

    recycleIcon.addEventListener('dragover', e => e.preventDefault());
    recycleIcon.addEventListener('drop', e => {
        if (draggingIcon && draggingIcon !== recycleIcon) {
            trashItems.push({
                name: draggingIcon.querySelector('span').textContent,
                icon: draggingIcon.querySelector('img').src
            });
            draggingIcon.style.display = 'none';
            updateTrashCount();
        }
    });

    // save positions
    function saveDesktop() {
        const layout = icons.map(icon => ({
            name: icon.querySelector('span').textContent,
            x: icon.style.left,
            y: icon.style.top,
            visible: icon.style.display !== 'none'
        }));
        localStorage.setItem('daleDesktop', JSON.stringify(layout));
        localStorage.setItem('trash', JSON.stringify(trashItems));
    }

    // load on start
    function loadDesktop() {
        const saved = localStorage.getItem('daleDesktop');
        if (saved) { /* restore positions + hidden icons */ }
    }
    
    // shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%,100% { transform: translateX(0); }
            10%,30%,50%,70%,90% { transform: translateX(-10px); }
            20%,40%,60%,80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
});