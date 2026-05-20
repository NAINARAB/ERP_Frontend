import { useEffect, useMemo, useReducer } from "react";
import { initialState, isDigit, reduce } from "./calculatorEngine";

export default function useCalculator() {
    const [state, dispatch] = useReducer(reduce, initialState);

    const actions = useMemo(() => ({
        digit: (d) => dispatch({ type: "INPUT_DIGIT", payload: d }),
        dot: () => dispatch({ type: "INPUT_DOT" }),
        op: (o) => dispatch({ type: "SET_OP", payload: o }),
        equals: () => dispatch({ type: "EQUALS" }),
        clear: () => dispatch({ type: "CLEAR" }),
        backspace: () => dispatch({ type: "BACKSPACE" }),
        toggleSign: () => dispatch({ type: "TOGGLE_SIGN" }),
        percent: () => dispatch({ type: "PERCENT" }),
    }), []);

    // Keyboard support (debug friendly, single place)
    useEffect(() => {
        const onKeyDown = (e) => {
            const k = e.key;

            if (isDigit(k)) return actions.digit(k);
            if (k === ".") return actions.dot();
            if (k === "Enter" || k === "=") return actions.equals();
            if (k === "Escape") return actions.clear();
            if (k === "Backspace") return actions.backspace();

            if (k === "+" || k === "-" || k === "*" || k === "/") return actions.op(k);
            if (k === "%") return actions.percent();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [actions]);

    return { state, actions };
}
