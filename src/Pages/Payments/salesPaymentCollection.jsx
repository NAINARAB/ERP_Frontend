import { ISOString } from '../../Components/functions';


const SalesPaymentCollection = ({ loadingOn, loadingOff }) => {
    const [salesPayments, setSalesPayments] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
    });

    return (
        <>
        
        </>
    )
}

export default SalesPaymentCollection;