import { useEffect, useState } from "react";
import { fetchLink } from '../../Components/fetchComponent';
import { isEqualNumber, isValidObject } from '../../Components/functions';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";
import FilterableTable from "../../Components/filterableTable2";
import RequiredStar from "../../Components/requiredStar";

const initialValue = {
    id: '',
    name: '',
    menu_type: 1,
    parent_id: '',
    url: '/',
    tUrl: '/',
    rUrl: '/',
    actionType: 'internal',
    display_order: 1,
    is_active: 1,
    parantDetails: {},
}

const DisplaySubMenu = ({ row, setDialog, setInputValues }) => {

    return (
        <>
            {row.SubMenu.length > 0 && (
                <FilterableTable
                    dataArray={row?.SubMenu ?? []}
                    title='Sub Menus'
                    columns={[
                        {
                            isVisible: 1,
                            Field_Name: 'name',
                            Fied_Data: 'string',
                            ColumnHeader: 'Sub Menu',
                        },
                        {
                            isVisible: 1,
                            Field_Name: 'url',
                            Fied_Data: 'string',
                            ColumnHeader: 'Address',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <Tooltip title='Add Child-Menu'>
                                    <span>
                                        <Button
                                            size="small"
                                            className="bg-light"
                                            onClick={() => {
                                                setInputValues(
                                                    Object.fromEntries(
                                                        Object.entries(initialValue).map(([key, value]) => {
                                                            switch (key) {
                                                                case 'menu_type':
                                                                    return [key, 3];
                                                                case 'parent_id':
                                                                    return [key, row.id];
                                                                case 'parantDetails':
                                                                    return [key, row];
                                                                case 'url':
                                                                    return [key, (row?.ParantData?.url ? (row?.ParantData?.url + '/') : '') + String(row?.url) + '/' + '/'];
                                                                default:
                                                                    return [key, row[key] || value];
                                                            }
                                                        })
                                                    )
                                                )
                                                setDialog(true);
                                            }}
                                            startIcon={<Add sx={{ fontSize: '18px' }} />}
                                        >
                                            {row?.ChildMenu?.length ?? 0}
                                        </Button>
                                    </span>
                                </Tooltip>
                            ),
                            ColumnHeader: 'Child Menu',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <Tooltip title='Add SubRouting'>
                                    <span>
                                        <Button
                                            size="small"
                                            className="bg-light"
                                            onClick={() => {
                                                setInputValues(
                                                    Object.fromEntries(
                                                        Object.entries(initialValue).map(([key, value]) => {
                                                            switch (key) {
                                                                case 'menu_type':
                                                                    return [key, 0];
                                                                case 'parent_id':
                                                                    return [key, row.id];
                                                                case 'parantDetails':
                                                                    return [key, row];
                                                                case 'url':
                                                                    return [key, (row?.ParantData?.url ? (row?.ParantData?.url + '/') : '') + (row?.url ?? '') + '/'];
                                                                default:
                                                                    return [key, row[key] || value];
                                                            }
                                                        })
                                                    )
                                                )
                                                setDialog(true);
                                            }}
                                            startIcon={<Add sx={{ fontSize: '18px' }} />}
                                        >
                                            {row?.SubRoutes?.length ?? 0}
                                        </Button>
                                    </span>
                                </Tooltip>
                            ),
                            ColumnHeader: 'Sub Routings',
                        },
                        {
                            isVisible: 1,
                            Field_Name: 'display_order',
                            Fied_Data: 'number',
                            ColumnHeader: 'Order',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                isEqualNumber(row?.is_active, 1) ? (
                                    <span className="px-3 py-1 rounded-3 text-white bg-success">Active</span>
                                ) : (
                                    <span className="px-3 py-1 rounded-3 text-white bg-danger">Disabled</span>
                                )
                            ),
                            ColumnHeader: 'Status',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <>
                                    <Tooltip title='Edit Menu'>
                                        <IconButton
                                            size="small"
                                            className="p-1"
                                            onClick={() => {
                                                setInputValues(
                                                    Object.fromEntries(
                                                        Object.entries(initialValue).map(([key, value]) => {
                                                            switch (key) {
                                                                case 'menu_type':
                                                                    return [key, 2];
                                                                case 'parent_id':
                                                                    return [key, row?.parent_id ?? ''];
                                                                case 'parantDetails':
                                                                    return [key, row];
                                                                case 'url':
                                                                    return [key, (row?.url ?? '') + '/'];
                                                                default:
                                                                    return [key, row[key] || value];
                                                            }
                                                        })
                                                    )
                                                )
                                                setDialog(true);
                                            }}
                                        >
                                            <Edit sx={{ fontSize: '18px' }} />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ),
                            ColumnHeader: 'Action',
                        }
                    ]}
                    tableMaxHeight={700}
                    isExpendable={true}
                    expandableComp={
                        ({ row }) => (
                            row?.ChildMenu?.length > 0 ||
                            row?.SubRoutes?.length > 0
                        ) && <DisplayChildMenu row={row} setInputValues={setInputValues} setDialog={setDialog} />
                    }
                />
            )}

            {row.SubRoutes.length > 0 && (
                <>
                    <br />
                    <DisplaySubRoutings
                        dataSource={row}
                        setInputValues={setInputValues}
                        setDialog={setDialog}
                        parantURL={(row?.ParantData?.url ? (row?.ParantData?.url + '/') : '')}
                    />
                </>
            )}
        </>
    )
}

const DisplayChildMenu = ({ row, setInputValues, setDialog }) => {

    return (
        <>
            {row?.ChildMenu?.length > 0 && (
                <FilterableTable
                    dataArray={row?.ChildMenu ?? []}
                    title='Child Menus'
                    columns={[
                        {
                            isVisible: 1,
                            Field_Name: 'name',
                            Fied_Data: 'string',
                            ColumnHeader: 'Child Menu',
                        },
                        {
                            isVisible: 1,
                            Field_Name: 'url',
                            Fied_Data: 'string',
                            ColumnHeader: 'Address',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <Tooltip title='Add SubRouting'>
                                    <span>
                                        <Button
                                            size="small"
                                            className="bg-light"
                                            onClick={() => {
                                                setInputValues(
                                                    Object.fromEntries(
                                                        Object.entries(initialValue).map(([key, value]) => {
                                                            switch (key) {
                                                                case 'menu_type':
                                                                    return [key, 0];
                                                                case 'parent_id':
                                                                    return [key, row?.id ?? ''];
                                                                case 'parantDetails':
                                                                    return [key, row];
                                                                case 'url':
                                                                    return [key, String(row?.url) + '/'];
                                                                default:
                                                                    return [key, row[key] || value];
                                                            }
                                                        })
                                                    )
                                                )
                                                setDialog(true);
                                            }}
                                            startIcon={<Add sx={{ fontSize: '18px' }} />}
                                        >
                                            {row?.SubRoutes?.length ?? 0}
                                        </Button>
                                    </span>
                                </Tooltip>
                            ),
                            ColumnHeader: 'Sub Routings',
                        },
                        {
                            isVisible: 1,
                            Field_Name: 'display_order',
                            Fied_Data: 'number',
                            ColumnHeader: 'Order',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                isEqualNumber(row?.is_active, 1) ? (
                                    <span className="px-3 py-1 rounded-3 text-white bg-success">Active</span>
                                ) : (
                                    <span className="px-3 py-1 rounded-3 text-white bg-danger">Disabled</span>
                                )
                            ),
                            ColumnHeader: 'Status',
                        },
                        {
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <>
                                    <Tooltip title='Edit Menu'>
                                        <IconButton
                                            size="small"
                                            className="p-1"
                                            onClick={() => {
                                                setInputValues(
                                                    Object.fromEntries(
                                                        Object.entries(initialValue).map(([key, value]) => {
                                                            switch (key) {
                                                                case 'menu_type':
                                                                    return [key, 3];
                                                                case 'parent_id':
                                                                    return [key, row?.parent_id ?? ''];
                                                                case 'parantDetails':
                                                                    return [key, row];
                                                                case 'url':
                                                                    return [key, row?.url ?? ''];
                                                                default:
                                                                    return [key, row[key] || value];
                                                            }
                                                        })
                                                    )
                                                )
                                                setDialog(true);
                                            }}
                                        >
                                            <Edit sx={{ fontSize: '18px' }} />
                                        </IconButton>
                                    </Tooltip>

                                </>
                            ),
                            ColumnHeader: 'Action',
                        }
                    ]}
                    tableMaxHeight={700}
                    isExpendable={true}
                    expandableComp={
                        ({ row }) => row?.SubRoutes?.length > 0 && (
                            <DisplaySubRoutings
                                dataSource={row}
                                setInputValues={setInputValues}
                                setDialog={setDialog}
                            />
                        )}
                />
            )}

            {row.SubRoutes.length > 0 && (
                <>
                    <br />
                    <DisplaySubRoutings
                        dataSource={row}
                        setInputValues={setInputValues}
                        setDialog={setDialog}
                        parantURL={(row?.ParantData?.url ? (row?.ParantData?.url + '/') : '')}
                    />
                </>
            )}
        </>
    )
}

const DisplaySubRoutings = ({ dataSource, setInputValues, setDialog, parantURL }) => (
    <FilterableTable
        dataArray={dataSource?.SubRoutes ?? []}
        title='Sub Routes'
        columns={[
            {
                isVisible: 1,
                Field_Name: 'name',
                Fied_Data: 'string',
                ColumnHeader: 'Menu',
            },
            {
                isVisible: 1,
                Field_Name: 'url',
                Fied_Data: 'string',
                ColumnHeader: 'Address',
            },
            {
                isVisible: 1,
                isCustomCell: true,
                Cell: ({ row }) => (
                    <Tooltip title='Add SubRouting'>
                        <span>
                            <Button
                                size="small"
                                className="bg-light"
                                onClick={() => {
                                    setInputValues(
                                        Object.fromEntries(
                                            Object.entries(initialValue).map(([key, value]) => {
                                                switch (key) {
                                                    case 'menu_type':
                                                        return [key, 0];
                                                    case 'parent_id':
                                                        return [key, row?.id ?? ''];
                                                    case 'parantDetails':
                                                        return [key, row];
                                                    case 'url':
                                                        return [key, parantURL];
                                                    default:
                                                        return [key, row[key] || value];
                                                }
                                            })
                                        )
                                    )
                                    setDialog(true);
                                }}
                                startIcon={<Add sx={{ fontSize: '18px' }} />}
                            >
                                {row?.SubRoutes?.length ?? 0}
                            </Button>
                        </span>
                    </Tooltip>
                ),
                ColumnHeader: 'Sub Routings',
            },
            {
                isVisible: 1,
                Field_Name: 'display_order',
                Fied_Data: 'number',
                ColumnHeader: 'Order',
            },
            {
                isVisible: 1,
                isCustomCell: true,
                Cell: ({ row }) => (
                    isEqualNumber(row?.is_active, 1) ? (
                        <span className="px-3 py-1 rounded-3 text-white bg-success">Active</span>
                    ) : (
                        <span className="px-3 py-1 rounded-3 text-white bg-danger">Disabled</span>
                    )
                ),
                ColumnHeader: 'Status',
            },
            {
                isVisible: 1,
                isCustomCell: true,
                Cell: ({ row }) => (
                    <>
                        <Tooltip title='Edit Menu'>
                            <IconButton
                                size="small"
                                className="p-1"
                                onClick={() => {
                                    setInputValues(
                                        Object.fromEntries(
                                            Object.entries(initialValue).map(([key, value]) => {
                                                switch (key) {
                                                    case 'menu_type':
                                                        return [key, 0];
                                                    case 'parent_id':
                                                        return [key, row?.id ?? ''];
                                                    case 'parantDetails':
                                                        return [key, row];
                                                    case 'url':
                                                        return [key, row?.url ?? ''];
                                                    default:
                                                        return [key, row[key] || value];
                                                }
                                            })
                                        )
                                    )
                                    setDialog(true);
                                }}
                            >
                                <Edit sx={{ fontSize: '18px' }} />
                            </IconButton>
                        </Tooltip>
                    </>
                ),
                ColumnHeader: 'Action',
            }
        ]}
        tableMaxHeight={700}
        isExpendable={true}
        expandableComp={({ row }) => (row?.SubRoutes?.length > 0) && (
            <DisplaySubRoutings
                dataSource={row}
                setInputValues={setInputValues}
                setDialog={setDialog}
                parantURL={String(row?.url + '/')}
            />
        )}
    />
)

const MenuManagement = ({ loadingOn, loadingOff }) => {
    const [inputValues, setInputValues] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [menuData, setMenuData] = useState([]);
    const [dialog, setDialog] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `authorization/menuMaster`,
        }).then(data => {
            if (data.success) {
                setMenuData(data.data);
            }
        }).catch(e => console.error(e))
    }, [reload]);

    const closeDialog = () => {
        setDialog(false);
        setInputValues(initialValue);
    }

    const saveData = () => {
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: 'authorization/menuMaster',
            method: inputValues.id ? 'PUT' : 'POST',
            bodyData: inputValues
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                closeDialog();
                setReload(pre => !pre);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        })
    }

    console.log(inputValues)

    return (
        <>
            <FilterableTable
                title="Main Menu"
                ButtonArea={
                    <Button
                        onClick={() => {
                            setDialog(true);
                            setInputValues(initialValue);
                        }}
                        variant="outlined"
                        startIcon={<Add />}
                    >
                        New Menu
                    </Button>
                }
                dataArray={menuData}
                columns={[
                    {
                        isVisible: 1,
                        Field_Name: 'name',
                        Fied_Data: 'string',
                        ColumnHeader: 'Main Menu',
                    },
                    {
                        isVisible: 1,
                        Field_Name: 'url',
                        Fied_Data: 'string',
                        ColumnHeader: 'Address',
                    },
                    {
                        isVisible: 1,
                        Field_Name: 'tUrl',
                        Fied_Data: 'string',
                        ColumnHeader: 'Task Management',
                    },
                    {
                        isVisible: 1,
                        Field_Name: 'rUrl',
                        Fied_Data: 'string',
                        ColumnHeader: 'Report URL',
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <Tooltip title='Add Sub-Menu'>
                                <span>
                                    <Button
                                        size="small"
                                        className="bg-light"
                                        onClick={() => {
                                            setInputValues(
                                                Object.fromEntries(
                                                    Object.entries(initialValue).map(([key, value]) => {
                                                        switch (key) {
                                                            case 'menu_type':
                                                                return [key, 2];
                                                            case 'parent_id':
                                                                return [key, row.id];
                                                            case 'parantDetails':
                                                                return [key, row];
                                                            case 'url':
                                                                return [key, (row?.url ?? '') + '/'];
                                                            default:
                                                                return [key, row[key] || value];
                                                        }
                                                    })
                                                )
                                            )
                                            setDialog(true);
                                        }}
                                        startIcon={<Add sx={{ fontSize: '18px' }} />}
                                    >
                                        {row?.SubMenu?.length ?? 0}
                                    </Button>
                                </span>
                            </Tooltip>
                        ),
                        ColumnHeader: 'Sub Menu',
                        align: 'center'
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <Tooltip title='Add SubRouting'>
                                <span>
                                    <Button
                                        size="small"
                                        className="bg-light"
                                        onClick={() => {
                                            setInputValues(
                                                Object.fromEntries(
                                                    Object.entries(initialValue).map(([key, value]) => {
                                                        switch (key) {
                                                            case 'menu_type':
                                                                return [key, 0];
                                                            case 'parent_id':
                                                                return [key, row.id];
                                                            case 'parantDetails':
                                                                return [key, row];
                                                            case 'url':
                                                                return [key, (row?.url ?? '') + '/'];
                                                            default:
                                                                return [key, row[key] || value];
                                                        }
                                                    })
                                                )
                                            )
                                            setDialog(true);
                                        }}
                                        startIcon={<Add sx={{ fontSize: '18px' }} />}
                                    >
                                        {row?.SubRoutes?.length ?? 0}
                                    </Button>
                                </span>
                            </Tooltip>
                        ),
                        ColumnHeader: 'Sub Routings',
                        align: 'center'
                    },
                    {
                        isVisible: 1,
                        Field_Name: 'display_order',
                        Fied_Data: 'number',
                        ColumnHeader: 'Order',
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            isEqualNumber(row?.is_active, 0) ? (
                                <span className="px-3 py-1 rounded-3 text-white bg-danger">Disabled</span>
                            ) : (
                                <span className="px-3 py-1 rounded-3 text-white bg-success">
                                    {isEqualNumber(row.is_active, 1) ?
                                        'ERP' : isEqualNumber(row.is_active, 2) ?
                                            'TaskApp' : 'ReportApp'
                                    }
                                </span>
                            )
                        ),
                        ColumnHeader: 'Status',
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <>
                                <Tooltip title='Edit Menu'>
                                    <IconButton
                                        size="small"
                                        className="p-1"
                                        onClick={() => {
                                            setInputValues(
                                                Object.fromEntries(
                                                    Object.entries(initialValue).map(([key, value]) => {
                                                        switch (key) {
                                                            // case 'menu_type':
                                                            //     return [key, 1];
                                                            case 'parent_id':
                                                                return [key, row.parent_id];
                                                            case 'parantDetails':
                                                                return [key, row];
                                                            case 'url':
                                                                return [key, (row?.url ?? '') + '/'];
                                                            default:
                                                                return [key, row[key] || value];
                                                        }
                                                    })
                                                )
                                            )
                                            setDialog(true);
                                        }}
                                    >
                                        <Edit sx={{ fontSize: '18px' }} />
                                    </IconButton>
                                </Tooltip>


                            </>
                        ),
                        ColumnHeader: 'Action',
                    }
                ]}
                tableMaxHeight={700}
                isExpendable={true}
                expandableComp={
                    ({ row }) => (
                        row?.SubMenu?.length > 0 ||
                        row?.SubRoutes?.length > 0
                    ) && <DisplaySubMenu row={row} setDialog={setDialog} setInputValues={setInputValues} />
                }
            />


            <Dialog
                open={dialog}
                onClose={closeDialog}
                maxWidth='md' fullWidth
            >
                <DialogTitle>
                    {inputValues.id ? 'Modify ' : 'Add '}
                    {(() => {
                        switch (inputValues.menu_type) {
                            case 0:
                                return 'SUB ROUTING'
                            case 1:
                                return 'MAIN MENU'
                            case 2:
                                return 'SUB MENU'
                            case 3:
                                return 'CHILD MENU'
                            default:
                                return ''
                        }
                    })()}
                </DialogTitle>

                <form onSubmit={e => {
                    e.preventDefault();
                    saveData();
                }}>
                    <DialogContent>
                        <div className="row">

                            {(isValidObject(inputValues.parantDetails) && inputValues.parantDetails.name) && (
                                <div className="col-lg-12 p-2">
                                    <label>Parant Name </label>
                                    <input
                                        className="cus-inpt"
                                        value={inputValues?.parantDetails?.name}
                                        disabled
                                    />
                                </div>
                            )}

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Name <RequiredStar /></label>
                                <input
                                    className="cus-inpt"
                                    value={inputValues.name}
                                    onChange={e => setInputValues(pre => ({ ...pre, name: e.target.value }))}
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Order No</label>
                                <input
                                    className="cus-inpt"
                                    value={inputValues.display_order}
                                    onChange={e => setInputValues(pre => ({ ...pre, display_order: e.target.value }))}
                                />
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Type</label>
                                <select
                                    className="cus-inpt"
                                    value={inputValues.menu_type}
                                    onChange={e => setInputValues(pre => ({ ...pre, menu_type: e.target.value }))}
                                >
                                    <option value="1">Main Menu</option>
                                    <option value="2">Sub Menu</option>
                                    <option value="3">Child Menu</option>
                                    <option value="0">Sub Routing</option>
                                </select>
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Is Active</label>
                                <select
                                    className="cus-inpt"
                                    value={inputValues.is_active}
                                    onChange={e => setInputValues(pre => ({
                                        ...pre,
                                        is_active: e.target.value,
                                        url: '', tUrl: '', rUrl: ''
                                    }))}
                                >
                                    <option value='0'>Disable</option>
                                    <option value='1'>ERP</option>
                                    <option value='2'>Task Management</option>
                                    <option value='3'>Pukal Reports</option>
                                </select>
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Action Type</label>
                                <select
                                    className="cus-inpt"
                                    value={inputValues.actionType}
                                    onChange={e => setInputValues(pre => ({ ...pre, actionType: e.target.value }))}
                                >
                                    <option value='internal'>internal</option>
                                    <option value='external'>external</option>
                                </select>
                            </div>

                            {isEqualNumber(inputValues.is_active, 1) && (
                                <div className="col-lg-12 p-2">
                                    <label>URL (Link)</label>
                                    <input
                                        className="cus-inpt"
                                        value={inputValues.url}
                                        onChange={e => setInputValues(pre => ({ ...pre, url: e.target.value }))}
                                        disabled={!isEqualNumber(inputValues.is_active, 1)}
                                    />
                                </div>
                            )}

                            {isEqualNumber(inputValues.is_active, 2) && (
                                <div className="col-lg-12 p-2">
                                    <label>URL (Link)</label>
                                    <input
                                        className="cus-inpt"
                                        value={inputValues.tUrl}
                                        onChange={e => setInputValues(pre => ({ ...pre, tUrl: e.target.value }))}
                                    />
                                </div>
                            )}

                            {isEqualNumber(inputValues.is_active, 3) && (
                                <div className="col-lg-12 p-2">
                                    <label>URL (Link)</label>
                                    <input
                                        className="cus-inpt"
                                        value={inputValues.rUrl}
                                        onChange={e => setInputValues(pre => ({ ...pre, rUrl: e.target.value }))}
                                    />
                                </div>
                            )}

                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="button"
                            onClick={closeDialog}
                        >
                            cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="outlined"
                        >
                            save
                        </Button>
                    </DialogActions>
                </form>

            </Dialog>

        </>
    )
}


export default MenuManagement