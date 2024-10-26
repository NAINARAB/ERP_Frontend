import React, { useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const AddEditTaskType = ({ open, onClose, existingTaskType, onCreate, onUpdate }) => {
    const [inputValue, setInputValue] = React.useState({
        Task_Type: "",
        Task_Type_Id: "",
    });

    useEffect(() => {
        if (existingTaskType) {
            setInputValue(existingTaskType);
        } else {
            setInputValue({ Task_Type: "", Task_Type_Id: "" });
        }
    }, [existingTaskType]);

    const handleSubmit = (event) => {
        event.preventDefault(); 
        if (existingTaskType) {
            onUpdate(inputValue); 
        } else {
            onCreate(inputValue.Task_Type);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">
                {existingTaskType ? "Edit Task Type" : "Create Task Type"}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <div className="p-2">
                        <label>Task Type</label>
                        <input
                            type="text"
                            onChange={(event) => setInputValue({ ...inputValue, Task_Type: event.target.value })}
                            value={inputValue.Task_Type}
                            className="cus-inpt"
                        />
                    </div>
                    <DialogActions>
                        <button
                            className="btn btn-light rounded-5 px-3"
                            type="button"
                            onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary rounded-5 px-3"
                            type="submit">
                            {existingTaskType ? "Update" : "Create"}
                        </button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEditTaskType;
