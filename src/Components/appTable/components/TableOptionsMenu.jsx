import {
    IconButton, Menu, MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: 'rgb(55, 65, 81)',
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
                ...theme.applyStyles('dark', {
                    color: 'inherit',
                }),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
        ...theme.applyStyles('dark', {
            color: theme.palette.grey[300],
        }),
    },
}));

const TableOptionsMenu = ({ options }) => {
    const [el, setEl] = useState(null);

    return (
        <>
            <IconButton onClick={e => setEl(e.currentTarget)}>
                <MoreVertIcon />
            </IconButton>
            {/* <Menu open={!!el} anchorEl={el} onClose={() => setEl(null)}> */}
            <StyledMenu
                id="demo-customized-menu"
                slotProps={{
                    list: {
                        'aria-labelledby': 'demo-customized-button',
                    },
                }}
                open={!!el} anchorEl={el} onClose={() => setEl(null)}
            >
                {options.map((o, i) => (
                    <MenuItem
                        key={i}
                        disabled={o.disabled}
                        onClick={() => {
                            o.onClick();
                            setEl(null);
                        }}
                        
                    >
                        
                        {o?.icon && o.icon}
                        {o.label}
                    </MenuItem>
                ))}
            </StyledMenu>
            {/* </Menu> */}
        </>
    );
};

export default TableOptionsMenu;
