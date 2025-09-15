import FeedbackClient from "@/components/FeedbackClient";

export default async function Page({ params }) {

    const { organizationName } = await params;
    const FEEDBACK_URL = `https://perfettofood.uz/api/Feedback/GetAllWhithOrganisation?Name=${encodeURIComponent(organizationName || '')}`;

    let feeds = [];
    try {
        const res = await fetch(FEEDBACK_URL, {
            next: { revalidate: 10, tags: ["feeds"] }
        });
        if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            const json = ct.includes('application/json') ? await res.json() : null;
            feeds = Array.isArray(json) ? json : (json?.result || []);
        } else {
            console.error('Feedback API error:', res.status);
        };
    } catch (err) {
        console.error('Feedback fetch failed:', err);
    };

    return <FeedbackClient organizationName={organizationName} feeds={feeds} />;
};