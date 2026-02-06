export default function CalculatorDisplay({ topValue, value }) {
    return (
        <div className="calc-display-wrap" aria-label="Calculator display">
            <div className="calc-display-top">{topValue || "\u00A0"}</div>
            <div className="calc-display-main">{value}</div>
        </div>
    );
}
