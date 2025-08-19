import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from "react-select";
import { journalStatus } from "./variable";


const JournalGeneralInfo = ({
    journalGeneralInfo = {},
    setJournalGeneralInfo,
    voucherType = [],
    branch = [],
}) => {

    const changeGeneralInfo = (key, value) => {
        setJournalGeneralInfo(pre => ({
            ...pre,
            [key]: value
        }))
    }

    return (
        <>

            <div className="row p-0 m-0">

                {/* Date */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Date</label>
                    <input
                        type="date"
                        value={journalGeneralInfo.JournalDate}
                        className="cus-inpt p-2"
                        onChange={e => changeGeneralInfo('JournalDate', e.target.value)}
                    />
                </div>

                {/* status */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Branch</label>
                    <select
                        className="cus-inpt p-2"
                        value={journalGeneralInfo.BranchId}
                        onChange={e => changeGeneralInfo('BranchId', e.target.value)}
                    >
                        <option value="" disabled>Select</option>
                        {branch.map((br, bi) => (
                            <option key={bi} value={br.BranchId}>{br.BranchName}</option>
                        ))}
                    </select>
                </div>

                {/* vouchertype */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Voucher Type</label>
                    <Select
                        value={{
                            label: journalGeneralInfo.VoucherTypeGet,
                            value: journalGeneralInfo.VoucherType
                        }}
                        options={[
                            { value: '', label: 'select' },
                            ...voucherType.map(voucher => ({
                                value: voucher.Vocher_Type_Id,
                                label: voucher.Voucher_Type
                            }))
                        ]}
                        menuPortalTarget={document.body}
                        onChange={e => {
                            changeGeneralInfo('VoucherTypeGet', e.label);
                            changeGeneralInfo('VoucherType', e.value);
                        }}
                        styles={customSelectStyles}
                        isSearchable={true}
                    />
                </div>

                {/* status */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Status</label>
                    <select
                        className="cus-inpt p-2"
                        value={journalGeneralInfo.JournalStatus}
                        onChange={e => changeGeneralInfo('JournalStatus', e.target.value)}
                    >
                        <option value="" disabled>Select</option>
                        {journalStatus.map((s, i) => (
                            <option value={s.value} key={i}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 p-0 m-0"></div>

                {/* narration */}
                <div className="col-md-8 p-2">
                    <label>Narration</label>
                    <textarea
                        type="text"
                        value={journalGeneralInfo.Narration}
                        className="cus-inpt p-2"
                        onChange={e => changeGeneralInfo('Narration', e.target.value)}
                    />
                </div>

            </div>

        </>
    )
}

export default JournalGeneralInfo;