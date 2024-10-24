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
    url: '',
    display_order: 1,
    is_active: 1,
    parantDetails: {},
}

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

    const DisplaySubRoutings = ({ dataSource }) => (
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
                                        setInputValues(pre => ({
                                            ...pre,
                                            menu_type: 0,
                                            parent_id: row.id,
                                            parantDetails: row,
                                            url: (row?.url ?? '') + '/'
                                        }));
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
                            <span className="px-3 py-1 rounded-3 text-white bg-danger">In-Active</span>
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
                                        setInputValues(pre => ({
                                            ...pre,
                                            id: row?.id,
                                            name: row?.name ?? '',
                                            menu_type: 0,
                                            parent_id: row?.parent_id ?? '',
                                            url: row?.url ?? '',
                                            display_order: row?.display_order ?? '',
                                            is_active: row?.is_active ?? '',
                                        }));
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
            expandableComp={({ row }) => (row?.SubRoutes?.length > 0) && <DisplaySubRoutings dataSource={row} />}
        />
    )

    const DisplayChildMenu = ({ row }) => {

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
                                                    setInputValues(pre => ({
                                                        ...pre,
                                                        menu_type: 0,
                                                        parent_id: row.id,
                                                        parantDetails: row,
                                                        url: (row?.ParantData?.url ? (row?.ParantData?.url + '/') : '') + (row?.url ?? '') + '/'
                                                    }));
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
                                        <span className="px-3 py-1 rounded-3 text-white bg-danger">In-Active</span>
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
                                                    setInputValues(pre => ({
                                                        ...pre,
                                                        id: row?.id,
                                                        name: row?.name ?? '',
                                                        menu_type: 3,
                                                        parent_id: row?.parent_id ?? '',
                                                        url: row?.url ?? '',
                                                        display_order: row?.display_order ?? '',
                                                        is_active: row?.is_active ?? '',
                                                    }));
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
                    />
                )}

                {row.SubRoutes.length > 0 && (
                    <>
                        <br />
                        <DisplaySubRoutings dataSource={row} />
                    </>
                )}
            </>
        )
    }

    const DisplaySubMenu = ({ row }) => {

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
                                                    setInputValues(pre => ({
                                                        ...pre,
                                                        menu_type: 3,
                                                        parent_id: row.id,
                                                        parantDetails: row,
                                                        url: (row?.ParantData?.url ? (row?.ParantData?.url + '/') : '') + (row?.url ?? '') + '/'
                                                    }));
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
                                                    setInputValues(pre => ({
                                                        ...pre,
                                                        menu_type: 0,
                                                        parent_id: row.id,
                                                        parantDetails: row,
                                                        url: (row?.ParantData?.url ? (row?.ParantData?.url + '/') : '') + (row?.url ?? '') + '/'
                                                    }));
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
                                        <span className="px-3 py-1 rounded-3 text-white bg-danger">In-Active</span>
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
                                                    setInputValues(pre => ({
                                                        ...pre,
                                                        id: row?.id,
                                                        name: row?.name ?? '',
                                                        menu_type: 2,
                                                        parent_id: row?.parent_id ?? '',
                                                        url: row?.url ?? '',
                                                        display_order: row?.display_order ?? '',
                                                        is_active: row?.is_active ?? '',
                                                    }));
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
                        expandableComp={({ row }) => (row?.ChildMenu?.length > 0 || row?.SubRoutes?.length > 0) && <DisplayChildMenu row={row} />}
                    />
                )}

                {row.SubRoutes.length > 0 && (
                    <>
                        <br />
                        <DisplaySubRoutings dataSource={row} />
                    </>
                )}
            </>
        )
    }

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

    return (
        <>

            <div className="d-flex justify-content-end pb-2">
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
            </div>

            <FilterableTable
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
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <Tooltip title='Add Sub-Menu'>
                                <span>
                                    <Button
                                        size="small"
                                        className="bg-light"
                                        onClick={() => {
                                            setInputValues(pre => ({
                                                ...pre,
                                                menu_type: 2,
                                                parent_id: row.id,
                                                parantDetails: row,
                                                url: (row?.url ?? '') + '/'
                                            }));
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
                                            setInputValues(pre => ({
                                                ...pre,
                                                menu_type: 0,
                                                parent_id: row.id,
                                                parantDetails: row,
                                                url: (row?.url ?? '') + '/'
                                            }));
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
                            isEqualNumber(row?.is_active, 1) ? (
                                <span className="px-3 py-1 rounded-3 text-white bg-success">Active</span>
                            ) : (
                                <span className="px-3 py-1 rounded-3 text-white bg-danger">In-Active</span>
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
                                            setInputValues(pre => ({
                                                ...pre,
                                                id: row?.id,
                                                name: row?.name ?? '',
                                                menu_type: 1,
                                                parent_id: row?.parent_id ?? '',
                                                url: row?.url ?? '',
                                                display_order: row?.display_order ?? '',
                                                is_active: row?.is_active ?? '',
                                            }));
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
                expandableComp={({ row }) => (row?.SubMenu?.length > 0 || row?.SubRoutes?.length > 0) && <DisplaySubMenu row={row} />}
            />


            <Dialog
                open={dialog}
                onClose={closeDialog}
                maxWidth='sm' fullWidth
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
                            <div className="col-lg-6 p-2">
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
                            <div className="col-lg-6 p-2">
                                <label>Order No</label>
                                <input
                                    className="cus-inpt"
                                    value={inputValues.display_order}
                                    onChange={e => setInputValues(pre => ({ ...pre, display_order: e.target.value }))}
                                />
                            </div>
                            <div className="col-lg-12 p-2">
                                <label>URL (Link)</label>
                                <input
                                    className="cus-inpt"
                                    value={inputValues.url}
                                    onChange={e => setInputValues(pre => ({ ...pre, url: e.target.value }))}
                                />
                            </div>
                            
                            {inputValues.id && (
                                <div className="col-lg-6 p-2">
                                    <label>Is Active</label>
                                    <select
                                        className="cus-inpt"
                                        value={inputValues.is_active}
                                        onChange={e => setInputValues(pre => ({ ...pre, is_active: e.target.value }))}
                                    >
                                        <option value='' disabled>select</option>
                                        <option value='1'>Active</option>
                                        <option value='0'>In-Active</option>
                                    </select>
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