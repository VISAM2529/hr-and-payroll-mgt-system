const fetch = require('node-fetch');

async function register() {
    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Admin",
                email: "testadmin@example.com",
                password: "password123",
                role: "admin",
                department: "admin"
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (e) {
        console.error(e);
    }
}

register();
