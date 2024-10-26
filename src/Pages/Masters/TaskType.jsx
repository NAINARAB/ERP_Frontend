import React, { useState, useEffect, Fragment } from "react";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import AddEditTaskType from "../../Components/tasktype/addEditTaskType";

const TaskType = () => {
    const [taskTypeData, setTaskTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedTaskType, setSelectedTaskType] = useState(null);
    const [openNewDialog, setOpenNewDialog] = useState(false);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("Task_Type_Id");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchLink({ address: `masters/taskType` });
                if (data.success) {
                    setTaskTypeData(data.data);
                } else {
                    toast.error("Failed to fetch task types: " + data.message);
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching task types.");
            }
        };

        fetchData();
    }, [reload]);

    const handleDelete = async () => {
        try {
            const data = await fetchLink({
                address: `masters/taskType`,
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                bodyData: { Task_Type_Id: selectedTaskType.Task_Type_Id },
            });
            if (data.success) {
                setReload(!reload);
                setOpenDeleteDialog(false);
                toast.success("Task type deleted successfully!");
            } else {
                toast.error("Failed to delete task type: " + data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting task type.");
        }
    };

    const handleDeleteClick = (taskType) => {
        setSelectedTaskType(taskType);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleOpenEditDialog = (taskType) => {
        setSelectedTaskType(taskType);
        setOpenNewDialog(true);
    };

    const handleOpenCreateDialog = () => {
        setSelectedTaskType(null);
        setOpenNewDialog(true);
    };

    const handleCreate = async (taskType) => {
        try {
            const data = await fetchLink({
                address: `masters/taskType`,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                bodyData: { Task_Type: taskType },
            });
            if (data.success) {
                setReload(!reload);
                toast.success("Task type created successfully!");
                setOpenNewDialog(false);
            } else {
                toast.error("Failed to create task type: " + data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating task type.");
        }
    };

    const handleUpdate = async (updatedTaskType) => {
        try {
            const data = await fetchLink({
                address: `masters/taskType`,
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                bodyData: { ...updatedTaskType },
            });
            if (data.success) {
                setReload(!reload);
                toast.success("Task type updated successfully!");
                setOpenNewDialog(false);
            } else {
                toast.error("Failed to update task type: " + data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating task type.");
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const taskTypeColumns = [
        { id: "index", label: "Id No", sort: false },
        { id: "Task_Type", label: "Task Type", sort: true },
        { id: "actions", label: "Actions", sort: false },
    ];

    const sortedData = [...taskTypeData].sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        return order === "asc" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Task Types
                    <Button
                        className="rounded-5 px-3 py-1 fa-13 shadow"
                        onClick={handleOpenCreateDialog}
                    >
                        Create Task Type
                    </Button>
                </div>

                <div className="card-body overflow-scroll" style={{ maxHeight: "78vh" }}>
                <TableContainer>
    <Table>
        <TableHead>
            <TableRow>
                {taskTypeColumns.map((column) => (
                    <TableCell key={column.id} sx={{ padding: '4px 8px' }}> 
                        {column.sort ? (
                            <TableSortLabel
                                active={orderBy === column.id}
                                direction={orderBy === column.id ? order : "asc"}
                                onClick={() => handleRequestSort(column.id)}
                            >
                                {column.label}
                            </TableSortLabel>
                        ) : (
                            column.label
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>

        <TableBody>
            {sortedData.map((obj, index) => (
                <TableRow key={obj.Task_Type_Id}>
                    <TableCell sx={{ padding: '4px 8px' }}>{index + 1}</TableCell> 
                    <TableCell sx={{ padding: '4px 8px' }}>{obj.Task_Type}</TableCell>
                    <TableCell sx={{ padding: '4px 8px' }}>
                        <IconButton onClick={() => handleOpenEditDialog(obj)} size="small">
                            <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(obj)} sx={{ color: '#FF6865' }}>
                            <Delete />
                        </IconButton>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>

                </div>
            </div>

            <AddEditTaskType
                open={openNewDialog}
                onClose={() => setOpenNewDialog(false)}
                existingTaskType={selectedTaskType}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle className="bg-primary text-white mb-4 px-3 py-2">{"Confirmation"}</DialogTitle>
                <DialogContent className="p-4">
                    Do you want to delete the Task Type
                    <span className="text-primary">{" " + selectedTaskType?.Task_Type + " "}</span>?
                </DialogContent>
                <DialogActions>
                    <Button className="btn btn-light rounded-5 px-3 me-1" onClick={handleCloseDeleteDialog}>
                        Cancel
                    </Button>
                    <Button className="btn btn-primary rounded-5 px-3" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
};

export default TaskType;
