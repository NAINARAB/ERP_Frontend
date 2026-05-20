import { LocalDate, LocalDateWithTime, LocalTime, toArray } from "./functions";


const AlterHistoryTable = ({ alterationHistory }) => {
    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    {['S.No', 'Edited By', 'Edited Date', 'Edited Time', 'Reason'].map((item, index) => (
                        <th key={index}>{item}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {toArray(alterationHistory).map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.alterByGet}</td>
                        <td>{LocalDate(item.alterAt)}</td>
                        <td>{LocalTime(item.alterAt)}</td>
                        <td>{item.reason}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AlterHistoryTable;