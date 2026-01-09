import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio"); // database name
    const collection = db.collection("visits");

    // Increment total visits only on page load (POST)
    if (req.method === "POST") {
      await collection.updateOne(
        { _id: "total" },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    }

    // Get total visits
    const doc = await collection.findOne({ _id: "total" });
    const totalVisits = doc ? doc.count : 0;

    // For online users, we just simulate by counting clients in the last 5 mins
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    await collection.updateOne(
      { _id: "online" },
      { $set: { lastVisit: now } },
      { upsert: true }
    );
    const activeUsers = 1; // simple simulation for MVP

    res.status(200).json({ totalVisits, activeUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
