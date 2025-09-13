import { NextResponse } from 'next/server';
import axios from 'axios';
import { revalidateTag } from 'next/cache';

const BASE_URL = 'https://perfettofood.uz';

export async function PUT(req) {
    try {
        const url = new URL(req.url);
        const fromQuery = {
            id: url.searchParams.get('id'),
            status: url.searchParams.get('status'),
            message: url.searchParams.get('message'),
        };

        let body = {};
        try { body = await req.json(); } catch { }

        const id = fromQuery.id;
        const status = fromQuery.status;
        const message = fromQuery.message;

        if (!id || !status) {
            return NextResponse.json(
                { error: true, message: 'Нужны параметры id и status' },
                { status: 400 }
            );
        }

        const backendUrl = `${BASE_URL}/api/Feedback/UpdateStatus?id=${id}&status=${status}&message=${message}`;

        const { data, status: code } = await axios.put(backendUrl, null,
            { headers: { Accept: 'application/json' }, validateStatus: () => true, }
        );

        revalidateTag("feeds");

        return NextResponse.json(
            data ?? { ok: code >= 200 && code < 300 },
            { status: code || 200 }
        );
    } catch (err) {
        const code = err?.response?.status || 500;
        const msg =
            err?.response?.data?.message ||
            err?.message ||
            'Unknown error';
        return NextResponse.json({ error: true, message: msg }, { status: code });
    };
};