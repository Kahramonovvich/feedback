const BASE_URL = 'http://45.138.158.239:7868/api';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const res = await fetch(`${BASE_URL}/api/Feedback/Create`, {
            method: 'POST',
            body: formData,
        });

        const result = await res.json();

        if (result.ok) {
            console.log('Yuborildi');
        } else {
            console.error(result);
            console.error(res);
        };

        return Response.json(result);
    } catch (error) {
        console.error('Izoh yaratishda xatolik:', error);
        return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
            status: 500,
        });
    };
};