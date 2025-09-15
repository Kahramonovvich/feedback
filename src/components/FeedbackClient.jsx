'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, Star, StarHalf, Image as ImageIcon, Phone, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

export default function FeedbackClient({ organizationName, feeds }) {

    const router = useRouter();
    console.log(feeds);


    const [loading, setLoading] = useState(true);
    const [stsLoading, setStsLoading] = useState(false);
    const [err, setErr] = useState('');
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('all');
    const [minRate, setMinRate] = useState('0');
    const [open, setOpen] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (feeds) {
            setLoading(false);
        };
    }, [feeds]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        const needTerm = term.length > 0;
        const needStatus = status !== 'all';
        const min = Number(minRate) || 0;

        return (Array.isArray(feeds) ? feeds : [])
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
            }).sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
    }, [feeds, q, status, minRate]);

    const stats = useMemo(() => {
        const total = feeds.length;
        const avg = total
            ? (feeds.reduce((s, x) => s + (Number(x?.rateStatus) || 0), 0) / total)
            : 0;
        const withImg = feeds.filter(x => x?.file.length).length;
        const newCnt = feeds.filter(x => String(x?.status) === '1').length;
        return { total, avg, withImg, newCnt };
    }, [feeds]);

    const prettyDate = (iso) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return iso; }
    };

    const badgeByStatus = (s) => {
        if (String(s) === '1') return ['bg-amber-100 text-amber-800 border-amber-200', 'Новый'];
        if (String(s) === '2') return ['bg-sky-100 text-sky-800 border-sky-200', 'В процессе'];
        if (String(s) === '3') return ['bg-emerald-100 text-emerald-800 border-emerald-200', 'Отвечен'];
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

    const handleUpdateStatus = async (id, status, message = "") => {

        setStsLoading(true);

        try {
            const res = await axios.put(`/api/Feedback/UpdateStatus?id=${id}&status=${status}${message !== '' ? `&message=${message}` : ''}`);
            if (res.status >= 200 && res.status < 300) {
                toast.success("Статус отзыва обновлён");
                router.refresh();
            };
        } catch (e) {
            console.error(e);
            toast.error("Не удалось обновить статус");
        } finally {
            setComment('');
            setStsLoading(false);
            setOpen(null);
        };
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
                        <option value="1">Новые</option>
                        <option value="2">В процессе</option>
                        <option value="3">Отвеченные</option>
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
                                                <div className="imgBox relative lg:w-40 w-32 lg:h-40 h-32">
                                                    <Image
                                                        fill
                                                        src={'/favicon.ico'}
                                                        alt='No Image'
                                                        unoptimized={true}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-semibold text-slate-900 leading-tight">{item?.fullName || 'Без имени'}</div>
                                                <div className="text-sm capitalize text-slate-500">{item?.organisation || '—'}</div>
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
                    <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-y-scroll h-full lg:overflow-hidden lg:h-auto animate-pop">
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="bg-slate-50 p-3 md:p-4">
                                <div className="w-full h-full relative overflow-hidden rounded-2xl bg-white">
                                    {open?.file.length ? (
                                        <Image
                                            fill
                                            src={open.file[0]}
                                            alt="Фото"
                                            style={{ objectFit: 'cover' }}
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full p-10 flex items-center justify-center text-slate-400">
                                            <div className="imgBox relative w-full h-full lg:w-auto max-h-80 aspect-square">
                                                <Image
                                                    fill
                                                    src={'/favicon.ico'}
                                                    alt='No Image'
                                                    unoptimized={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 md:p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold">{open?.fullName || 'Без имени'}</h3>
                                        <div className="text-sm capitalize text-slate-500">{open?.organisation || '—'}</div>
                                    </div>
                                    <Stars value={open?.rateStatus} size={20} />
                                </div>

                                <div className="box space-y-1">
                                    <div className="text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {prettyDate(open?.createAt)}
                                        </div>
                                    </div>

                                    {open?.updateAt && (
                                        <div className="text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {prettyDate(open?.updateAt)}
                                            </div>
                                        </div>
                                    )}
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

                                {open?.status === 1 && (
                                    <button
                                        className="rounded-xl w-full h-10 px-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white text-sm font-medium shadow hover:opacity-95 active:opacity-90"
                                        onClick={() => handleUpdateStatus(open.id, 2)}
                                        disabled={stsLoading}
                                    >
                                        {!stsLoading ?
                                            "В процессе" : (
                                                <span className='flex items-center justify-center relative'>
                                                    <CircularProgress color='white' size={25} />
                                                </span>
                                            )}
                                    </button>
                                )}
                                {open?.status === 2 && (
                                    <div className="box space-y-4">
                                        <div className="box space-y-2">
                                            <label
                                                htmlFor="comment"
                                                className='text-xs font-medium text-slate-500'
                                            >
                                                Оставьте комментарий
                                            </label>
                                            <textarea
                                                name="comment"
                                                id="comment"
                                                className='border-2 rounded-xl w-full px-3 min-h-20 py-2 text-xs font-medium text-slate-500 outline-none'
                                                onChange={(e) => setComment(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <button
                                            className="rounded-xl w-full h-10 px-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white text-sm font-medium shadow hover:opacity-95 active:opacity-90"
                                            onClick={() => handleUpdateStatus(open.id, 3, comment)}
                                            disabled={stsLoading}
                                        >
                                            Отвечен
                                        </button>
                                    </div>
                                )}
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