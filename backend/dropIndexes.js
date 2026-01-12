import { config } from "dotenv";
import mongoose from "mongoose";

// Load environment variables
config({ path: "./config/config.env" });

async function dropDuplicateIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    const db = mongoose.connection.db;
    
    // Collections to clean
    const collections = ["users", "messages", "conversations", "otps"];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        
        console.log(`\n📋 ${collectionName} indexes:`, indexes.map(i => i.name));
        
        // Drop all indexes except _id_
        for (const index of indexes) {
          if (index.name !== "_id_") {
            await collection.dropIndex(index.name);
            console.log(`  ✓ Dropped: ${index.name}`);
          }
        }
      } catch (err) {
        console.log(`  ⚠ Collection ${collectionName} doesn't exist or error: ${err.message}`);
      }
    }
    
    console.log("\n✅ All duplicate indexes dropped!");
    console.log("🔄 Restart your server - Mongoose will recreate clean indexes\n");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

dropDuplicateIndexes();
