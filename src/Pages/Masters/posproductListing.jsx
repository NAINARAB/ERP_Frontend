import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { filterableText, isEqualNumber } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { Card, IconButton,Button } from "@mui/material";
import { toast } from 'react-toastify';
import { Sync, Visibility } from "@mui/icons-material";



const PosproductListing = ({ loadingOn, loadingOff }) => {
    const [ERPLOL, setERPLOL] = useState([]);
    const [tallyLOL, setTallyLOL] = useState([]);

    const [filters, setFilters] = useState({
        FromDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], 
        ToDate: new Date().toISOString().split('T')[0], 
        refresh: false,
        viewNotSynced: false,
        searchERPLol: '',
        searchTallyLol: '',
        searchNotSynced: ''
    }) 


    const notSyncedList = useMemo(() => {
        return ERPLOL.filter(talFil =>
            !tallyLOL.some(erpFil =>
                isEqualNumber(talFil.invoiceno, erpFil.invoiceno)
            )
        );
    }, [ERPLOL, tallyLOL])

    const ERPLOLList = useMemo(() => {
        return filters.searchERPLol ? ERPLOL.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchERPLol))
        ) : ERPLOL
    }, [filters.searchERPLol, ERPLOL]);

    const TallyLOLList = useMemo(() => {
        return filters.searchTallyLol ? tallyLOL.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchTallyLol))
        ) : tallyLOL;
    }, [filters.searchTallyLol, tallyLOL])

    const filteredNotSyncedList = useMemo(() => {
        return filters.searchNotSynced ? notSyncedList.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchNotSynced))
        ) : notSyncedList;
    }, [notSyncedList, filters.searchNotSynced])


    useEffect(() => {
        if (loadingOn) loadingOn();
    
        fetchLink({
            address: `masters/posProductList?FromDate=${filters.FromDate}&ToDate=${filters.ToDate}`,
        })
        .then(data => {
            if (data.success) {
             
                const tallyLOL = Array.isArray(data?.others?.tallyResult) ? data.others.tallyResult : [];
                setERPLOL(data.data);
                setTallyLOL(tallyLOL);
            }
        })
        .catch(e => { console.error(e); }) 
        .finally(() => {
            if (loadingOff) loadingOff();
        });
    
    }, [filters.refresh, filters.FromDate, filters.ToDate]);
    
const syncLOL = () => {
    if (loadingOn) loadingOn();

    fetchLink({
        address: `masters/posProductList?FromDate=${filters.FromDate}&ToDate=${filters.ToDate}`,

    }).then(data => {
        if (data.success) {
          
            const tallyLOL = Array.isArray(data?.others?.tallyResult) ? data?.others?.tallyResult : [];
            setERPLOL(data.data);
            setTallyLOL(tallyLOL);
        }
     }).catch(e => console.error(e)).finally(() => {
        if (loadingOff) loadingOff()
    })
}



    const ExpendableComponent = ({ row }) => {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th className="border p-2 bg-light">Product ID</th>
                        <th className="border p-2 bg-light">Product Name</th>
                        <th className="border p-2 bg-light">Qty</th>
                        <th className="border p-2 bg-light">Price</th>
                        <th className="border p-2 bg-light">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    {row?.items?.map((data, index) => (
                        <tr key={index}>
                            <td className="border p-2">{data?.icode}</td>
                            <td className="border p-2">{data?.product_name}</td>
                            <td className="border p-2">{data?.qty}</td>
                            <td className="border p-2">{data?.sell}</td>
                            <td className="border p-2">{data?.qty && data?.sell ? data.qty * data.sell : 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        );
    };


const SyncData=(data)=>{
  
    if (loadingOn) loadingOn();
  

   fetchLink({
    address: `masters/syncPOSData?invoiceId=${data.invoiceno}` }).then((data) => {
             if (data.success) {
             
                 toast.success(data.message);
             } else {
                 toast.error(data.message);
             }
            }).catch(e => console.error(e)).finally(() => {
                setFilters(prevFilters => ({
                    ...prevFilters,
                    refresh: !prevFilters.refresh  
                }));
                if (loadingOff) loadingOff()
            })
}

    return (
        <>
            <Card>
            
                <div
                    className="px-3 py-2 fa-14"
                >
                    <div className="d-flex flex-wrap align-items-center">
                        <h5 className="flex-grow-1">POS SYNC (Differents: {notSyncedList.length})</h5>
                        <td style={{ verticalAlign: 'middle' }}>From</td>
                        <td>
                            <input
                                type="date"
                                value={filters.FromDate}
                                onChange={e => setFilters({ ...filters, FromDate: e.target.value })}
                                className="cus-inpt"
                            />
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>To</td>
                        <td>
                            <input
                                type="date"
                                value={filters.ToDate}
                                onChange={e => setFilters({ ...filters, ToDate: e.target.value })}
                                className="cus-inpt"
                            />
                        </td>
                        <Button onClick={syncLOL}>Search</Button>
                        {/* <IconButton size='small' onClick={syncLOL}><Sync /></IconButton> */}

                        <IconButton
                            size='small'
                            onClick={() => {
                                setFilters(prev => {

                                    const updatedFilters = { ...prev, viewNotSynced: !prev.viewNotSynced };

                                    return updatedFilters;
                                });
                            }}
                        >
                            <Visibility />
                        </IconButton>

                    </div>
                    <div className="d-flex flex-wrap align-items-center">

                    </div>
                </div>

                {filters.viewNotSynced ? (
                    <FilterableTable
                        title={"Not synced list "}
                        bodyFontSizePx={11}
                        headerFontSizePx={11}
                        dataArray={filteredNotSyncedList}
                        columns={[
                            createCol('invoiceno', 'string', 'Invoice'),
                            createCol('edate', 'date', 'edate'),
                            createCol('Retailer_Name', 'string', 'Retailer'),
                            createCol('Broker', 'string', 'Broker_Name'),
                            createCol('Transporter', 'string', 'Transporter'),
                            createCol('namount', 'string', 'Net Amount'),
                               {
                            
                                                        Field_Name: "Actions",
                                                        ColumnHeader: "Actions",
                                                        isVisible: 1,
                                                        isCustomCell: true,
                                                        Cell: ({ row }) => {
                            
                                                            return (
                                                                <td className="fa-12" style={{ minWidth: "80px" }}>
                                                                    <IconButton size='small' onClick={()=>SyncData(row)}><Sync /></IconButton>
                                                                </td>
                                                            );
                                                        },
                                                    },
                        ]}
                        isExpendable={true}
                        tableMaxHeight={550}
                        expandableComp={ExpendableComponent}
                        ButtonArea={
                            <>
                                <input
                                    type='search'
                                    className="cus-inpt p-1 w-auto"
                                    value={filters.searchNotSynced}
                                    onChange={e => setFilters(pre => ({ ...pre, searchNotSynced: e.target.value }))}
                                    placeholder="Search.."
                                />
                            </>
                        }
                    />
                ) : (
                    <>
                        <div className="row">
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"Data POS - " + ERPLOL.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={ERPLOLList}
                                    columns={[
                                        createCol('invoiceno', 'string', 'Invoice'),
                                        createCol('edate', 'date', 'edate'),
                                        createCol('Retailer_Name', 'string', 'Retailer_Name'),
                                          createCol('Broker', 'string', 'Broker'),
                                           createCol('Transporter', 'string', 'Transporter'),
                                        // createCol('cusid', 'string', 'Customer_Id'),
                                        createCol('namount', 'string', 'Net Amount'),
                                    ]}
                                    ButtonArea={
                                        <>
                                            <input
                                                type='search'
                                                className="cus-inpt p-1 w-auto"
                                                value={filters.searchERPLol}
                                                onChange={e => setFilters(pre => ({ ...pre, searchERPLol: e.target.value }))}
                                                placeholder="Search.."
                                            />
                                        </>
                                    }
                                    // EnableSerialNumber={true}
                                    isExpendable={true}
                                    tableMaxHeight={550}
                                    expandableComp={ExpendableComponent}
                                />

                            </div>
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"DataBase - " + tallyLOL.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={TallyLOLList}
                                    columns={[
                                        createCol('invoiceno', 'string', 'invoiceno'),
                                        createCol('edate', 'date', 'edate'),
                                        createCol('Retailer_Name', 'string', 'Retailer_Name'),
                                          createCol('Broker_Name', 'string', 'Broker'),
                                           createCol('Transporter_Name', 'string', 'Transporter'),
                                        // createCol('cusid', 'string', 'Customer_Id'),
                                        createCol('namount', 'string', 'Net Amount'),
                                    ]}
                                    ButtonArea={
                                        <>
                                            <input
                                                type='search'
                                                className="cus-inpt p-1 w-auto"
                                                value={filters.searchTallyLol}
                                                onChange={e => setFilters(pre => ({ ...pre, searchTallyLol: e.target.value }))}
                                                placeholder="Search.."
                                            />
                                        </>
                                    }
                                    isExpendable={true}
                                    tableMaxHeight={550}
                                    expandableComp={ExpendableComponent}

                                />
                            </div>
                        </div>
                    </>
                )}
            </Card>

        </>
    )
}

export default PosproductListing;