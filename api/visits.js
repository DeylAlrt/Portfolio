let totalVisits = 0;
let activeUsers = 0;

export default function handler(req, res) {
  totalVisits++;
  activeUsers++;

  // user considered "online" for 30 seconds
  setTimeout(() => {
    activeUsers = Math.max(activeUsers - 1, 0);
  }, 30000);

  res.status(200).json({
    totalVisits,
    activeUsers
  });
}
