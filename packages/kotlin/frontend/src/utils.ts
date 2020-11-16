export function getJsonFromUrl() {
    interface IResultObject {
        q: string;
        is: string;
        [key: string]: string;
    }
    const result: IResultObject = {
        q: "",
        is: ""
    };

    const query = location.href.split("?")[1];

    if (query !== undefined && query.length > 0) {
        query.split("&").forEach((pair) => {
            const components = pair.split("=");
            result[components[0]] = decodeURIComponent(components[1]);
        });
    }

    return result;
}

export async function postJson(url: string, data: any) {
    try {
        return await (await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })).json();
    } catch (e) {
        return null;
    }
}

export default getJsonFromUrl;
