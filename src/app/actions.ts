'use server'

export async function syncOrderToGoogleSheets(data: {
    book_title: string
    full_name: string
    phone: string
}) {
    const sheetsUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL

    if (!sheetsUrl) {
        console.error('GOOGLE_SHEETS_URL is not defined in environment variables')
        return { success: false, error: 'Configuration error' }
    }

    try {
        const response = await fetch(sheetsUrl, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Google Sheets Sync Error Details:', {
                status: response.status,
                url: sheetsUrl.substring(0, 30) + '...',
                errorPreview: errorText.substring(0, 200)
            })
            return { success: false, error: `Google returned ${response.status}` }
        }

        return { success: true }
    } catch (err) {
        console.error('Google Sheets sync error:', err)
        return { success: false, error: 'Network or server error' }
    }
}
