import { makeDraggable } from './utils.js';

export function initDesktopIcons() {
  const icons = Array.from(document.querySelectorAll('.desktop-icons .icon'));
  const gridX = 32;
  const gridY = 32;
  const cellWidth = 80;
  const cellHeight = 109;
  const taskbar = document.querySelector('.taskbar');
  const desktopHeight = window.innerHeight - (taskbar ? taskbar.offsetHeight : 48) - gridY;
  const desktopWidth = window.innerWidth - gridX;
  const cols = Math.floor(desktopWidth / cellWidth);
  const rows = Math.max(1, Math.floor(desktopHeight / cellHeight));

  let gridMap = Array(cols * rows).fill(null);
  let trashItems = [];

  const recycleIcon = document.getElementById('recycle-icon');
  const recycleImg = document.getElementById('recycle-img');
  const recycleModal = document.getElementById('recycle-modal');
  const trashCount = document.getElementById('trash-count');
  const trashItemsContainer = document.getElementById('trash-items');
  const emptyBinBtn = document.getElementById('empty-bin');
  const emptyMsg = document.getElementById('empty-trash-msg');
  const emptyBinSrc = 'https://img.icons8.com/?size=100&id=LjNe156kndXS&format=png&color=000000';
  const fullBinSrc = 'https://img.icons8.com/?size=100&id=8usOzL0PIrcw&format=png&color=000000';

  // initial placement
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

  function updateRecycleBin() {
    if (!trashCount) return;
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

  // initialize recycle UI
  updateRecycleBin();

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
        const recycleRect = recycleIcon.getBoundingClientRect();
        const iconRect = icon.getBoundingClientRect();
        const iconCenterX = iconRect.left + iconRect.width / 2;
        const iconCenterY = iconRect.top + iconRect.height / 2;
        const label = icon.querySelector('span').textContent.trim();
        if (iconCenterX > recycleRect.left && iconCenterX < recycleRect.right && iconCenterY > recycleRect.top && iconCenterY < recycleRect.bottom && label !== 'Recycle Bin') {
          icon.style.display = 'none';
          trashItems.push({ name: label, imgSrc: icon.querySelector('img').src, index: icons.indexOf(icon) });
          updateRecycleBin();
        } else {
          let newCol = Math.round((parseInt(icon.style.left) - gridX) / cellWidth);
          let newRow = Math.round((parseInt(icon.style.top) - gridY) / cellHeight);
          newCol = Math.max(0, Math.min(cols - 1, newCol));
          newRow = Math.max(0, Math.min(rows - 1, newRow));
          icon.style.left = `${gridX + newCol * cellWidth}px`;
          icon.style.top = `${gridY + newRow * cellHeight}px`;
          icon.dataset.gridCol = newCol;
          icon.dataset.gridRow = newRow;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // highlight & dblclick
    icon.addEventListener('click', function() { icons.forEach(ic => ic.classList.remove('icon-selected', 'icon-opened')); icon.classList.add('icon-selected'); });
    icon.addEventListener('dblclick', function() {
      icons.forEach(ic => ic.classList.remove('icon-opened'));
      icon.classList.add('icon-opened');
      setTimeout(() => icon.classList.remove('icon-opened'), 400);
      const label = icon.querySelector('span').textContent.trim();
      if (label === 'About me') {
        if (typeof window.openAppWindow === 'function') window.openAppWindow('📘 About Me - Notepad');
        else document.getElementById('app-modal')?.classList.add('open-trigger');
      }
      if (label === 'Projects') {
        if (typeof window.openProjectsWindow === 'function') window.openProjectsWindow();
        else document.getElementById('projects-modal')?.classList.add('open-trigger');
      }
      if (label === 'Resume') {
        if (typeof window.openResumeWindow === 'function') window.openResumeWindow();
        else document.getElementById('resume-modal')?.classList.add('open-trigger');
      }
      if (label === 'Recycle Bin') {
        if (typeof window.openRecycleWindow === 'function') window.openRecycleWindow();
        else document.getElementById('recycle-modal')?.classList.add('open-trigger');
      }
      if (label === 'Contact') {
        if (typeof window.openContactWindow === 'function') window.openContactWindow();
      }
    });
  });

  // hook double-clicks from flags applied above
  document.addEventListener('click', (e) => {
    // remove selections when clicking outside
    if (!e.target.closest('.icon')) icons.forEach(ic => ic.classList.remove('icon-selected'));
  });

  emptyBinBtn?.addEventListener('click', () => {
    trashItems.forEach(item => { const ico = icons[item.index]; if (ico) ico.style.display = ''; });
    trashItems = [];
    updateRecycleBin();
  });

  // make recycle and other modals draggable by their titlebars
  makeDraggable(document.getElementById('recycle-modal'), document.getElementById('recycle-titlebar'));
  makeDraggable(document.getElementById('projects-modal'), document.getElementById('projects-titlebar'));
  makeDraggable(document.getElementById('app-modal'), document.getElementById('app-titlebar'));
  makeDraggable(document.getElementById('resume-modal'), document.getElementById('resume-titlebar'));

  // Expose updateRecycleBin for other modules if needed
  return { updateRecycleBin };
}
