import { NumberFormat } from "../../../Components/functions"

const CardComp = ({ Value, Label }) => (
    <div className="grid-card d-flex align-items-center justify-content-center flex-column cus-shadow">
        <h1 style={{ fontSize: '45px', color: 'blue', margin: '0 0.5em' }}>
            {isNaN(Value)
                ? Value ? Value : '-'
                : Value ? NumberFormat(Value) : '0'
            }
        </h1>
        <h2 className='fa-20'>{Label}</h2>
    </div>
)

export default CardComp;