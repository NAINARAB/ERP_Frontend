import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { contraIV, contraStatus } from "./contraVariables";
import { checkIsNumber, isEqualNumber, ISOString, isValidObject, onlynum, toArray } from "../../../Components/functions";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Button, Card, CardContent } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";


const ContraScreen = ({
    loadingOn, loadingOff
}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const [data, setData] = useState(contraIV);

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
                        if (key === 'ContraDate') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        if (key === 'BankDate') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        return [key, editValues[key] ?? value]
                    })
                )
            );
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
        return okDr && okCr && notSame && data.ContraDate && data.BranchId && data.VoucherType !== "";
    }, [data]);

    const clear = () => {
        setData((p) => ({
            ...contraIV,
            ContraDate: ISOString()
        }));
    };

    const onSave = async () => {
        if (!canSave) return;

        fetchLink({
            address: `contra/master`,
            method: data?.ContraAutoId ? 'PUT' : 'POST',
            bodyData: data,
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

                        <div className="col-12 p-0 m-0"></div>

                        <div className="row p-0 m-0">
                            <div className="col-md-6 p-2">
                                <h6 className="mb-2 text-center">Debit</h6>
                                <div className="border rounded-3 p-3">
                                    <div className="row p-0 m-0">
                                        <div className="col-12 p-0 m-0">
                                            <label>Debit Account</label>
                                            <Select
                                                placeholder="Select debit account"
                                                value={selDebit}
                                                options={options}
                                                isOptionDisabled={disableOption("Dr")}
                                                onChange={(opt) => setData((p) => ({
                                                    ...p,
                                                    DebitAccount: !opt ? null : toNum(opt.value),
                                                    DebitAccountName: !opt ? "" : opt.label
                                                }))}
                                                isClearable
                                                isSearchable
                                                styles={{ ...customSelectStyles, menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 p-2">
                                <h6 className="mb-2 text-center">Credit</h6>
                                <div className="border rounded-3 p-3">
                                    <div className="row p-0 m-0">
                                        <div className="col-12 p-0 m-0">
                                            <label>Credit Account</label>
                                            <Select
                                                placeholder="Select credit account"
                                                value={selCredit}
                                                options={options}
                                                isOptionDisabled={disableOption("Cr")}
                                                onChange={(opt) => setData((p) => ({
                                                    ...p,
                                                    CreditAccount: !opt ? null : toNum(opt.value),
                                                    CreditAccountName: !opt ? "" : opt.label
                                                }))}
                                                isClearable
                                                isSearchable
                                                styles={{ ...customSelectStyles, menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                    </div>
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

                        {/* bank name */}
                        <div className="col-lg-3 col-md-4 col-sm-6 p-2">
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
                            />
                        </div>

                        {/* bank Date */}
                        <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Bank Date</label>
                            <input
                                type="date"
                                className="cus-inpt p-2"
                                value={data?.BankDate || ''}
                                onChange={(e) => change("BankDate", e.target.value)}
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
        </>
    );
};

export default ContraScreen;
