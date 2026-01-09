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

    // App Modal Logic
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

    // Desktop Icon Grid for draagging icons
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

    // Recycle Bin logic
    let trashItems = [];
    const recycleIcon = document.getElementById('recycle-icon');
    const recycleImg = document.getElementById('recycle-img');
    const recycleModal = document.getElementById('recycle-modal');
    const trashCount = document.getElementById('trash-count');
    const trashItemsContainer = document.getElementById('trash-items');
    const emptyBinBtn = document.getElementById('empty-bin');
    const emptyMsg = document.getElementById('empty-trash-msg');

    const recycleTitlebar = document.getElementById('recycle-titlebar');
    const recycleMinimize = document.getElementById('recycle-minimize');
    const recycleMaximize = document.getElementById('recycle-maximize');
    const recycleClose = document.getElementById('recycle-close');
    let isRecycleMaximized = false;
    let recycleLastRect = null;

    const emptyBinSrc = 'https://img.icons8.com/?size=100&id=LjNe156kndXS&format=png&color=000000';
    const fullBinSrc = 'https://img.icons8.com/?size=100&id=8usOzL0PIrcw&format=png&color=000000';

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

            const rect = icon.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            function onMouseMove(ev) {
                let x = ev.clientX - offsetX;
                let y = ev.clientY - offsetY;

                let gridCol = Math.max(0, Math.min(cols - 1, Math.round((x - gridX) / cellWidth)));
                let gridRow = Math.max(0, Math.min(rows - 1, Math.round((y - gridY) / cellHeight)));

                icon.style.zIndex = 1000;
                icon.style.left = `${gridX + gridCol * cellWidth}px`;
                icon.style.top = `${gridY + gridRow * cellHeight}px`;
            }

            function onMouseUp() {
                icon.style.zIndex = '';

                // Check if dropped over Recycle Bin (using center of icon)
                const recycleRect = recycleIcon.getBoundingClientRect();
                const iconRect = icon.getBoundingClientRect();
                const iconCenterX = iconRect.left + iconRect.width / 2;
                const iconCenterY = iconRect.top + iconRect.height / 2;

                const label = icon.querySelector('span').textContent.trim();

                if (iconCenterX > recycleRect.left && 
                    iconCenterX < recycleRect.right && 
                    iconCenterY > recycleRect.top && 
                    iconCenterY < recycleRect.bottom &&
                    label !== 'Recycle Bin') {

                    // DELETE: hide icon, add to trash
                    icon.style.display = 'none';
                    trashItems.push({
                        name: label,
                        imgSrc: icon.querySelector('img').src,
                        index: icons.indexOf(icon)
                    });
                    updateRecycleBin();

                } else {
                    // Normal snap to grid
                    let prevCol = parseInt(icon.dataset.gridCol);
                    let prevRow = parseInt(icon.dataset.gridRow);
                    if (!isNaN(prevCol) && !isNaN(prevRow)) {
                        gridMap[prevRow + prevCol * rows] = null;
                    }

                    let newCol = Math.round((parseInt(icon.style.left) - gridX) / cellWidth);
                    let newRow = Math.round((parseInt(icon.style.top) - gridY) / cellHeight);
                    newCol = Math.max(0, Math.min(cols - 1, newCol));
                    newRow = Math.max(0, Math.min(rows - 1, newRow));

                    icon.style.left = `${gridX + newCol * cellWidth}px`;
                    icon.style.top = `${gridY + newRow * cellHeight}px`;
                    icon.dataset.gridCol = newCol;
                    icon.dataset.gridRow = newRow;
                    gridMap[newRow + newCol * rows] = icon;
                }

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

    // App Modal Logic  
    let lastModalRect = null;

    // Bring a modal to front
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

// --- Recycle Bin Modal Controls ---
let isRecycleOpen = false;
let isRecycleMinimized = false;

function openRecycleWindow() {
    recycleModal.style.display = 'block';
    recycleModal.classList.remove('minimized', 'maximized');
    bringToFront(recycleModal);
    updateRecycleBin();
    addRecycleTaskbarButton();
    isRecycleOpen = true;
    isRecycleMinimized = false;
    isRecycleMaximized = false;
}

function addRecycleTaskbarButton() {
    let btn = document.getElementById('taskbar-btn-recycle');
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'taskbar-app-btn active';
        btn.id = 'taskbar-btn-recycle';
        btn.textContent = '🗑 Recycle Bin';
        btn.onclick = () => {
            if (isRecycleMinimized) {
                recycleModal.classList.remove('minimized');
                recycleModal.style.display = 'block';
                isRecycleMinimized = false;
            } else {
                recycleModal.classList.add('minimized');
                recycleModal.style.display = 'none';
                isRecycleMinimized = true;
            }
        };
        taskbarApps.appendChild(btn);
    } else {
        btn.classList.add('active');
        recycleModal.style.display = 'block';
        recycleModal.classList.remove('minimized');
        isRecycleMinimized = false;
    }
}

    // Minimize
    recycleMinimize.onclick = () => {
        recycleModal.classList.add('minimized');
        recycleModal.style.display = 'none';
        isRecycleMinimized = true;
    };

    // Maximize/Restore
    recycleMaximize.onclick = () => {
        if (!isRecycleMaximized) {
            recycleLastRect = {
                top: recycleModal.style.top || '10%',
                left: recycleModal.style.left || '15%',
                width: recycleModal.style.width || '70%',
                height: recycleModal.style.height || '80%'
            };
            recycleModal.classList.add('maximized');
            isRecycleMaximized = true;
        } else {
            recycleModal.classList.remove('maximized');
            if (recycleLastRect) {
                recycleModal.style.top = recycleLastRect.top;
                recycleModal.style.left = recycleLastRect.left;
                recycleModal.style.width = recycleLastRect.width;
                recycleModal.style.height = recycleLastRect.height;
            }
            isRecycleMaximized = false;
        }
    };

    // Close
    recycleClose.onclick = () => {
        recycleModal.style.display = 'none';
        isRecycleOpen = false;
        isRecycleMinimized = false;
        isRecycleMaximized = false;
        let btn = document.getElementById('taskbar-btn-recycle');
        if (btn) btn.remove();
    };

    // Make Recycle Bin draggable
    makeDraggable(recycleModal, recycleTitlebar);

    // Hook up desktop icon dblclick to open Recycle Bin
    document.querySelectorAll('.icon').forEach(icon => {
        if (icon.querySelector('span')?.textContent.trim() === 'Recycle Bin') {
            icon.addEventListener('dblclick', () => {
                openRecycleWindow();
            });
        }
    });


    // Projects Modal Logic 
    const projectsIcon = document.getElementById('projects-icon');
    const projectsModal = document.getElementById('projects-modal');
    const projectsTitlebar = document.getElementById('projects-titlebar');
    const projectsMinimize = document.getElementById('projects-minimize');
    const projectsMaximize = document.getElementById('projects-maximize');
    const projectsClose = document.getElementById('projects-close');
    let draggingProjects = false, dragOffsetX2 = 0, dragOffsetY2 = 0;

    makeDraggable(projectsModal, projectsTitlebar);

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

    // RESUME
    document.querySelectorAll('.icon').forEach(icon => {
        if (icon.querySelector('span')?.textContent.trim() === 'Resume') {
            icon.addEventListener('dblclick', () => {
                const resume = document.getElementById('resume-modal');
                resume.style.display = 'block';
                bringToFront(resume);
                addTaskbarButton('🌎 Resume - Google Chrome', resume);
            });
        }
    });

    // Close resume
    document.getElementById('resume-close')?.addEventListener('click', () => {
            document.getElementById('resume-modal').style.display = 'none';
        });

    // RESUME WINDOW CONTROLS
    const resumeModal = document.getElementById('resume-modal');
    const resumeMinimize = document.getElementById('resume-minimize');
    const resumeMaximize = document.getElementById('resume-maximize');
    const resumeClose = document.getElementById('resume-close');

    let isResumeMaximized = false;
    let resumeLastRect = null;  // add this var here

    resumeMaximize.onclick = () => {
        if (!isResumeMaximized) {
            // Save current pos/size before max
            resumeLastRect = {
                top: resumeModal.style.top || '10%',    
                left: resumeModal.style.left || '15%',
                width: resumeModal.style.width || '70%',
                height: resumeModal.style.height || '80%'
            };
            resumeModal.classList.add('maximized');
            isResumeMaximized = true;
        } else {
            resumeModal.classList.remove('maximized');
            if (resumeLastRect) {
                resumeModal.style.top = resumeLastRect.top;
                resumeModal.style.left = resumeLastRect.left;
                resumeModal.style.width = resumeLastRect.width;
                resumeModal.style.height = resumeLastRect.height;
            }
            isResumeMaximized = false;
        }
    };

    // Make a modal draggable by its titlebar
    function makeDraggable(modal, titlebar) {
        if (!modal || !titlebar) return;
        
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        
        titlebar.addEventListener('mousedown', function(e) {
            if (e.target.closest('button')) return; // Don't drag if clicking buttons
            
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

    // make titlebar draggable
    makeDraggable(resumeModal, document.getElementById('resume-titlebar'));

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

    function updateRecycleBin() {
        trashCount.textContent = trashItems.length;

        if (trashItems.length > 0) {
            recycleImg.src = fullBinSrc;
            emptyMsg.style.display = 'none';
            trashItemsContainer.innerHTML = '';
            trashItems.forEach(item => {
                const trashDiv = document.createElement('div');
                trashDiv.className = 'icon';
                trashDiv.innerHTML = `<img src="${item.imgSrc}" style="width:40px;height:40px"><span>${item.name}</span>`;
                trashItemsContainer.appendChild(trashDiv);
            });
        } else {
            recycleImg.src = emptyBinSrc;
            emptyMsg.style.display = 'block';
            trashItemsContainer.innerHTML = '';
        }
    }

    emptyBinBtn.onclick = () => {
        // Restore all icons
        trashItems.forEach(item => {
            icons[item.index].style.display = '';
        });
        trashItems = [];
        updateRecycleBin();
    };
});