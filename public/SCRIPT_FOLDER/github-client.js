import { getLangColor } from './utils.js';

export async function initGithubClient() {
  const githubIcon = document.getElementById('github-icon');
  const githubModal = document.getElementById('github-modal');
  const reposGrid = document.getElementById('github-repos-grid');

  // fetchRepos: call server proxy `/api/github/repos/:username` and
  // return an object `{ data: [...] }` on success or `{ error: 'msg' }` on failure
  async function fetchRepos(username = 'DeylAlrt') {
    try {
      const res = await fetch(`/api/github/repos/${encodeURIComponent(username)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = body && body.message ? body.message : `HTTP ${res.status}`;
        console.error('GitHub API error', res.status, body);
        return { error: msg, status: res.status };
      }
      if (!Array.isArray(body)) {
        return { error: body?.message || 'Unexpected API response', status: res.status };
      }
      return { data: body };
    } catch (err) {
      console.error('Failed to load repos', err);
      return { error: err.message };
    }
  }

  // renderRepos: render repo list into the `github-repos-grid` element
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

  // refreshRepos: fetch and display repos; falls back to direct GitHub API if proxy fails
  async function refreshRepos(username = 'DeylAlrt') {
    if (!reposGrid) return;
    reposGrid.innerHTML = '<div style="color:#999; padding:20px;">Loading…</div>';
    const result = await fetchRepos(username);
    if (result.error) {

      try {
        const fallbackRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`);
        if (fallbackRes.ok) {
          const body = await fallbackRes.json();
          renderRepos(body || []);
          if (!body || body.length === 0) reposGrid.innerHTML = '<div style="color:#999; padding:20px;">No public repositories found.</div>';
          return;
        }
      } catch (e) {
        // ignore fallback error
      }
      reposGrid.innerHTML = `<div style="color:#e55353; padding:20px;">Error: ${result.error}</div>`;
      return;
    }
    const repos = result.data || [];
    if (repos.length === 0) {
      reposGrid.innerHTML = '<div style="color:#999; padding:20px;">No public repositories found.</div>';
      return;
    }
    renderRepos(repos);
  }

  // expose a global helper so modals or other controls can refresh repos when opening
  // Usage: `window.fetchGithubRepos('username')`
  window.fetchGithubRepos = refreshRepos;

  githubIcon?.addEventListener('dblclick', async () => {
    if (typeof window.openGithubWindow === 'function') window.openGithubWindow();
    else githubModal.style.display = 'block';
    if (typeof window.addTaskbarButton === 'function') window.addTaskbarButton('GitHub - DeylAlrt','taskbar-btn-github','github-modal');
    await refreshRepos('DeylAlrt');
  });

  // style improvements via simple CSS-in-JS for repo-card
  const style = document.createElement('style');
  style.textContent = `
    .repo-card { display:block; padding:12px; border-radius:8px; background:#f6f8fa; width: 100%; height:30%; color:#0b1226; text-decoration:none; border:1px solid rgba(3,102,214,0.06); }
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
