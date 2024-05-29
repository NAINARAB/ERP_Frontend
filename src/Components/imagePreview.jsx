import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';

const ImagePreviewDialog = (props) => {
    const [open, setOpen] = useState(false);
    const { url } = props;

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <span>

            <Tooltip title="Tap to Open">
                <span onClick={handleOpen} style={{ cursor: 'pointer' }}>{props.children}</span>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>

                <DialogTitle className='bg-dark text-white d-flex justify-content-between'>
                    <span>Image Preview</span>
                    <IconButton onClick={handleClose}><Close sx={{ color: 'white' }} /></IconButton>
                </DialogTitle>

                <DialogContent className='bg-dark pb-4 d-flex align-items-center justify-content-center'>
                    <img src={url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                </DialogContent>

                {/* <DialogActions className='bg-dark'>
                    <Button startIcon={<Close />} variant='outlined' color="primary" onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions> */}

            </Dialog>
        </span>
    );
};

export default ImagePreviewDialog;