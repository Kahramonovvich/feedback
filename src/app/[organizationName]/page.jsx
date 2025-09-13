'use client';
import { use, useEffect, useMemo, useState } from 'react';
import { Search, Star, StarHalf, Image as ImageIcon, Phone, Calendar, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function Page({ params }) {

    const resolvedParams = use(params);
    const organizationName = resolvedParams.organizationName;

    const FEEDBACK_URL =
        `https://perfettofood.uz/api/Feedback/GetAllWhithOrganisation?Name=${encodeURIComponent(organizationName || '')}`;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('all');
    const [minRate, setMinRate] = useState('0');
    const [open, setOpen] = useState(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setErr('');
                const res = await fetch(FEEDBACK_URL, { cache: 'no-store' });
                const okJson = res.headers.get('content-type')?.includes('application/json');
                const payload = okJson ? await res.json() : [];
                if (!res.ok) throw new Error(typeof payload === 'string' ? payload : (payload?.message || `HTTP ${res.status}`));
                if (alive) setData(Array.isArray(payload) ? payload : (payload?.result || []));
            } catch (e) {
                if (alive) setErr(e?.message || 'Не удалось загрузить отзывы');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [FEEDBACK_URL]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        const needTerm = term.length > 0;
        const needStatus = status !== 'all';
        const min = Number(minRate) || 0;

        return (Array.isArray(data) ? data : [])
            .filter(it => {
                const stOk = !needStatus
                    ? true
                    : String(it?.status) === status;

                const rateOk = (Number(it?.rateStatus) || 0) >= min;

                const haystack = [
                    it?.fullName,
                    it?.phoneNumber,
                    it?.description,
                    it?.organisation,
                    it?.responseMessage,
                ].join(' ').toLowerCase();

                const qOk = !needTerm || haystack.includes(term);

                return stOk && rateOk && qOk;
            });
    }, [data, q, status, minRate]);

    const stats = useMemo(() => {
        const total = data.length;
        const avg = total
            ? (data.reduce((s, x) => s + (Number(x?.rateStatus) || 0), 0) / total)
            : 0;
        const withImg = data.filter(x => x?.file.length).length;
        const newCnt = data.filter(x => String(x?.status) === '0').length;
        return { total, avg, withImg, newCnt };
    }, [data]);

    const prettyDate = (iso) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return iso; }
    };

    const badgeByStatus = (s) => {
        if (String(s) === '0') return ['bg-amber-100 text-amber-800 border-amber-200', 'Новый'];
        if (String(s) === '1') return ['bg-emerald-100 text-emerald-800 border-emerald-200', 'Отвечен'];
        return ['bg-slate-100 text-slate-700 border-slate-200', 'Неизвестно'];
    };

    const Stars = ({ value = 0, size = 18 }) => {
        const v = Math.max(0, Math.min(5, Number(value) || 0));
        const full = Math.floor(v);
        const half = v - full >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} size={size} className="fill-yellow-400 text-yellow-400" />)}
                {half ? <StarHalf size={size} className="fill-yellow-400 text-yellow-400" /> : null}
                {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} size={size} className="text-slate-300" />)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div className="mx-auto max-w-6xl px-4 pt-10 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Отзывы — <span className="bg-gradient-to-r from-fuchsia-600 to-blue-600 bg-clip-text text-transparent uppercase">{organizationName || '—'}</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Собранные сообщения клиентов с оценками, фото и временем создания.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Stat label="Всего" value={stats.total} icon={<CheckCircle2 className="w-4 h-4" />} />
                        <Stat label="Средняя оценка" value={stats.avg.toFixed(1)} icon={<Star className="w-4 h-4" />} />
                        <Stat label="С фото" value={stats.withImg} icon={<ImageIcon className="w-4 h-4" />} />
                        <Stat label="Новые" value={stats.newCnt} accent icon={<AlertCircle className="w-4 h-4" />} />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:gap-5 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Поиск: имя, телефон, текст…"
                            className="w-full pl-10 pr-3 h-11 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm outline-none focus:ring-2 ring-offset-0 ring-blue-500 transition"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="h-11 rounded-2xl border border-slate-200 bg-white/70 px-3 outline-none focus:ring-2 ring-blue-500"
                    >
                        <option value="all">Все статусы</option>
                        <option value="0">Новые</option>
                        <option value="1">Отвеченные</option>
                    </select>
                    <select
                        value={minRate}
                        onChange={e => setMinRate(e.target.value)}
                        className="h-11 rounded-2xl border border-slate-200 bg-white/70 px-3 outline-none focus:ring-2 ring-blue-500"
                    >
                        <option value="0">Минимальная оценка: любая</option>
                        <option value="1">от 1</option>
                        <option value="2">от 2</option>
                        <option value="3">от 3</option>
                        <option value="4">от 4</option>
                        <option value="5">только 5</option>
                    </select>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-16">
                {loading ? (
                    <SkeletonGrid />
                ) : err ? (
                    <div className="flex items-center gap-2 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
                        <AlertCircle className="w-5 h-5" /> {err}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
                        Ничего не нашлось. Попробуй изменить фильтры.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(item => {
                            const [badgeCls, badgeText] = badgeByStatus(item?.status);
                            return (
                                <div
                                    key={item?.id ?? Math.random()}
                                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all"
                                >
                                    <div className="aspect-[16/9] bg-slate-100 overflow-hidden relative">
                                        {item?.file.length ? (
                                            <Image
                                                fill
                                                src={item?.file[0]}
                                                alt={item?.description || 'Фото отзыва'}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                                                onClick={() => setOpen(item)}
                                                loading="lazy"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-semibold text-slate-900 leading-tight">{item?.fullName || 'Без имени'}</div>
                                                <div className="text-sm text-slate-500">{item?.organisation || '—'}</div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${badgeCls}`}>
                                                {badgeText}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Stars value={item?.rateStatus} />
                                            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                {prettyDate(item?.createAt)}
                                            </span>
                                        </div>

                                        {item?.description ? (
                                            <p className="text-sm text-slate-700 line-clamp-3">{item.description}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">Без текста</p>
                                        )}

                                        <div className="flex items-center justify-between pt-1">
                                            <a
                                                href={item?.phoneNumber ? `tel:${item.phoneNumber}` : '#'}
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 h-10 hover:bg-slate-50 transition"
                                            >
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{item?.phoneNumber || '—'}</span>
                                            </a>

                                            <button
                                                onClick={() => setOpen(item)}
                                                className="rounded-xl h-10 px-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white text-sm font-medium shadow hover:opacity-95 active:opacity-90"
                                            >
                                                Открыть
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setOpen(null)} />
                    <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-pop">
                        <button
                            onClick={() => setOpen(null)}
                            className="absolute right-3 top-3 p-2 rounded-full hover:bg-slate-100"
                            aria-label="Закрыть"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="bg-slate-50 p-3 md:p-4">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                                    {open?.file ? (
                                        <img src={open.file} alt="Фото" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <ImageIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 md:p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold">{open?.fullName || 'Без имени'}</h3>
                                        <div className="text-sm text-slate-500">{open?.organisation || '—'}</div>
                                    </div>
                                    <Stars value={open?.rateStatus} size={20} />
                                </div>

                                <div className="text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {prettyDate(open?.createAt)}
                                    </div>
                                </div>

                                {open?.description && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Сообщение клиента</div>
                                        <p className="mt-1 text-slate-800">{open.description}</p>
                                    </div>
                                )}

                                {open?.responseMessage && (
                                    <div className="border-t pt-4">
                                        <div className="text-xs font-medium text-slate-500">Ответ</div>
                                        <p className="mt-1 text-slate-800">{open.responseMessage}</p>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <a
                                        href={open?.phoneNumber ? `tel:${open.phoneNumber}` : '#'}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 h-11 hover:bg-slate-50 transition"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{open?.phoneNumber || '—'}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <style jsx global>{`
        .animate-pop { animation: pop .18s ease-out; }
        @keyframes pop { from { transform: translateY(8px) scale(.98); opacity: 0 } to { transform: none; opacity: 1 } }
        .animate-fade-in { animation: fade .2s ease-out; }
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
        </div>
    );
}

function Stat({ label, value, icon, accent }) {
    return (
        <div className={`rounded-2xl border px-3 py-2 flex items-center gap-2 ${accent ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white/70'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {icon}
            </div>
            <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="font-bold">{value}</div>
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="aspect-[16/9] bg-slate-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                            <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                </div>
            ))}
            <div className="col-span-full flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Загружаем…
            </div>
        </div>
    );
};