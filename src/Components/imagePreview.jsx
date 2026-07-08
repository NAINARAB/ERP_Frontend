import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { Close, ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

const ImagePreviewDialog = (props) => {
    const [open, setOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
    const { url } = props;

    const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setZoom(1);
        setPos({ x: 0, y: 0 });
    };

    const zoomIn = () => setZoom((z) => clampZoom(+(z + ZOOM_STEP).toFixed(2)));

    const zoomOut = () =>
        setZoom((z) => {
            const next = clampZoom(+(z - ZOOM_STEP).toFixed(2));
            if (next === MIN_ZOOM) setPos({ x: 0, y: 0 });
            return next;
        });

    const resetZoom = () => {
        setZoom(1);
        setPos({ x: 0, y: 0 });
    };

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP / 2 : -ZOOM_STEP / 2;
        setZoom((z) => {
            const next = clampZoom(+(z + delta).toFixed(2));
            if (next === MIN_ZOOM) setPos({ x: 0, y: 0 });
            return next;
        });
    }, []);

    const handleDoubleClick = () => {
        setZoom((z) => {
            const next = z > 1 ? 1 : 2;
            if (next === 1) setPos({ x: 0, y: 0 });
            return next;
        });
    };

    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        dragState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            origX: pos.x,
            origY: pos.y,
        };
    };

    const handleMouseMove = (e) => {
        if (!dragState.current.dragging) return;
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
    };

    const stopDrag = () => {
        dragState.current.dragging = false;
    };

    return (
        <span>

            <Tooltip title="Tap to Open">
                <span onClick={handleOpen} style={{ cursor: 'pointer' }}>{props.children}</span>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>

                <DialogTitle className='bg-dark text-white d-flex justify-content-between align-items-center'>
                    <span>Image Preview</span>

                    <span className="d-flex align-items-center" style={{ gap: 4 }}>
                        <Tooltip title="Zoom In">
                            <span>
                                <IconButton
                                    onClick={zoomIn}
                                    disabled={zoom >= MAX_ZOOM}
                                    size="small"
                                >
                                    <ZoomIn sx={{ color: 'white' }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Zoom Out">
                            <span>
                                <IconButton
                                    onClick={zoomOut}
                                    disabled={zoom <= MIN_ZOOM}
                                    size="small"
                                >
                                    <ZoomOut sx={{ color: 'white' }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Reset Zoom">
                            <IconButton onClick={resetZoom} size="small">
                                <RestartAlt sx={{ color: 'white' }} />
                            </IconButton>
                        </Tooltip>

                        <span className="text-white fa-12" style={{ minWidth: 40, textAlign: 'center' }}>
                            {Math.round(zoom * 100)}%
                        </span>

                        <IconButton onClick={handleClose} size="small">
                            <Close sx={{ color: 'white' }} />
                        </IconButton>
                    </span>
                </DialogTitle>

                <DialogContent
                    className='bg-dark pb-4 d-flex align-items-center justify-content-center'
                    style={{
                        overflow: 'hidden',
                        height: '75vh',
                        minWidth: 0,
                        minHeight: 0,
                        cursor: zoom > 1 ? (dragState.current.dragging ? 'grabbing' : 'grab') : 'default',
                        userSelect: 'none',
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrag}
                    onMouseLeave={stopDrag}
                >
                    <img
                        src={url}
                        alt="Preview"
                        draggable={false}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            display: 'block',
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                            transition: dragState.current.dragging ? 'none' : 'transform 0.15s ease-out',
                            transformOrigin: 'center center',
                        }}
                    />
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