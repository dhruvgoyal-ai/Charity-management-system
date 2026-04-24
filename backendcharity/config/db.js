const mongoose = require("mongoose");

const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI environment variable is not defined.");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 20000,
        family: 4,              // IPv4 only — avoids IPv6 routing issues
        maxPoolSize: 10,        // Connection pool
        retryWrites: true,      // Retry failed writes
        retryReads: true,       // Retry failed reads
        heartbeatFrequencyMS: 10000, // Check server health every 10s
      });

      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

      // ── Event listeners (registered once after first successful connect) ──
      mongoose.connection.on("error", (err) => {
        console.error(`❌ MongoDB error: ${err.message}`);
      });
      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected — Mongoose will auto-reconnect.");
      });
      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected.");
      });

      return; // success — exit loop
    } catch (error) {
      console.error(
        `❌ MongoDB connect attempt ${attempt}/${MAX_RETRIES}: ${error.message.split("\n")[0]}`
      );
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s…`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("❌ All MongoDB connection attempts exhausted. Exiting.");
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
