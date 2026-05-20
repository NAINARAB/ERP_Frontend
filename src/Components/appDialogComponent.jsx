import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton
} from "@mui/material";
import { Close } from "@mui/icons-material";

const AppDialog = ({
    open = false,
    onClose,
    children,
    title,
    onSubmit,
    submitText = "Submit",
    closeText = "Close",
    maxWidth = "sm",
    fullWidth = true,
    fullScreen = false,
    isSubmit = false,
    startAction,
    disableSubmit = false
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth={fullWidth}
            maxWidth={maxWidth}
            fullScreen={fullScreen}
        >
            {title && (
                <DialogTitle>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>{title}</span>
                        <IconButton onClick={onClose} color='error'><Close /></IconButton>
                    </div>
                </DialogTitle>
            )}

            <DialogContent>
                {children}
            </DialogContent>

            <DialogActions className={`${startAction ? "d-flex justify-content-between" : ""}`}>
                {startAction && (
                    <div>
                        {startAction}
                    </div>
                )}
                <div>
                    <Button onClick={onClose}>
                        {closeText}
                    </Button>

                    {onSubmit && (
                        <Button
                            variant="contained"
                            onClick={onSubmit}
                            type={isSubmit ? "submit" : "button"}
                            className="ms-2"
                            disabled={disableSubmit}
                        >
                            {submitText}
                        </Button>
                    )}
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default AppDialog;

AppDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    onSubmit: PropTypes.func,
    submitText: PropTypes.string,
    closeText: PropTypes.string,
    maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
    fullWidth: PropTypes.bool,
    isSubmit: PropTypes.bool,
    startAction: PropTypes.node
};
