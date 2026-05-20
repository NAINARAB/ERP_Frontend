// calculatorEngine.js

export const isDigit = (v) => /^[0-9]$/.test(v);

export const OP_SYMBOL = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
};

export const initialState = {
    top: "",            // 👈 Windows-like top line: "5 +" , "10 ×", etc.
    display: "0",
    prev: null,
    op: null,
    waitingForNext: false,
    error: null,
    history: "",
};

const toNumber = (str) => Number(str);

const safeDivide = (a, b) => {
    if (b === 0) return { ok: false, value: null, error: "Cannot divide by zero" };
    return { ok: true, value: a / b, error: null };
};

const operate = (a, b, op) => {
    switch (op) {
        case "+": return { ok: true, value: a + b };
        case "-": return { ok: true, value: a - b };
        case "*": return { ok: true, value: a * b };
        case "/": return safeDivide(a, b);
        default: return { ok: true, value: b };
    }
};

const format = (n) => {
    if (!Number.isFinite(n)) return "Error";
    const rounded = Math.round((n + Number.EPSILON) * 1e12) / 1e12;
    return String(rounded);
};

export function reduce(state, action) {
    const { type, payload } = action;

    if (state.error && type !== "CLEAR") return state;

    switch (type) {
        case "INPUT_DIGIT": {
            const digit = payload;

            // if result displayed and next digit typed, start fresh (optional nice UX)
            if (state.prev == null && state.op == null && state.waitingForNext) {
                return { ...initialState, display: digit };
            }

            if (state.waitingForNext) {
                return { ...state, display: digit, waitingForNext: false };
            }
            if (state.display === "0") return { ...state, display: digit };
            return { ...state, display: state.display + digit };
        }

        case "INPUT_DOT": {
            if (state.prev == null && state.op == null && state.waitingForNext) {
                return { ...initialState, display: "0." };
            }
            if (state.waitingForNext) {
                return { ...state, display: "0.", waitingForNext: false };
            }
            if (state.display.includes(".")) return state;
            return { ...state, display: state.display + "." };
        }

        case "SET_OP": {
            const nextOp = payload;

            // Pressing operator repeatedly: just replace operator, keep top updated
            if (state.waitingForNext) {
                const base = state.prev ?? toNumber(state.display);
                const nextOpSymbol = OP_SYMBOL[nextOp];
                // Replace last char in history (the operator)
                const newHistory = state.history.trimEnd().slice(0, -1) + nextOpSymbol;

                return {
                    ...state,
                    op: nextOp,
                    top: `${format(base)} ${nextOpSymbol}`,
                    history: newHistory
                };
            }

            const current = toNumber(state.display);

            // First time operator: store prev and show "5 +"
            if (state.prev == null) {
                return {
                    ...state,
                    prev: current,
                    op: nextOp,
                    waitingForNext: true,
                    top: `${format(current)} ${OP_SYMBOL[nextOp]}`,
                    history: `${format(current)} ${OP_SYMBOL[nextOp]}`,
                };
            }

            // Chaining: "5 + 5 +" => compute 10, then show "10 +"
            const res = operate(state.prev, current, state.op);
            if (!res.ok) {
                return { ...state, error: res.error || "Error", display: "Error" };
            }

            const computed = res.value;

            return {
                ...state,
                prev: computed,
                op: nextOp,
                display: format(computed),              // 👈 show cumulative in main (like Windows)
                waitingForNext: true,
                top: `${format(computed)} ${OP_SYMBOL[nextOp]}`, // 👈 show cumulative + current op on top
                history: `${state.history} ${format(current)} ${OP_SYMBOL[nextOp]}`,
            };
        }

        case "EQUALS": {
            if (state.op == null || state.prev == null) return state;
            if (state.waitingForNext) return state; // "5 + =" ignore

            const current = toNumber(state.display);
            const res = operate(state.prev, current, state.op);

            if (!res.ok) {
                return { ...state, error: res.error || "Error", display: "Error" };
            }

            const result = res.value;

            return {
                ...state,
                display: format(result),
                top: `${format(state.prev)} ${OP_SYMBOL[state.op]} ${format(current)} =`,
                prev: null,
                op: null,
                waitingForNext: true,
                history: `${state.history} ${format(current)} =`
            };
        }

        case "CLEAR": {
            return { ...initialState };
        }

        case "BACKSPACE": {
            if (state.waitingForNext) return state;
            if (state.display.length <= 1) return { ...state, display: "0" };
            return { ...state, display: state.display.slice(0, -1) };
        }

        case "TOGGLE_SIGN": {
            if (state.display === "0") return state;
            if (state.display.startsWith("-")) return { ...state, display: state.display.slice(1) };
            return { ...state, display: "-" + state.display };
        }

        case "PERCENT": {
            const current = toNumber(state.display);
            const value = current / 100;
            return { ...state, display: format(value), waitingForNext: true };
        }

        default:
            return state;
    }
}
