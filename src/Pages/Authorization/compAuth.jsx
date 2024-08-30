import React, { useEffect, useState } from "react";
import api from "../../API";
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Checkbox } from "@mui/material";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from 'react-toastify';
import Select from 'react-select';
import { isEqualNumber } from "../../Components/functions";


const postCheck = (user, comp, rights) => {
    fetch(`${api}company/companysAccess`, {
        method: 'POST',
        body: JSON.stringify({
            UserId: user,
            Company_Id: comp,
            View_Rights: rights ? 1 : 0
        }),
        headers: {
            "Content-type": "application/json",
        }
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                toast.error(data.message)
            }
        }).catch(e => console.log(e))
}

const TRow = ({ UserId, data, Sno }) => {
    const [viewRights, setViewRights] = useState(Number(data.View_Rights) === 1)

    useEffect(() => {
        setViewRights(Number(data.View_Rights) === 1);
    }, [data])

    return (
        <>
            <TableRow hover={true}>
                <TableCell>{Sno}</TableCell>
                <TableCell>{data.Company_Name}</TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={viewRights}
                        onChange={pre => {  
                            setViewRights(pre.target.checked); 
                            postCheck(UserId, data.Company_Id, viewRights) 
                        }} 
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
    console.log(currentAuthId)

    useEffect(() => {
        fetch(`${api}userName?AllUser=${true}`)
            .then(res => res.json())
            .then((data) => {
                if (data.success) {
                    setUsers(data.data);
                }
            })
            .catch((e) => { console.log(e) })
    }, [])

    useEffect(() => {
        fetch(`${api}company/companysAccess?Auth=${currentAuthId}`)
            .then(res => res.json())
            .then(data => {
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