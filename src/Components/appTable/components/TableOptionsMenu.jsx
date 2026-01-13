import {
    IconButton, Menu, MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

const TableOptionsMenu = ({ options }) => {
    const [el, setEl] = useState(null);

    return (
        <>
            <IconButton onClick={e => setEl(e.currentTarget)}>
                <MoreVertIcon />
            </IconButton>
            <Menu open={!!el} anchorEl={el} onClose={() => setEl(null)}>
                {options.map((o, i) => (
                    <MenuItem
                        key={i}
                        disabled={o.disabled}
                        onClick={() => {
                            o.onClick();
                            setEl(null);
                        }}
                    >
                        {o.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default TableOptionsMenu;
