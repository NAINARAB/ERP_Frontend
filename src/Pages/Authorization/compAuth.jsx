import React, { useEffect, useState } from "react";
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Checkbox } from "@mui/material";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from 'react-toastify';
import Select from 'react-select';
import { fetchLink } from "../../Components/fetchComponent";
import { isEqualNumber } from "../../Components/functions";

const postCheck = async (user, comp, rights) => {
    try {
        const data = await fetchLink({
            address: `authorization/companysAccess`,
            method: "POST",
            bodyData: {
                UserId: user,
                Company_Id: comp,
                View_Rights: rights ? 1 : 0
            }
        });

        if (!data.success) {
            toast.error(data.message);
            return false;  
        }

        return true;  
    } catch (e) {
        console.log(e);
        return false;  
    }
}

const TRow = ({ UserId, data, Sno }) => {
    const [viewRights, setViewRights] = useState(Number(data.View_Rights) === 1)

    useEffect(() => {
        setViewRights(Number(data.View_Rights) === 1);
    }, [data])

    const handleCheckboxChange = async (event) => {
        const newRights = event.target.checked;

        const success = await postCheck(UserId, data.Company_Id, newRights);
        if (success) {
            setViewRights(newRights); 
        } else {
            event.target.checked = !newRights;  
        }
    };

    return (
        <>
            <TableRow hover={true}>
                <TableCell>{Sno}</TableCell>
                <TableCell>{data.Company_Name}</TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={viewRights}
                        onChange={handleCheckboxChange} 
                    />
                </TableCell>
            </TableRow>
        </>
    );
}

const CompanyAuth = () => {
    const [users, setUsers] = useState([]);
    const [compAuth, setCompAuth] = useState([]);
    const storage = JSON.parse(localStorage.getItem('user'))
    const [currentUserId, setCurrentUserId] = useState({
        UserId: storage?.UserId,
        Name: storage?.Name
    });
    const [currentAuthId, setCurrentAuthId] = useState(storage?.Autheticate_Id);

    useEffect(() => {
        fetchLink({
            address: `masters/user/dropDown?Company_id=${storage?.Company_id}&withAuth=true`
        }).then((data) => {
            if (data.success) {
                setUsers(data.data);
            }
        })
        .catch((e) => { console.log(e) })            
    }, [storage?.Company_id])

    useEffect(() => {
        fetchLink({
            address: `authorization/companysAccess?Auth=${currentAuthId}`
        }).then(data => {
            if (data.success) {
                setCompAuth(data.data)
            } else {
                setCompAuth([])
            }
        })
        .catch(e => console.log(e))            
    }, [currentAuthId])

    const headColumn = [
        {
            headname: 'SNo',
            variant: 'head',
            align: 'left',
            width: 100
        },
        {
            headname: 'Company Name',
            variant: 'head',
            align: 'left'
        },
        {
            headname: 'Rights',
            variant: 'head',
            align: 'left'
        },
    ]

    const handleUserChange = (selectedOption) => {
        if (selectedOption) {
            const selectedUser = users.find(user => isEqualNumber(user.UserId, selectedOption.value));
            setCurrentUserId({ UserId: Number(selectedUser.UserId), Name: selectedUser.Name });
            setCurrentAuthId(selectedUser?.Autheticate_Id)
        }
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-sm-4 pt-1">
                    <Select
                        value={{ value: currentUserId.UserId, label: currentUserId.Name }}
                        onChange={handleUserChange}
                        options={[...users.map(o => ({ value: o?.UserId, label: o?.Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select User"}
                    />
                </div>
            </div>

            <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {headColumn.map((obj, i) => (
                                <TableCell
                                    key={i}
                                    variant={obj.variant}
                                    align={obj.align}
                                    width={obj.width}
                                    sx={{ backgroundColor: 'rgb(15, 11, 42)', color: 'white' }}>
                                    {obj.headname}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {compAuth.map((obj, i) => (
                            <TRow
                                key={i}
                                data={obj}
                                UserId={currentUserId.UserId}
                                Sno={i + 1}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default CompanyAuth