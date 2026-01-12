import { startClock, bringToFront, makeDraggable } from './utils.js';

export function initModals() {
  startClock();

  const appModal = document.getElementById('app-modal');
  const appTitlebar = document.getElementById('app-titlebar');
  const appMinimize = document.getElementById('app-minimize');
  const appMaximize = document.getElementById('app-maximize');
  const appClose = document.getElementById('app-close');
  const taskbarApps = document.getElementById('taskbar-apps');
  let isAppOpen = false;
  let isAppMaximized = false;
  let isAppMinimized = false;
  let lastModalRect = null;

  function addTaskbarButton(title, id = 'taskbar-btn-about') {
    let btn = document.getElementById(id);
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'taskbar-app-btn active';
      btn.id = id;
      btn.textContent = title;
      btn.onclick = function() {
        const modal = document.getElementById('app-modal');
        if (modal.classList.contains('minimized')) {
          modal.classList.remove('minimized'); modal.style.display = 'block';
        } else {
          modal.classList.add('minimized'); modal.style.display = 'none';
        }
      };
      taskbarApps.appendChild(btn);
    } else {
      btn.classList.add('active');
    }
  }

  // Generic taskbar button helper for any modal
  function addTaskbarButtonForModal(title, id, modalId) {
    let btn = document.getElementById(id);
    const modal = document.getElementById(modalId);
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'taskbar-app-btn active';
      btn.id = id;
      btn.textContent = title;
      btn.onclick = function() {
        if (!modal) return;
        if (modal.classList.contains('minimized') || modal.style.display === 'none') {
          modal.classList.remove('minimized');
          modal.style.display = 'block';
          bringToFront(modal);
        } else {
          modal.classList.add('minimized');
          modal.style.display = 'none';
        }
      };
      taskbarApps.appendChild(btn);
    } else {
      btn.classList.add('active');
    }
  }
  // expose helper
  window.addTaskbarButton = addTaskbarButtonForModal;

  function saveModalSizeAndPosition() {
    lastModalRect = { width: appModal.style.width, height: appModal.style.height, left: appModal.style.left, top: appModal.style.top };
  }
  function restoreModalSizeAndPosition() {
    if (lastModalRect) {
      appModal.style.width = lastModalRect.width; appModal.style.height = lastModalRect.height; appModal.style.left = lastModalRect.left; appModal.style.top = lastModalRect.top;
    }
  }

  window.openAppWindow = function(title) {
    appModal.style.display = 'block'; appModal.classList.remove('maximized','minimized'); document.getElementById('app-title').textContent = title; isAppOpen=true; isAppMaximized=false; isAppMinimized=false; restoreModalSizeAndPosition(); if (window.addTaskbarButton) window.addTaskbarButton(title,'taskbar-btn-about','app-modal'); bringToFront(appModal);
  };

  appMinimize?.addEventListener('click', () => { saveModalSizeAndPosition(); appModal.classList.add('minimized'); appModal.style.display = 'none'; isAppMinimized = true; });
  appMaximize?.addEventListener('click', () => { if (!isAppMaximized) { appModal.classList.add('maximized'); isAppMaximized = true; } else { appModal.classList.remove('maximized'); restoreModalSizeAndPosition(); isAppMaximized = false; } });
  appClose?.addEventListener('click', () => { appModal.style.display='none'; isAppOpen=false; let btn=document.getElementById('taskbar-btn-about'); if(btn) btn.remove(); });

  // Recycle modal controls (basic)
  const recycleModal = document.getElementById('recycle-modal');
  const recycleTitlebar = document.getElementById('recycle-titlebar');
  const recycleMinimize = document.getElementById('recycle-minimize');
  const recycleMaximize = document.getElementById('recycle-maximize');
  const recycleClose = document.getElementById('recycle-close');
  let isRecycleMaximized = false;
  let recycleLastRect = null;

  window.openRecycleWindow = function() { recycleModal.style.display='block'; recycleModal.classList.remove('minimized','maximized'); bringToFront(recycleModal); }
  recycleMinimize?.addEventListener('click', () => { recycleModal.classList.add('minimized'); recycleModal.style.display='none'; });
  recycleMaximize?.addEventListener('click', () => { if (!isRecycleMaximized) { recycleLastRect = { top: recycleModal.style.top || '10%', left: recycleModal.style.left || '15%', width: recycleModal.style.width || '70%', height: recycleModal.style.height || '80%' }; recycleModal.classList.add('maximized'); isRecycleMaximized=true; } else { recycleModal.classList.remove('maximized'); if (recycleLastRect) { recycleModal.style.top = recycleLastRect.top; recycleModal.style.left = recycleLastRect.left; recycleModal.style.width = recycleLastRect.width; recycleModal.style.height = recycleLastRect.height; } isRecycleMaximized=false; } });
  recycleClose?.addEventListener('click', () => { recycleModal.style.display='none'; let btn=document.getElementById('taskbar-btn-recycle'); if (btn) btn.remove(); });

  // Projects and Resume openers will be used by desktop-icons when dblclicked
  window.openProjectsWindow = function() { const projectsModal = document.getElementById('projects-modal'); projectsModal.style.display='block'; projectsModal.classList.remove('minimized','maximized'); if (window.addTaskbarButton) window.addTaskbarButton('📂 Projects','taskbar-btn-projects','projects-modal'); bringToFront(projectsModal); };
  window.openResumeWindow = function() { const resume = document.getElementById('resume-modal'); resume.style.display='block'; if (window.addTaskbarButton) window.addTaskbarButton('🌎 Resume - Google Chrome','taskbar-btn-resume','resume-modal'); bringToFront(resume); };
  window.openGithubWindow = function() { const g = document.getElementById('github-modal'); if (g) { g.style.display='block'; g.classList.remove('minimized','maximized'); if (window.addTaskbarButton) window.addTaskbarButton('GitHub - DeylAlrt','taskbar-btn-github','github-modal'); bringToFront(g); } };
  window.openContactWindow = function() { const c = document.getElementById('whatsapp-overlay'); if (c) { c.style.display='block'; if (window.addTaskbarButton) window.addTaskbarButton('📞 Contact','taskbar-btn-contact','whatsapp-overlay'); bringToFront(c); } };
  // Projects controls
  const projectsModal = document.getElementById('projects-modal');
  const projectsTitlebar = document.getElementById('projects-titlebar');
  const projectsMinimize = document.getElementById('projects-minimize');
  const projectsMaximize = document.getElementById('projects-maximize');
  const projectsClose = document.getElementById('projects-close');
  let projectsWasMaximized = false;
  let projectsLastRect = null;

  projectsMinimize?.addEventListener('click', () => { projectsModal.classList.add('minimized'); projectsModal.style.display='none'; });
  projectsMaximize?.addEventListener('click', () => {
    if (!projectsWasMaximized) {
      projectsLastRect = { top: projectsModal.style.top || '5%', left: projectsModal.style.left || '10%', width: projectsModal.style.width || '80%', height: projectsModal.style.height || '85%' };
      projectsModal.classList.add('maximized');
      projectsWasMaximized = true;
    } else {
      projectsModal.classList.remove('maximized');
      if (projectsLastRect) {
        projectsModal.style.top = projectsLastRect.top; projectsModal.style.left = projectsLastRect.left; projectsModal.style.width = projectsLastRect.width; projectsModal.style.height = projectsLastRect.height;
      }
      projectsWasMaximized = false;
    }
  });
  projectsClose?.addEventListener('click', () => { projectsModal.style.display='none'; let btn = document.getElementById('taskbar-btn-projects'); if (btn) btn.remove(); });

  // Resume controls
  const resumeModal = document.getElementById('resume-modal');
  const resumeMinimize = document.getElementById('resume-minimize');
  const resumeMaximize = document.getElementById('resume-maximize');
  const resumeClose = document.getElementById('resume-close');
  let isResumeMaximized = false;
  let resumeLastRect = null;

  resumeMinimize?.addEventListener('click', () => { resumeModal.classList.add('minimized'); resumeModal.style.display='none'; });
  resumeMaximize?.addEventListener('click', () => {
    if (!isResumeMaximized) {
      resumeLastRect = { top: resumeModal.style.top || '10%', left: resumeModal.style.left || '15%', width: resumeModal.style.width || '70%', height: resumeModal.style.height || '80%' };
      resumeModal.classList.add('maximized');
      isResumeMaximized = true;
    } else {
      resumeModal.classList.remove('maximized');
      if (resumeLastRect) {
        resumeModal.style.top = resumeLastRect.top; resumeModal.style.left = resumeLastRect.left; resumeModal.style.width = resumeLastRect.width; resumeModal.style.height = resumeLastRect.height;
      }
      isResumeMaximized = false;
    }
  });
  resumeClose?.addEventListener('click', () => { resumeModal.style.display='none'; let btn=document.getElementById('taskbar-btn-resume'); if (btn) btn.remove(); });

  // GitHub modal controls
  const githubModal = document.getElementById('github-modal');
  const githubTitlebar = document.getElementById('github-titlebar');
  const githubMinimize = document.getElementById('github-minimize');
  const githubMaximize = document.getElementById('github-maximize');
  const githubClose = document.getElementById('github-close');
  let isGithubMaximized = false;
  let githubLastRect = null;

  githubMinimize?.addEventListener('click', () => { githubModal.classList.add('minimized'); githubModal.style.display='none'; });
  githubMaximize?.addEventListener('click', () => {
    if (!isGithubMaximized) {
      githubLastRect = { top: githubModal.style.top || '5%', left: githubModal.style.left || '10%', width: githubModal.style.width || '80%', height: githubModal.style.height || '85%' };
      githubModal.classList.add('maximized');
      isGithubMaximized = true;
    } else {
      githubModal.classList.remove('maximized');
      if (githubLastRect) { githubModal.style.top = githubLastRect.top; githubModal.style.left = githubLastRect.left; githubModal.style.width = githubLastRect.width; githubModal.style.height = githubLastRect.height; }
      isGithubMaximized = false;
    }
  });
  githubClose?.addEventListener('click', () => { githubModal.style.display='none'; let btn=document.getElementById('taskbar-btn-github'); if (btn) btn.remove(); });

  // Make titlebars draggable
  makeDraggable(appModal, appTitlebar);
  makeDraggable(recycleModal, recycleTitlebar);
  makeDraggable(projectsModal, projectsTitlebar);
  makeDraggable(resumeModal, document.getElementById('resume-titlebar'));
  makeDraggable(githubModal, githubTitlebar);

  // Ensure clicking any modal brings it to front
  const allModals = document.querySelectorAll('.app-modal');
  allModals.forEach(m => {
    m.addEventListener('mousedown', () => bringToFront(m));
  });
  // also bring whatsapp overlay to front when clicked (contact)
  const whatsapp = document.getElementById('whatsapp-overlay');
  if (whatsapp) whatsapp.addEventListener('mousedown', () => bringToFront(whatsapp));
  // close button inside whatsapp overlay removes taskbar button
  const contactCloseBtn = document.getElementById('close-modal-btn');
  contactCloseBtn?.addEventListener('click', () => {
    const w = document.getElementById('whatsapp-overlay');
    if (w) w.style.display = 'none';
    const btn = document.getElementById('taskbar-btn-contact'); if (btn) btn.remove();
  });

  return { openAppWindow: window.openAppWindow, openRecycleWindow: window.openRecycleWindow };
}
