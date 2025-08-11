const axios = require('axios');

async function testJobsAPI() {
  try {
    console.log('🧪 Testing jobs API...');
    const response = await axios.get('http://localhost:5000/api/jobs/all');
    console.log('✅ Jobs API response:', response.status);
    console.log('📊 Number of jobs found:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('📋 Sample job:', response.data[0]);
    } else {
      console.log('❌ No jobs found in the database');
    }
  } catch (error) {
    console.error('❌ Jobs API error:', error.response?.data || error.message);
  }
}

testJobsAPI(); 