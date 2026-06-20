const http = require('http');

async function checkRoute(path, method = 'GET', body = null, token = null) {
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: path,
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        
        req.on('error', (e) => resolve({ status: 500, error: e.message }));
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- STARTING QA AUDIT ---');
    let adminToken = '';
    
    // 1. Test Login
    console.log('Testing Authentication (POST /api/login)...');
    const loginRes = await checkRoute('/api/login', 'POST', {
        email: 'admin@example.com',
        password: 'password'
    });
    
    if (loginRes.status === 200) {
        console.log('✅ Login Successful');
        const data = JSON.parse(loginRes.body);
        adminToken = data.token;
    } else {
        console.error(`❌ Login Failed: ${loginRes.status}`);
        console.log(loginRes.body);
        return;
    }

    // 2. Test Admin Dashboard Endpoints
    const routes = [
        '/api/admin/stats',
        '/api/admin/users',
        '/api/admin/audit-logs',
        '/api/patients',
        '/api/appointments',
        '/api/prescriptions',
        '/api/messages/inbox'
    ];

    let passed = 0;
    let failed = 0;

    for (const route of routes) {
        console.log(`\nTesting ${route}...`);
        const res = await checkRoute(route, 'GET', null, adminToken);
        if (res.status === 200) {
            console.log(`✅ OK (200)`);
            passed++;
        } else {
            console.error(`❌ FAILED (${res.status})`);
            console.error(res.body.substring(0, 500)); // Print first 500 chars of error
            failed++;
        }
    }

    console.log('\n--- QA AUDIT SUMMARY ---');
    console.log(`Total Routes Tested: ${routes.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    if (failed === 0) {
        console.log('\n🎉 System is stable and ready for production!');
    }
}

runTests();
