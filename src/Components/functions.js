
const LocalDate = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const LocalDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const LocalTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const getPreviousDate = (days) => {
    const num = days ? Number(days) : 1;
    return new Date(new Date().setDate(new Date().getDate() - num)).toISOString().split('T')[0]
}

const ISOString = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toISOString().split('T')[0]
}

const isEqualNumber = (a, b) => {
    return Number(a) === Number(b)
}

const isGraterNumber = (a, b) => {
    return Number(a) > Number(b)
}

const isLesserNumber = (a, b) => {
    return Number(a) < Number(b)
}

const NumberFormat = (num) => {
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

const Addition = (a, b) => {
    return Number(a) + Number(b)
}

const Subraction = (a, b) => {
    return Number(a) - Number(b)
}

const Multiplication = (a, b) => {
    return Number(a) * Number(b)
}

const Division = (a, b) => {
    return Number(a) / Number(b)
}

const numberToWords = (prop) => {
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

function isValidObject(obj) {
    return Object.keys(obj).length !== 0;
}

export {
    LocalDate,
    LocalDateWithTime,
    getPreviousDate,
    ISOString,
    isEqualNumber,
    isGraterNumber,
    isLesserNumber,
    NumberFormat,
    numberToWords,
    LocalTime,
    isValidObject,
    Addition,
    Subraction,
    Multiplication,
    Division,
}