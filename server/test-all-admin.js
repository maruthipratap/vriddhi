import fetch from 'node-fetch'

async function runTests() {
  console.log('--- STARTING DEEP TEST ---')
  try {
    // 1. Login
    console.log('Logging in as admin...')
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@vriddhi.in', password: 'Admin@123' })
    })
    
    if (!loginRes.ok) {
        console.error('❌ Login Failed', loginRes.status, await loginRes.text())
        return
    }
    const loginData = await loginRes.json()
    const token = loginData.data.accessToken
    console.log('✅ Logged in successfully.')
    
    // 2. Fetch Stats
    console.log('\nFetching /admin/stats...')
    const statsRes = await fetch('http://localhost:5000/api/v1/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`Stats Status: ${statsRes.status}`)
    if (statsRes.status !== 200) console.log(await statsRes.text())

    // 3. Fetch Verifications
    console.log('\nFetching /admin/verifications...')
    const verifyRes = await fetch('http://localhost:5000/api/v1/admin/verifications?status=all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`Verifications Status: ${verifyRes.status}`)
    if (verifyRes.status !== 200) console.log(await verifyRes.text())

    // 4. Fetch Users
    console.log('\nFetching /admin/users...')
    const usersRes = await fetch('http://localhost:5000/api/v1/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`Users Status: ${usersRes.status}`)
    if (usersRes.status !== 200) console.log(await usersRes.text())

    // 5. Fetch Orders
    console.log('\nFetching /admin/orders...')
    const ordersRes = await fetch('http://localhost:5000/api/v1/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`Orders Status: ${ordersRes.status}`)
    if (ordersRes.status !== 200) console.log(await ordersRes.text())

  } catch (err) {
    console.error('❌ CRITICAL ERROR:', err)
  } finally {
      console.log('--- TEST COMPLETE ---')
      process.exit(0)
  }
}

runTests()
