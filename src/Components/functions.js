import CryptoJS from "crypto-js";
import { encryptionKey } from "../encryptionKey";

export const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

export const getSessionUser = () => {
    const storage = localStorage.getItem('user');
    const user = isValidJSON(storage) ? JSON.parse(storage) : {};

    return { storage, user }
}

export const isValidObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length !== 0;
}

export const storageValue = isValidObject(getSessionUser().user) ? getSessionUser().user : {};

export const isArray = (array) => Array.isArray(array);

export const toArray = (array) => isArray(array) ? array : [];

export const encryptPasswordFun = (str) => {
    return CryptoJS.AES.encrypt(str, encryptionKey).toString();
}

export const decryptPasswordFun = (str) => {
    const decrypt = CryptoJS.AES.decrypt(str, encryptionKey);
    const decryptedText = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedText;
}

export const getIndianTime = (dateString) => {
  const date = new Date(dateString);

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false
  };

  const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);

  const get = (type) =>
    parts.find(p => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}`;
}

export const addFiveThirty = (dateString) => {
    const iso = dateString.replace(" ", "T");
    const date = new Date(iso);
    const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

    const istDate = new Date(date.getTime() + IST_OFFSET_MS);

    const pad = (n, len = 2) => String(n).padStart(len, "0");

    return `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(
        istDate.getDate()
    )} ${pad(istDate.getHours())}:${pad(
        istDate.getMinutes()
    )}:${pad(istDate.getSeconds())}.${pad(istDate.getMilliseconds(), 3)}`;
}

export const LocalDate = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const LocalDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const getDaysBetween = (invoiceDateStr, currentDateStr = new Date().toISOString()) => {
    const invoiceDate = new Date(invoiceDateStr);
    const currentDate = new Date(currentDateStr);

    // Get UTC midnight for both dates to avoid timezone discrepancies
    invoiceDate.setUTCHours(0, 0, 0, 0);
    currentDate.setUTCHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;

    const diffInMs = currentDate - invoiceDate;
    const diffInDays = Math.floor(diffInMs / msPerDay);

    return diffInDays;
}


export const DaysBetween = (StartDate, EndDate) => {
    const oneDay = 1000 * 60 * 60 * 24;

    const start = Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate());
    const end = Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate());

    return Math.round((end - start) / oneDay) + 1;
}

export const DaysBetweenCount = (start, end) => {
    if (!start || !end) return '';

    const StartDate = typeof start === 'string' ? new Date(start) : start;
    const EndDate = typeof end === 'string' ? new Date(end) : end;

    const oneDay = 1000 * 60 * 60 * 24;

    const startUTC = Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate());
    const endUTC = Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate());

    return Math.round((endUTC - startUTC) / oneDay) + 1;
};


export const getDaysInPreviousMonths = (months) => {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let totalDays = 0;

    for (let i = 1; i <= months; i++) {
        currentMonth--;

        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        totalDays += daysInMonth;
    }

    return totalDays;
}

export const LocalTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export const UTCDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleString('en-US', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export const getMonth = (date) => {
    const year = (date ? date : new Date()).getFullYear();
    const month = String((date ? date : new Date()).getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const TimeDisplay = (dateObj) => {
    const reqTime = new Date(dateObj);
    let hours = reqTime.getHours();
    const minutes = reqTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    const formattedTime = hours + ':' + minutesStr + ' ' + ampm;
    return formattedTime;
}

export const extractHHMM = (dateObj) => {
    const reqTime = new Date(dateObj);
    const hours = reqTime.getUTCHours();
    const minutes = reqTime.getUTCMinutes();
    const hourStr = hours < 10 ? '0' + hours : hours;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return hourStr + ':' + minutesStr;
}

export const formatTime24 = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);

    let hours12 = hours % 12;
    hours12 = hours12 || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const time12 = `${formattedHours}:${formattedMinutes} ${period}`;

    return time12;
}

export const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export const UTCTime = (isoString) => {
    const date = new Date(isoString);

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    const time = hours + ':' + minutesStr + ' ' + ampm;
    return time
}

export const timeToDate = (time) => {

    if (!time) {
        console.error("No time input provided.");
        return new Date(Date.UTC(1970, 0, 1, 12, 0, 0));
    }

    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));

    return dateObj;
}

export const combineDateTime = (date = ISOString(), time) => {
    const isoDate = ISOString(date);
    const [year, month, day] = isoDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    const combinedDate = new Date(year, month - 1, day, hours, minutes, 0);
    return combinedDate.toISOString();
}

export const convertToTimeObject = (timeString) => {
    const [hours, minutes, seconds] = timeString ? timeString.split(':').map(Number) : '00:00:00';

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    date.setMilliseconds(0);

    return LocalTime(date);
}

export const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return dateString && !isNaN(date) && date.toISOString().split('T')[0] === dateString;
};

export const getPreviousDate = (days) => {
    const num = days ? Number(days) : 1;
    return new Date(new Date().setDate(new Date().getDate() - num)).toISOString().split('T')[0]
}

export const firstDayOfMonth = (monthAndYear = '') => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0]
}

export const ISOString = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toISOString().split('T')[0]
}

export const timeDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = num => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const formatDateToCustom = (dateString) => {
    // sample output: 05-Mar-25
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
}

export const customTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const start = new Date(1970, 0, 1, startHours, startMinutes);
    const end = new Date(1970, 0, 1, endHours, endMinutes);

    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    // const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = num => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}`;
}

export const timeDifferenceHHMM = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const pad = num => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}`;
}

export const formatDateForTimeLocal = (dateInput) => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

        const pad = (num) => num.toString().padStart(2, '0');

        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${hours}:${minutes}`;
    } catch (e) {
        console.error('Error in formatDateForTimeLocal function:', e);
        return formatDateForTimeLocal(new Date());
    }
};

export const formatDateForDatetimeLocal = (date) => {
    try {
        const pad = (num) => num?.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.log('Error in formatDateForDatetimeLocal function: ', e);
        return formatDateForDatetimeLocal(new Date())
    }
}

export const formatSQLDateTimeObjectToInputDateTime = (date) => {
    try {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        const pad = (num) => num?.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.log('Error in formatDateForDatetimeLocal function: ', e);
        return formatSQLDateTimeObjectToInputDateTime(new Date());
    }
};

export const rid = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `r${Math.random().toString(36).slice(2)}${Date.now()}`;

export const convertUTCToLocal = (utcDateString) => {
    const utcDate = new Date(utcDateString + "Z"); // Append 'Z' to indicate UTC time
    return utcDate.toLocaleString();
}

export const onlynum = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    if ((value.match(/\./g) || []).length > 1) {
        value = value.slice(0, -1);
    }
    e.target.value = value;
};

export const onlynumAndNegative = (e) => {
    let value = e.target.value;

    // Allow only digits, dot, and minus
    value = value.replace(/[^0-9.-]/g, '');

    // Fix multiple minus signs
    const minusCount = (value.match(/-/g) || []).length;
    if (minusCount > 1) {
        value = value.replace(/-/g, '');
        value = '-' + value;
    }

    // Ensure minus is only at the start
    if (value.includes('-') && !value.startsWith('-')) {
        value = value.replace(/-/g, '');
        value = '-' + value;
    }

    // Fix multiple dots (keep only the first)
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts.shift() + '.' + parts.join('');
    }

    e.target.value = value;
};

export const isEqualNumber = (a, b) => {
    return Number(a) === Number(b)
}

export const toNumber = (value) => {
    if (!value) return 0;
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    }
    return typeof value === 'number' ? value : 0;
};

export const isEqualObject = (obj1, obj2) => {
    if (obj1 === obj2) {
        return true;
    }

    if (obj1 == null || typeof obj1 !== 'object' ||
        obj2 == null || typeof obj2 !== 'object') {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (!keys2.includes(key) || !isEqualObject(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

export const isGraterNumber = (a, b) => {
    return Number(a) > Number(b)
}

export const isGraterOrEqual = (a, b) => {
    return Number(a) >= Number(b)
}

export const isLesserNumber = (a, b) => {
    return Number(a) < Number(b)
}

export const isLesserOrEqual = (a, b) => {
    return Number(a) <= Number(b)
}

export const NumberFormat = (num) => {
    return toNumber(num).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export const limitFractionDigits = (num = 0, maxFractionDigits = 2) => {
    const factor = Math.pow(10, maxFractionDigits);
    return Math.round(num * factor) / factor;
}

export const RoundNumber = (num) => {
    return checkIsNumber(num) ? Number(num).toFixed(2) : 0;
}

export const indianCurrency = (number) => {
    let num = Number(number)
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(num)
};

export const Addition = (a, b) => limitFractionDigits(Number(a) + Number(b));

export const Subraction = (a, b) => limitFractionDigits(Number(a) - Number(b));

export const Multiplication = (a, b) => limitFractionDigits(Number(a || 0) * Number(b || 0));

export const Division = (a, b) => limitFractionDigits(b != 0 ? Number(a || 0) / Number(b || 1) : 0);

export const trimText = (text = '', replaceWith = '_') => String(text).trim().replace(/\s+/g, replaceWith ?? '_');

export const filterableText = (text) => {
    try {
        const txt = String(trimText(text, ' ')).toLowerCase();
        return txt
    } catch (e) {
        console.log('Error while convert to filterable text:', e);
        return '';
    }
}

export const stringCompare = (str1, str2) => filterableText(str1) === filterableText(str2)

export const validValue = (val) => {
    return Boolean(val) ? val : ''
}

export const numberToWords = (prop) => {
    const number = Number(prop)
    const singleDigits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', ' Thousand', ' Lakhs'];

    if (number < 10) {
        return singleDigits[number];
    } else if (number < 20) {
        return teens[number - 10];
    } else if (number < 100) {
        const tenDigit = Math.floor(number / 10);
        const singleDigit = number % 10;
        return tens[tenDigit] + (singleDigit !== 0 ? ' ' + singleDigits[singleDigit] : '');
    } else if (number < 1000) {
        const hundredDigit = Math.floor(number / 100);
        const remainingDigits = number % 100;
        return singleDigits[hundredDigit] + ' Hundred' + (remainingDigits !== 0 ? ' and ' + numberToWords(remainingDigits) : '');
    } else if (number < 100000) {
        const thousandDigit = Math.floor(number / 1000);
        const remainingDigits = number % 1000;
        return numberToWords(thousandDigit) + thousands[1] + (remainingDigits !== 0 ? ', ' + numberToWords(remainingDigits) : '');
    } else if (number < 10000000) {
        const lakhDigit = Math.floor(number / 100000);
        const remainingDigits = number % 100000;
        return numberToWords(lakhDigit) + thousands[2] + (remainingDigits !== 0 ? ', ' + numberToWords(remainingDigits) : '');
    } else {
        return 'Number is too large';
    }
}

// export const numberToWords = (prop) => {
//     const number = Number(prop);
//     const singleDigits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//     const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
//     const thousands = ['', ' Thousand', ' Lakhs'];

//     const convertInteger = (number) => {
//         if (number < 10) {
//             return singleDigits[number];
//         } else if (number < 20) {
//             return teens[number - 10];
//         } else if (number < 100) {
//             const tenDigit = Math.floor(number / 10);
//             const singleDigit = number % 10;
//             return tens[tenDigit] + (singleDigit !== 0 ? ' ' + singleDigits[singleDigit] : '');
//         } else if (number < 1000) {
//             const hundredDigit = Math.floor(number / 100);
//             const remainingDigits = number % 100;
//             return singleDigits[hundredDigit] + ' Hundred' + (remainingDigits !== 0 ? ' and ' + convertInteger(remainingDigits) : '');
//         } else if (number < 100000) {
//             const thousandDigit = Math.floor(number / 1000);
//             const remainingDigits = number % 1000;
//             return convertInteger(thousandDigit) + thousands[1] + (remainingDigits !== 0 ? ', ' + convertInteger(remainingDigits) : '');
//         } else if (number < 10000000) {
//             const lakhDigit = Math.floor(number / 100000);
//             const remainingDigits = number % 100000;
//             return convertInteger(lakhDigit) + thousands[2] + (remainingDigits !== 0 ? ', ' + convertInteger(remainingDigits) : '');
//         } else {
//             return 'Number is too large';
//         }
//     };

//     const convertDecimal = (decimalPart) => {
//         return decimalPart.toString().split('').map(digit => singleDigits[Number(digit)]).join(' ');
//     };

//     if (Number.isInteger(number)) {
//         return convertInteger(number);
//     } else {
//         const [integerPart, decimalPart] = prop.toString().split('.');
//         const integerWords = convertInteger(Number(integerPart));
//         const decimalWords = convertDecimal(decimalPart);
//         return integerWords + ' Point ' + decimalWords;
//     }
// };


export const createAbbreviation = (sentence) => {
    return sentence
        .split(' ')
        .map(word => word[0])
        .filter(char => /[a-zA-Z]/.test(char))
        .join('')
        .toUpperCase();
}

export const checkIsNumber = (num) => {
    return (num !== '' && num !== null && num !== undefined) ? isNaN(num) ? false : true : false
}

export const parseJSON = (str) => {
    try {
        const value = JSON.parse(str);
        return { isJSON: true, data: value };
    } catch (e) {
        return { isJSON: false, };
    }
}

export const isObject = (val) => {
    return Object.prototype.toString.call(val) === '[object Object]'
}

export const numbersRange = [
    { min: 0, max: 500 },
    { min: 500, max: 2000 },
    { min: 2000, max: 5000 },
    { min: 5000, max: 10000 },
    { min: 10000, max: 15000 },
    { min: 15000, max: 20000 },
    { min: 20000, max: 30000 },
    { min: 30000, max: 40000 },
    { min: 40000, max: 50000 },
    { min: 50000, max: 75000 },
    { min: 75000, max: 100000 },
    { min: 100000, max: 150000 },
    { min: 150000, max: 200000 },
    { min: 200000, max: 300000 },
    { min: 300000, max: 400000 },
    { min: 400000, max: 500000 },
    { min: 500000, max: 1000000 },
    { min: 1000000, max: 1500000 },
    { min: 1500000, max: 2000000 },
    { min: 2000000, max: 1e15 },
];

export const randomNumber = (range = 10000000) => Math.floor(Math.random() * range) + 1;

export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const getPermutations = (arr) => {
    if (arr.length === 1) {
        return [arr];
    }

    let permutations = [];

    for (let i = 0; i < arr.length; i++) {
        let currentElement = arr[i];
        let remainingElements = arr.slice(0, i).concat(arr.slice(i + 1));
        let remainingPermutations = getPermutations(remainingElements);

        for (let perm of remainingPermutations) {
            permutations.push([currentElement, ...perm]);
        }
    }

    return permutations;
}

export const groupData = (arr, key) => {
    if (Array.isArray(arr) && key) {
        return arr.reduce((acc, item) => {
            const groupKey = item[key];

            if (groupKey === undefined || groupKey === null) {
                return acc;
            }

            const groupIndex = acc.findIndex(group => group[key] === groupKey);

            if (groupIndex === -1) {
                acc.push({
                    [key]: groupKey,
                    groupedData: [{ ...item }]
                });
            } else {
                acc[groupIndex].groupedData.push(item);
            }

            return acc;
        }, []);
    } else {
        return [];
    }
};

export const calcTotal = (arr, column) => {
    let total = 0;
    if (Array.isArray(arr)) {
        arr.forEach(ob => {
            total += Number(ob[column]) ?? 0
        })
        return total
    }
    return total
}

export const calcAvg = (arr, column) => {
    let total = 0;
    if (Array.isArray(arr) && column) {
        arr.forEach(o => {
            if (o[column]) {
                total += Number(o[column]) ?? 0
            }
        })
        return total / arr.length
    }
    return total
}

export const getUniqueData = (arr = [], key = '', returnObjectKeys = []) => {
    const uniqueArray = [];
    const uniqueSet = new Set();

    arr.forEach(o => {
        if (!uniqueSet.has(o[key])) {
            const uniqueObject = { [key]: o[key] };
            returnObjectKeys.forEach(returnKey => {
                uniqueObject[returnKey] = o[returnKey];
            });

            uniqueArray.push(uniqueObject);
            uniqueSet.add(o[key]);
        }
    });

    return uniqueArray.sort((a, b) => String(a[key]).localeCompare(b[key]));
};

export const setSessionFilters = (obj = {}) => {
    if (!isValidObject(obj)) return;
    const newSessionValue = JSON.stringify(obj);
    sessionStorage.setItem('filterValues', newSessionValue);
}

export const getSessionFilters = (reqKey = '') => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const parsedValue = isValidJSON(sessionValue) ? JSON.parse(sessionValue) : {};

    const isValidObj = isValidObject(parsedValue);

    if (isValidObj && Object.hasOwn(reqKey)) {
        return parsedValue.reqKey;
    } else if (isValidObj) {
        return parsedValue
    } else {
        return {}
    }
}

export const setSessionFilter = (key = '', value = '') => {
    if (key) {
        const sessinonValue = getSessionFilters();
        return sessionStorage.setItem('filterValues', JSON.stringify({ ...sessinonValue, [key]: value }))
    }
}

export const getSessionDateFilter = (pageid) => {
    const sessionFilter = getSessionFilters();
    const { Fromdate, Todate, pageID } = sessionFilter;

    const sessionDate = {
        Fromdate: (Fromdate && isValidDate(Fromdate)) ? Fromdate : ISOString(),
        Todate: (Todate && isValidDate(Todate)) ? Todate : ISOString(),
    };

    return (checkIsNumber(pageid) && isEqualNumber(pageid, pageID)) ? sessionDate : {
        Fromdate: ISOString(),
        Todate: ISOString()
    }
}

export const getSessionFiltersByPageId = (pageID) => {

    const Fromdate = ISOString(), Todate = ISOString(), defaultValue = {
        Fromdate, Todate
    };

    if (!checkIsNumber(pageID)) { return defaultValue };

    const sessionValue = sessionStorage.getItem('filterValues');
    const parsedValue = isValidJSON(sessionValue) ? JSON.parse(sessionValue) : {};
    const isValidObj = isValidObject(parsedValue);

    if (!isValidObj) { return defaultValue };

    const isEqualPage = isEqualNumber(parsedValue?.pageID, pageID);

    if (isEqualPage) {
        const getDefaultDateValue = getSessionDateFilter(pageID);
        return {
            ...parsedValue, ...getDefaultDateValue
        }
    } else {
        return defaultValue
    };
}

export const clearFilters = () => sessionStorage.removeItem('filterValues');

export const removeSplChar = (str) => String(str).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

export const reactSelectFilterLogic = (option, inputValue) => {
    const normalizedLabel = removeSplChar(option.label);
    const normalizedInput = removeSplChar(inputValue);

    return normalizedLabel.includes(normalizedInput);
};