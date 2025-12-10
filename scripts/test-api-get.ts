
async function main() {
    console.log('🚀 Testing GET /api/notes...')

    const cookieValue = JSON.stringify({ username: 'admin', role: 'admin' })
    const cookieHeader = `admin_session=${encodeURIComponent(cookieValue)}`

    try {
        const response = await fetch('http://localhost:3000/api/notes', {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader
            }
        })

        console.log(`Response Status: ${response.status} ${response.statusText}`)

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Notes fetched:', data.total)
            data.notes.forEach(n => {
                console.log(`- [${n.id}] ${n.title} (${n.processStatus})`)
                console.log(`  Summary: ${n.summary?.substring(0, 50)}...`)
            })
        } else {
            const errorText = await response.text()
            console.error('❌ API Call Failed:', errorText)
        }

    } catch (error) {
        console.error('❌ Network Error:', error)
    }
}

main()
