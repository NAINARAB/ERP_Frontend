import { useState } from 'react';
import { IconButton, Popover, MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export function ButtonActions ({ buttonsData = [], ToolTipText = 'Options' }) {
    const [anchorEl, setAnchorEl] = useState(null);

    const popOverOpen = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={ToolTipText}>
                <IconButton aria-describedby={popOverOpen} onClick={handleClick} className='ms-2' size='small'>
                    <MoreVert />
                </IconButton>
            </Tooltip>

            <Popover
                open={popOverOpen}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuList>
                    {buttonsData.map((btn, btnKey) => (
                        <MenuItem
                            key={btnKey}
                            onClick={() => btn?.onclick && btn?.onclick()}
                            disabled={btn?.disabled}
                        >
                            <ListItemIcon>{btn?.icon}</ListItemIcon>
                            <ListItemText>{btn?.name}</ListItemText>
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>
        </>
    )
}