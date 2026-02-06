import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import { useEffect } from "react";

function useDocumentOutsideClick(enabled, onClose, drawerPaperSelector = ".MuiDrawer-paper") {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const paper = document.querySelector(drawerPaperSelector);
      if (!paper) return;
      if (!paper.contains(e.target)) onClose?.();
    };

    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [enabled, onClose, drawerPaperSelector]);
}


export default function AppDrawer({
    open,
    onClose,
    children,
    width = 380,
    anchor = "right",

    enableBackdrop = false,
    closeOnBackdropClick = false,
    closeOnEsc = true,

    PaperProps,
    DrawerProps,
}) {

    // useDocumentOutsideClick(enableBackdrop === false && closeOnBackdropClick, onClose);
    const handleClose = (event, reason) => {
        if (reason === "backdropClick" && !closeOnBackdropClick) return;
        if (reason === "escapeKeyDown" && !closeOnEsc) return;
        onClose?.();
    };

    return (
        <Drawer
            anchor={anchor}
            open={open}
            onClose={handleClose}
            ModalProps={{
                keepMounted: true,

                // ✅ allow interacting with the page behind the drawer
                disableScrollLock: true,       // allows outside scroll
                disableAutoFocus: true,
                disableEnforceFocus: true,
                disableRestoreFocus: true,

                // ✅ no overlay shadow
                ...(enableBackdrop ? {} : { hideBackdrop: true }),

                // ✅ IMPORTANT: make the modal root ignore pointer events
                // so clicks can reach the page; drawer paper re-enables it.
                sx: { pointerEvents: "none" },
            }}
            PaperProps={{
                sx: {
                    width,
                    pointerEvents: "auto", // ✅ re-enable interactions inside drawer
                    borderLeft: anchor === "right" ? "1px solid #e5e7eb" : undefined,
                    borderRight: anchor === "left" ? "1px solid #e5e7eb" : undefined,
                    boxShadow: "none",
                },
                ...PaperProps,
            }}
            {...DrawerProps}
        >
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {children}
            </Box>
        </Drawer>
    );
}
