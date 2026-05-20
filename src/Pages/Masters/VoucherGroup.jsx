import { useState, useEffect } from 'react';
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import {
    Box, Chip, Typography, Skeleton, TextField, InputAdornment
} from '@mui/material';
import { fetchLink } from '../../Components/fetchComponent';
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Search } from "@mui/icons-material";


const DetailsTable = ({ details = [] }) => {
    const columns = [
        createCol('Voucher_Type', 'string', 'Voucher Type', 'left'),   
         createCol('Group_Type', 'string', 'Group_Type', 'left'),   
      
    ];

    if (!details.length) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', bgcolor: '#f5f5f5' }}>
                No vouchers mapped to this group
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <FilterableTable
                dataArray={details}
                columns={columns}
                disablePagination
                EnableSerialNumber
                bodyFontSizePx={12}
                headerFontSizePx={12}
                CellSize="small"
                title="Vouchers"
            />
        </Box>
    );
};

const VoucherGroup = ({ EditRights }) => {
    const [voucherGroups, setVoucherGroups]   = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [loading, setLoading]               = useState(true);
    const [searchTerm, setSearchTerm]         = useState('');

    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchLink({ address: `masters/voucherGroups` });
                if (data?.success) {
                    setVoucherGroups(data.voucherGroups || []);
                    setFilteredGroups(data.voucherGroups || []);
                }
            } catch (err) {
                console.error('Error fetching voucher groups:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        const lower = term.toLowerCase();
        if (!lower.trim()) {
            setFilteredGroups(voucherGroups);
        } else {
            setFilteredGroups(
                voucherGroups.filter(item =>
                    item.Group_Name?.toLowerCase().includes(lower) ||
                    String(item.Voucher_Group_Id || '').includes(lower)
                )
            );
        }
    };

  
    const columns = [
      
        {
            ColumnHeader: 'Group Name',
            Field_Name:   'Group_Name',
            isVisible:    1,
            align:        'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    {row.Group_Name || '—'}
                </Typography>
            ),
        }, 
          {
            ColumnHeader: 'Group Type',
            Field_Name:   'Group_Type',
            isVisible:    1,
            align:        'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    {row.Group_Type || '—'}
                </Typography>
            ),
        }, 
        {
            ColumnHeader: 'Action',
            Field_Name:   'action',
            isVisible:    1,
            align:        'center',
            isCustomCell: true,
            Cell: ({ row }) => (
                <ButtonActions
                    buttonsData={[
                        {
                            name: 'Edit',
                            onclick: () => navigate('Create', {
                                state: { ...row, isEdit: true },
                            }),
                            icon: <Edit fontSize="small" color="primary" />,
                        },
                    ]}
                />
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    Voucher Group
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search voucher group..."
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 260 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            style: { height: 40 }
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/erp/master/VoucherGroup/Create')}
                        sx={{ whiteSpace: 'nowrap', height: 40 }}
                    >
                        Add Voucher Group
                    </Button>
                </Box>
            </Box>

   
            <FilterableTable
                dataArray={filteredGroups}
                columns={columns}
                isExpendable={true}
                expandableComp={({ row }) => <DetailsTable details={row?.details || []} />}
                EnableSerialNumber={true}
                CellSize="medium"
                bodyFontSizePx={13}
                headerFontSizePx={13}
                initialPageCount={20}
                title="Voucher Group"
                ExcelPrintOption={true}
                PDFPrintOption={true}
                maxHeightOption={true}
                tableMaxHeight={600}
            />
        </Box>
    );
};

export default VoucherGroup;