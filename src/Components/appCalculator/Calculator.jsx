import useCalculator from "./useCalculator";
import CalculatorDisplay from "./CalculatorDisplay";
import CalculatorKeypad from "./CalculatorKeypad";
import "./Calculator.css";

export default function Calculator() {
    const { state, actions } = useCalculator();

    return (
        <div className="calc-shell">
            {/* <h2 className="calc-title">Calculator</h2> */}

            <CalculatorDisplay topValue={state.top} value={state.display} />

            <CalculatorKeypad actions={actions} />

            {/* <details className="calc-debug">
                <summary>Debug</summary>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </details> */}
        </div>
    );
}
