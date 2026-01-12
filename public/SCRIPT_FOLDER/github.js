import { getLangColor } from './utils.js';

export async function initGithubClient() {
  const githubIcon = document.getElementById('github-icon');
  const githubModal = document.getElementById('github-modal');
  const reposGrid = document.getElementById('github-repos-grid');

  async function fetchRepos(username = 'DeylAlrt') {
    try {
      const res = await fetch(`/api/github/repos/${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch repos', err);
      return [];
    }
  }

  function renderRepos(repos) {
    if (!reposGrid) return;
    reposGrid.innerHTML = '';
    repos.forEach(r => {
      const el = document.createElement('a');
      el.className = 'repo-card';
      el.href = r.html_url || '#';
      el.target = '_blank';
      el.innerHTML = `
        <div class="repo-name">${r.name}</div>
        <div class="repo-desc">${r.description || ''}</div>
        <div class="repo-meta"><span class="lang-dot" style="background:${getLangColor(r.language)}"></span> ${r.language || ''}</div>
      `;
      reposGrid.appendChild(el);
    });
  }

  githubIcon?.addEventListener('dblclick', async () => {
    if (typeof window.openGithubWindow === 'function') window.openGithubWindow();
    else githubModal.style.display = 'block';
    if (typeof window.addTaskbarButton === 'function') window.addTaskbarButton('GitHub - DeylAlrt','taskbar-btn-github','github-modal');
    const repos = await fetchRepos('DeylAlrt');
    renderRepos(repos);
    // ensure repos grid has nicer UI when empty
    if (!repos || repos.length === 0) {
      reposGrid.innerHTML = '<div style="color:#999; padding:20px;">No public repositories found.</div>';
    }
  });

  // style improvements via simple CSS-in-JS for repo-card
  const style = document.createElement('style');
  style.textContent = `
    .repo-card { display:block; padding:12px; border-radius:8px; background:#f6f8fa; color:#0b1226; text-decoration:none; border:1px solid rgba(3,102,214,0.06); }
    .repo-card:hover { box-shadow:0 6px 18px rgba(11,18,38,0.08); transform:translateY(-2px); }
    .repo-name { font-weight:700; color:#0366d6; margin-bottom:6px; }
    .repo-desc { color:#57606a; font-size:13px; margin-bottom:8px; }
    .repo-meta { font-size:12px; color:#6a737d; display:flex; align-items:center; gap:8px; }
    .lang-dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
  `;
  document.head.appendChild(style);

  // auto init if modal present
  return { fetchRepos, renderRepos };
}
