const Key = ({ children, onClick, variant = "key" }) => (
    <button className={variant} onClick={onClick} type="button">
        {children}
    </button>
);

export default function CalculatorKeypad({ actions }) {
    return (
        <div className="calc-keys">
            <Key variant="key key-fn" onClick={actions.clear}>AC</Key>
            <Key variant="key key-fn" onClick={actions.backspace}>⌫</Key>
            <Key variant="key key-fn" onClick={actions.percent}>%</Key>
            <Key variant="key key-op" onClick={() => actions.op("/")}>÷</Key>

            <Key onClick={() => actions.digit("7")}>7</Key>
            <Key onClick={() => actions.digit("8")}>8</Key>
            <Key onClick={() => actions.digit("9")}>9</Key>
            <Key variant="key key-op" onClick={() => actions.op("*")}>×</Key>

            <Key onClick={() => actions.digit("4")}>4</Key>
            <Key onClick={() => actions.digit("5")}>5</Key>
            <Key onClick={() => actions.digit("6")}>6</Key>
            <Key variant="key key-op" onClick={() => actions.op("-")}>−</Key>

            <Key onClick={() => actions.digit("1")}>1</Key>
            <Key onClick={() => actions.digit("2")}>2</Key>
            <Key onClick={() => actions.digit("3")}>3</Key>
            <Key variant="key key-op" onClick={() => actions.op("+")}>+</Key>

            <Key variant="key key-fn" onClick={actions.toggleSign}>+/−</Key>
            <Key onClick={() => actions.digit("0")}>0</Key>
            <Key onClick={actions.dot}>.</Key>
            <Key variant="key key-eq" onClick={actions.equals}>=</Key>
        </div>
    );
}
