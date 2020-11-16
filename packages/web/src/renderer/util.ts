export function shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export async function fetchJSON(url: string, data: any, method: string = "POST") {
    const r = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data),
        method
    });

    try {
        return await r.json();
    } catch (e) {
        if (r.status >= 300) {
            console.error(r.status, r.statusText);
        }

        return r.status;
    }
}
