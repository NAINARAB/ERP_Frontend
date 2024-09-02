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

    const defaultHeaders = {
        "Content-Type": "application/json",
        "Authorization": token,
    };

    const finalHeaders = { ...defaultHeaders, ...headers };

    const options = {
        method,
        headers: finalHeaders,
        ...others
    };

    if (["POST", "PUT", "DELETE"].includes(method)) {
        options.body = JSON.stringify(bodyData || {});
    }

    try {
        const response = await fetch(api + address, options);

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

        if (options.headers["Content-Type"] === "application/json") {
            const json = await response.json();
            return json;
        } else {
            return response;  
        }
    } catch (e) {
        console.error('Fetch Error', e);
        throw e;
    }
};

