import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import AppDrawer from "../appDrawer/AppDrawer";
import Calculator from "./Calculator";

export default function CalculatorDrawer({
    open,
    onClose,
    enableBackdrop = false,
    closeOnBackdropClick = false,
    width = 350,
}) {
    return (
        <AppDrawer
            open={open}
            onClose={onClose}
            width={width}
            enableBackdrop={enableBackdrop}
            closeOnBackdropClick={closeOnBackdropClick}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e5e7eb",
                }}
            >
                <Box sx={{ fontWeight: 700 }}>Calculator</Box>
                <IconButton size="small" onClick={onClose} aria-label="Close calculator">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, overflow: "auto" }}>
                <Calculator />
            </Box>
        </AppDrawer>
    );
}
