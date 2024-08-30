import api from "../API";
const storage = JSON.parse(localStorage.getItem("user"));
const token = storage?.Autheticate_Id;

export const fetchLink = async ({
    address,
    method = "GET",
    headers = {
        "Content-Type": "application/json",
        'Authorization': token,
    },
    bodyData = null,
    others = {}
}) => {
    const options = {
        method,
        headers: headers,
        ...others
    };
    if (method === "POST" || method === "PUT" || method === "DELETE") {
        options.body = JSON.stringify(bodyData || {});
    };

    try {
        const response = await fetch(api + address, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (e) {
        console.error('Fetch Error', e);
        throw e;
    }
};
