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

            <div style={{ padding: '0 10px 10px', textAlign: 'right', color: '#666', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {state.history}
            </div>

            {/* <details className="calc-debug">
                <summary>Debug</summary>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </details> */}
        </div>
    );
}
