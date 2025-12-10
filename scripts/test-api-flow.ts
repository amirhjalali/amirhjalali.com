
async function main() {
    console.log('🚀 Testing API Endpoint directly...')

    const cookieValue = JSON.stringify({ username: 'admin', role: 'admin' })
    const cookieHeader = `admin_session=${encodeURIComponent(cookieValue)}`

    try {
        const response = await fetch('http://localhost:3000/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
            },
            body: JSON.stringify({
                type: 'LINK',
                content: 'https://linear.app/docs',
                title: 'API Test Note via Fetch',
                tags: ['api-test'],
                autoProcess: true
            })
        })

        console.log(`Response Status: ${response.status} ${response.statusText}`)

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Note created successfully via API:', data)
        } else {
            const errorText = await response.text()
            console.error('❌ API Call Failed:', errorText)
        }

    } catch (error) {
        console.error('❌ Network Error:', error)
    }
}

main()
