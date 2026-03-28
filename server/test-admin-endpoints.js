import fetch from 'node-fetch';

async function testAdmin() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@vriddhi.in', password: 'Admin@123' })
    });
    
    if (!loginRes.ok) {
        console.error('Login Failed', await loginRes.text());
        return;
    }
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    console.log('Logged in successfully. Token obtained.');
    
    // 2. Fetch Stats
    const statsRes = await fetch('http://localhost:5000/api/v1/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stats Response:', statsRes.status, await statsRes.text());

    // 3. Fetch Verifications
    const verifyRes = await fetch('http://localhost:5000/api/v1/admin/verifications?status=all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Verifications Response:', verifyRes.status, await verifyRes.text());

  } catch (err) {
    console.error(err);
  } finally {
      process.exit(0);
  }
}

testAdmin();
