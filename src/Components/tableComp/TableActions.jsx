// components/TableActions.jsx

import React from 'react';
import {
    IconButton,
    Tooltip,
    Popover,
    MenuList,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    MoreVert,
    Download,
    ToggleOff,
    ToggleOn,
    FilterList
} from '@mui/icons-material';
import { generatePDF, exportToExcel, isEqualNumber } from './tableUtils';

const TableActions = ({
    dataArray = [],
    columns = [],
    PDFPrintOption = false,
    ExcelPrintOption = false,
    MenuButtons = [],
    maxHeightOption = false,
    showFullHeight = true,
    setShowFullHeight = () => { },
    enableFilters = false,
    setFilterDialog = () => { }
}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const buttonsData = [
        ...(maxHeightOption
            ? [{
                name: 'Max Height',
                icon: showFullHeight
                    ? <ToggleOn fontSize="small" color="primary" />
                    : <ToggleOff fontSize="small" />,
                onclick: () => setShowFullHeight(prev => !prev),
                disabled: isEqualNumber(dataArray?.length, 0)
            }]
            : []),
        ...(PDFPrintOption
            ? [{
                name: 'PDF Print',
                icon: <Download fontSize="small" color="primary" />,
                onclick: () => generatePDF(dataArray, columns),
                disabled: isEqualNumber(dataArray?.length, 0)
            }]
            : []),
        ...(ExcelPrintOption
            ? [{
                name: 'Excel Print',
                icon: <Download fontSize="small" color="primary" />,
                onclick: () => exportToExcel(dataArray, columns),
                disabled: isEqualNumber(dataArray?.length, 0)
            }]
            : []),
        ...MenuButtons
    ];

    return (
        <>
            <Tooltip title="Table Options">
                <IconButton onClick={handleClick} size="small">
                    <MoreVert />
                </IconButton>
            </Tooltip>

            {enableFilters && (
                <Tooltip title="Open Filters">
                    <IconButton onClick={() => setFilterDialog(true)} size="small">
                        <FilterList />
                    </IconButton>
                </Tooltip>
            )}

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <MenuList>
                    {buttonsData.map((btn, i) => (
                        <MenuItem
                            key={i}
                            onClick={() => {
                                btn?.onclick && btn.onclick();
                                handleClose();
                            }}
                            disabled={btn?.disabled}
                        >
                            <ListItemIcon>{btn?.icon}</ListItemIcon>
                            <ListItemText>{btn?.name}</ListItemText>
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>
        </>
    );
};

export default TableActions;
