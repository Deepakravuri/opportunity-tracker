const mongoose = require('mongoose');

async function checkCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://wanderlust_user:wander123@cluster0.5dksi83.mongodb.net/devfolio_data?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📋 Available collections:");
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check if IndeedJobs exists
    const indeedJobsExists = collections.some(col => col.name === 'indeedjobs');
    console.log(`\n🔍 indeedjobs collection exists: ${indeedJobsExists}`);
    
    if (indeedJobsExists) {
      // Try to get count of documents
      const IndeedJob = mongoose.model("indeedjobs", new mongoose.Schema({}, { strict: false }));
      const count = await IndeedJob.countDocuments();
      console.log(`📊 Number of jobs in indeedjobs: ${count}`);
      
      if (count > 0) {
        const sampleJob = await IndeedJob.findOne().lean();
        console.log("\n📋 Sample job structure:");
        console.log(Object.keys(sampleJob));
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

checkCollections(); 