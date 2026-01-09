async function loadAnalytics() {
  const res = await fetch('/api/analytics');
  const data = await res.json();

  document.getElementById('live-users').innerText =
    `${data.activeUsers} online`;

  document.getElementById('total-users').innerText =
    `${data.totalVisits} total visits`;
}

loadAnalytics();
setInterval(loadAnalytics, 15000); // refresh every 15s
