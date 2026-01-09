async function updateVisitors() {
  try {
    // Notify server of visit
    await fetch("/api/visits", { method: "POST" });

    // Get visit info
    const res = await fetch("/api/visits");
    const data = await res.json();

    document.getElementById("live-users").innerText = `${data.activeUsers} online`;
    document.getElementById("total-users").innerText = `${data.totalVisits} total visits`;
  } catch (err) {
    console.error(err);
  }
}

// Run on page load
updateVisitors();
