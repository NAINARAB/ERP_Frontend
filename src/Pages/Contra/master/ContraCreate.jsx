import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { contraIV, contraStatus, contrarReference } from "./contraVariables";
import { checkIsNumber, isEqualNumber, ISOString, isValidObject, onlynum, reactSelectFilterLogic, toArray, stringCompare, isValidNumber } from "../../../Components/functions";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Button, Card, CardContent, Checkbox, IconButton } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { transactionTypes } from "../../Receipts/ReceiptMaster/variable";
import AppDialog from "../../../Components/appDialogComponent";
import { createCol } from "../../../Components/filterableTable2";
import { Add, Delete, Search } from "@mui/icons-material";
import AppTableComponent from "../../../Components/appTable/appTableComponent";

const ListReference = ({ data = [], onDelete, title = 'Payment Reference' }) => data.length > 0 && (
    <div className="table-responsive mt-2">
        <h6 className="m-0">{title}</h6>
        <table className="table fa-12 table-bordered">
            <thead>
                <tr>
                    {['Sno', 'voucher', 'Dr / Cr', '#'].map(
                        col => <th key={col}>{col}</th>
                    )}
                </tr>
            </thead>
            <tbody>
                {data.map(
                    (item, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item?.bill_no ?? ''}</td>
                            <td>{item?.dr_cr}</td>
                            <td>
                                <IconButton onClick={() => onDelete(item)} size="small" color="error">
                                    <Delete className="fa-16" />
                                </IconButton>
                            </td>
                        </tr>
                    )
                )}
            </tbody>
        </table>
    </div>
)

const ContraScreen = ({
    loadingOn, loadingOff
}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const [data, setData] = useState(contraIV);
    const [refDialog, setRefDialog] = useState({
        open: false,
        Fromdate: ISOString(),
        Todate: ISOString(),
    });
    const [referenceData, setReferenceData] = useState([]);
    const [references, setReferences] = useState([]);

    const [baseData, setBaseData] = useState({
        accountsList: [],
        voucherType: [],
        branch: [],
        bankMaster: []
    });

    useEffect(() => {
        if (
            isValidObject(editValues)
        ) {
            setData(
                Object.fromEntries(
                    Object.entries(contraIV).map(([key, value]) => {
                        if (key === 'ContraDate' || key === 'BankDate' || key === 'ChequeDate') return [
                            key,
                            editValues[key] ? ISOString(editValues[key]) : value
                        ];
                        return [key, editValues[key] ?? value];
                    })
                )
            );
            if (Array.isArray(editValues.bill_references)) {
                setReferences(editValues.bill_references);
            }
        }
    }, [editValues])

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    accountsResponse,
                    voucherTypeResponse,
                    branchRes,
                    banksMaster
                ] = await Promise.all([
                    fetchLink({ address: `masters/accountMaster/groupFilter?recursiveGroup=11,21,22` }),
                    fetchLink({ address: `masters/voucher?module=CONTRA` }),
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/defaultBanks` }),
                ]);

                const accountsList = (accountsResponse.success ? accountsResponse.data : []).sort(
                    (a, b) => String(a?.Account_name).localeCompare(b?.Account_name)
                );
                const voucherType = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );
                const branch = (branchRes.success ? branchRes.data : [])
                    .sort((a, b) => String(a?.BranchName).localeCompare(b?.BranchName));

                const bank = toArray(banksMaster?.data);

                setBaseData((pre) => ({
                    ...pre,
                    accountsList: accountsList,
                    voucherType: voucherType,
                    branch: branch,
                    bankMaster: bank
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, [])

    const canSave = useMemo(() => {
        const okDr = checkIsNumber(data.DebitAccount) && data.DebitAccount !== 0;
        const okCr = checkIsNumber(data.CreditAccount) && data.CreditAccount !== 0;
        const notSame = okDr && okCr && Number(data.DebitAccount) !== Number(data.CreditAccount);
        return okDr && okCr && notSame && data.ContraDate && data.BranchId && data.VoucherType !== "" && data.TransactionType;
    }, [data]);

    const clear = () => {
        setData((p) => ({
            ...contraIV,
            ContraDate: ISOString()
        }));
        setReferenceData([]);
        setReferences([]);
    };

    const onSave = async () => {
        if (!canSave) return;
        if (data?.ContraAutoId && stringCompare(data?.Alter_Reason, '')) return toast.error('Enter Alter Reason');

        fetchLink({
            address: `contra/master`,
            method: data?.ContraAutoId ? 'PUT' : 'POST',
            bodyData: { ...data, bill_references: references },
            loadingOn, loadingOff
        }).then((res) => {
            if (res.success) {
                toast.success(res.message);
                clear();

                if (data?.ContraAutoId) {
                    navigate('/erp/contra/contraList');
                }
            } else {
                toast.error(res.message);
            }
        }).catch(e => console.error(e))
    };

    const change = (k, v) => setData((p) => ({ ...p, [k]: v }));

    const options = baseData.accountsList.map((a) => ({ value: Number(a.Acc_Id), label: a.Account_name }));

    const selDebit = data.DebitAccount != null
        ? options.find((o) => isEqualNumber(o.value, data.DebitAccount)) || null
        : null;

    const selCredit = data.CreditAccount != null
        ? options.find((o) => isEqualNumber(o.value, data.CreditAccount)) || null
        : null;

    const disableOption = (side) => (opt) => {
        if (side === "Dr") return data.CreditAccount != null && isEqualNumber(opt.value, data.CreditAccount);
        if (side === "Cr") return data.DebitAccount != null && isEqualNumber(opt.value, data.DebitAccount);
        return false;
    };

    const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

    const refHandle = async (acc) => {
        if (!isValidNumber(acc)) return toast.error('Select Debit and Credit Accounts');

        const url = data.dr_cr === 'Cr'
            ? `contra/receiptReference?Fromdate=${refDialog.Fromdate}&Todate=${refDialog.Todate}&accId=${acc}`
            : `contra/paymentReference?Fromdate=${refDialog.Fromdate}&Todate=${refDialog.Todate}&accId=${acc}`
        fetchLink({
            address: url,
            method: "GET",
            loadingOn,
            loadingOff
        }).then(res => {
            if (res.success) {
                setReferenceData(res.data);
            }
        }).catch(console.error)
    };

    return (
        <>
            <Card>
                <h5 className="p-3 m-0 d-flex align-items-center">
                    <span className="flex-grow-1">
                        Contra Voucher{data.ContraVoucherNo ? ` - ${data.ContraVoucherNo}` : ""}
                    </span>
                    <span>
                        <Button variant="outlined" disabled={!canSave} onClick={canSave ? onSave : undefined}>
                            Save
                        </Button>
                    </span>
                </h5>

                <CardContent>

                    <div className="row p-0 m-0">
                        {/* date */}

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Date</label>
                            <input
                                type="date"
                                className="cus-inpt p-2"
                                value={data.ContraDate}
                                onChange={(e) => change("ContraDate", e.target.value)}
                            />
                        </div>

                        {/* branch */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Branch</label>
                            <select
                                className="cus-inpt p-2"
                                value={data.BranchId}
                                onChange={(e) => change("BranchId", e.target.value)}
                            >
                                <option value="" disabled>Select</option>
                                {baseData.branch.map((b, i) => (
                                    <option key={i} value={b.BranchId}>{b.BranchName}</option>
                                ))}
                            </select>
                        </div>

                        {/* voucher type */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Voucher Type</label>
                            <Select
                                value={{
                                    label: data.VoucherTypeGet,
                                    value: data.VoucherType
                                }}
                                options={[
                                    { value: "", label: "select" },
                                    ...baseData.voucherType.map((v) => ({ value: v.Vocher_Type_Id, label: v.Voucher_Type }))
                                ]}
                                isDisabled={data?.ContraAutoId}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                onChange={(opt) => {
                                    change("VoucherType", opt?.value || "");
                                    change("VoucherTypeGet", opt?.label || "");
                                }}
                                isSearchable
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        {/* status */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Status</label>
                            <select
                                className="cus-inpt p-2"
                                value={data.ContraStatus}
                                onChange={(e) => change("ContraStatus", e.target.value)}
                            >
                                <option value="" disabled>Select</option>
                                {contraStatus.map(sta => (
                                    <option key={sta.value} value={sta.value}>{sta.label}</option>
                                ))}
                            </select>
                        </div>

                        {data?.ContraAutoId && (
                            <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                <label className='fa-13'>Alter Reason <span style={{ color: "red" }}>*</span></label>
                                <input
                                    value={data.Alter_Reason}
                                    className="cus-inpt p-2"
                                    onChange={e => change('Alter_Reason', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="col-12 p-0 m-0"></div>

                        {/* DR - CR */}
                        <div className="row p-0 m-0">
                            {/* debit account */}
                            <div className="col-md-6 p-2">
                                <div className="mb-2 d-flex justify-content-between align-items-center">
                                    <h6>Debit</h6>
                                    <Button
                                        onClick={() => {
                                            setData(pre => ({ ...pre, dr_cr: 'Dr' }));
                                            setRefDialog(pre => ({ ...pre, open: true }))
                                        }}
                                        startIcon={<Add />}
                                        disabled={
                                            !isValidNumber(data.DebitAccount)
                                            || references.some(r => stringCompare(r.dr_cr, "Cr"))
                                        }
                                    >Debit Ref</Button>
                                </div>
                                <div className="border rounded-3 p-3">
                                    <label>Debit Account</label>
                                    <Select
                                        placeholder="Select debit account"
                                        value={selDebit}
                                        options={options}
                                        isOptionDisabled={disableOption("Dr")}
                                        onChange={(opt) => {
                                            setData((p) => ({
                                                ...p,
                                                DebitAccount: !opt ? null : toNum(opt.value),
                                                DebitAccountName: !opt ? "" : opt.label
                                            }));
                                            setReferences(pre => pre.filter(r => !stringCompare(r.dr_cr, "Dr")));
                                        }}
                                        isClearable
                                        isSearchable
                                        styles={{ ...customSelectStyles, menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                        filterOption={reactSelectFilterLogic}
                                    />
                                    <ListReference
                                        data={references.filter(r => r.dr_cr === 'Dr')}
                                        onDelete={(item) => {
                                            setReferences(pre => pre.filter(r => !(
                                                isEqualNumber(r.bill_id, item.bill_id) || stringCompare(r.bill_no, item.bill_no)
                                            )));
                                            setData(pre => ({
                                                ...pre,
                                                Amount: Math.max(0, Number(pre.Amount || 0) - Number(item.amount || 0))
                                            }));
                                        }}
                                        title="Payment Reference"
                                    />
                                </div>
                            </div>

                            {/* credit account */}
                            <div className="col-md-6 p-2">
                                <div className="mb-2 d-flex justify-content-between align-items-center">
                                    <h6>Credit</h6>
                                    <Button
                                        onClick={() => {
                                            setData(pre => ({ ...pre, dr_cr: 'Cr' }));
                                            setRefDialog(pre => ({ ...pre, open: true }))
                                        }}
                                        startIcon={<Add />}
                                        disabled={
                                            !isValidNumber(data.CreditAccount)
                                            || references.some(r => stringCompare(r.dr_cr, "Dr"))
                                        }
                                    >Credit Ref</Button>
                                </div>
                                <div className="border rounded-3 p-3">
                                    <label>Credit Account</label>
                                    <Select
                                        placeholder="Select credit account"
                                        value={selCredit}
                                        options={options}
                                        isOptionDisabled={disableOption("Cr")}
                                        onChange={(opt) => {
                                            setData((p) => ({
                                                ...p,
                                                CreditAccount: !opt ? null : toNum(opt.value),
                                                CreditAccountName: !opt ? "" : opt.label
                                            }));
                                            setReferences(pre => pre.filter(r => !stringCompare(r.dr_cr, "Cr")));
                                        }}
                                        isClearable
                                        isSearchable
                                        styles={{ ...customSelectStyles, menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                        filterOption={reactSelectFilterLogic}
                                    />
                                    <ListReference
                                        data={references.filter(r => r.dr_cr === 'Cr')}
                                        onDelete={(item) => {
                                            setReferences(pre => pre.filter(r => !(
                                                isEqualNumber(r.bill_id, item.bill_id) || stringCompare(r.bill_no, item.bill_no)
                                            )));
                                            setData(pre => ({
                                                ...pre,
                                                Amount: Math.max(0, Number(pre.Amount || 0) - Number(item.amount || 0))
                                            }));
                                        }}
                                        title="Receipt Reference"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* amount */}
                        <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Amount</label>
                            <input
                                className="cus-inpt p-2"
                                value={data.Amount || ''}
                                onInput={onlynum}
                                onChange={(e) => change("Amount", e.target.value)}
                            />
                        </div>

                        {/* Transaction Type */}
                        <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Transaction Type</label>
                            <select
                                value={data.TransactionType || ''}
                                onChange={e => change('TransactionType', e.target.value)}
                                className="cus-inpt p-2"
                                required
                            >
                                {transactionTypes.map((type, ind) => (
                                    <option value={type.value} key={ind}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12"></div>

                        {/* bank name */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Bank Name</label>
                            <Select
                                placeholder="Select debit account"
                                value={{ value: data.BankName, label: data.BankName }}
                                options={toArray(baseData.bankMaster).map(
                                    bank => ({ value: bank?.label, label: bank?.label })
                                )}
                                onChange={(opt) => setData((p) => ({
                                    ...p,
                                    BankName: !opt ? "" : opt.value
                                }))}
                                isClearable
                                isSearchable
                                styles={{ ...customSelectStyles, menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                menuPortalTarget={document.body}
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        {/* bank Date */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Bank Date</label>
                            <input
                                type="date"
                                className="cus-inpt p-2"
                                value={data?.BankDate || ''}
                                onChange={(e) => change("BankDate", e.target.value)}
                            />
                        </div>

                        {/* check number */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Cheque Number</label>
                            <input
                                className="cus-inpt p-2"
                                value={data.Chequeno || ''}
                                onChange={(e) => change("Chequeno", e.target.value)}
                            />
                        </div>

                        {/* cheque Date */}
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Cheque Date</label>
                            <input
                                type="date"
                                className="cus-inpt p-2"
                                value={data?.ChequeDate || ''}
                                onChange={(e) => change("ChequeDate", e.target.value)}
                            />
                        </div>

                        {/* narration */}
                        <div className="col-md-8 p-2">
                            <label>Narration</label><br />
                            <input
                                className="cus-inpt p-2"
                                style={{ maxWidth: '400px' }}
                                value={data.Narration}
                                onChange={(e) => change("Narration", e.target.value)}
                            />
                        </div>

                    </div>

                </CardContent>
            </Card>

            <AppDialog
                open={refDialog.open}
                onClose={() => {
                    setRefDialog(p => ({ ...p, open: false }));
                    setReferenceData([])
                }}
                title="Contra Reference"
                fullScreen
                submitText="Select"
                closeText="close"
            >
                <AppTableComponent
                    EnableSerialNumber={true}
                    dataArray={referenceData}
                    columns={[
                        createCol('uniqueNumber', 'string', 'Voucher No'),
                        createCol('voucherTypeGet', 'string', 'Voucher Type'),
                        createCol('entryDate', 'date', 'Date'),
                        // createCol('debitAccountGet', 'string', 'Debit'),
                        createCol('displayAccount', 'string', 'Party'),
                        createCol('amount', 'number', 'Amount'),
                        createCol('check_no', 'string', 'Cheque No'),
                        createCol('check_date', 'date', 'Cheque Date'),
                        createCol('bank_name', 'string', 'Bank Name'),
                        // createCol('debit_amount', 'number', 'Debit Amount'),
                        {
                            isVisible: 1,
                            ColumnHeader: '#',
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <IconButton size="small">
                                    <Checkbox
                                        checked={
                                            references.some(
                                                r => isEqualNumber(r.bill_id, row.uniqueId)
                                                    && stringCompare(r.bill_no, row.uniqueNumber)
                                            )
                                        }
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setReferences(pre => [...pre, {
                                                    ...contrarReference,
                                                    dr_cr: data.dr_cr,
                                                    bill_id: Number(row?.uniqueId),
                                                    bill_no: row?.uniqueNumber || '',
                                                    amount: row.amount,
                                                }]);
                                                if (references.length === 0) {
                                                    setData(pre => ({
                                                        ...pre,
                                                        Amount: row.amount,
                                                        TransactionType: row.transaction_type,
                                                        BankName: row.bank_name,
                                                        Chequeno: row.check_no,
                                                        ChequeDate: row.check_date ? ISOString(row.check_date) : '',
                                                    }));
                                                } else {
                                                    setData(pre => ({
                                                        ...pre,
                                                        Amount: Number(pre.Amount || 0) + Number(row.amount),
                                                    }));
                                                }
                                            } else {
                                                setReferences(pre => pre.filter(r => !(isEqualNumber(r.bill_id, row.uniqueId) && stringCompare(r.bill_no, row.uniqueNumber))));
                                                setData(pre => ({
                                                    ...pre,
                                                    Amount: Math.max(0, Number(pre.Amount || 0) - Number(row.amount)),
                                                }));
                                            }
                                        }}
                                        size='small'
                                    />
                                </IconButton>
                            ),
                        },
                    ]}
                    ButtonArea={
                        <>
                            <input
                                type="date"
                                value={refDialog.Fromdate}
                                onChange={e => setRefDialog(pre => ({ ...pre, Fromdate: e.target.value }))}
                                className="cus-inpt p-2 w-auto"
                            />
                            -
                            <input
                                type="date"
                                value={refDialog.Todate}
                                onChange={e => setRefDialog(pre => ({ ...pre, Todate: e.target.value }))}
                                className="cus-inpt p-2 w-auto"
                            />

                            <IconButton
                                onClick={() => refHandle(data.dr_cr === 'Dr' ? data.DebitAccount : data.CreditAccount)}
                                size="small"
                            ><Search /></IconButton>
                        </>
                    }
                />
            </AppDialog>
        </>
    );
};

export default ContraScreen;
