import { useState, useEffect } from 'react';
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import {
    Box, Chip, Typography, Skeleton, TextField, InputAdornment
} from '@mui/material';
import { getSessionUser, toNumber } from "../../Components/functions";
import { fetchLink } from '../../Components/fetchComponent';
import { Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Add, Edit, Search } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";



const DetailsTable = ({ details = [] }) => {
    const columns = [
        createCol('Product_Name', 'string', 'Product Name', 'left'),
        createCol('Pro_Group', 'string', 'Product Group', 'left'),
    ];

    if (!details.length) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', bgcolor: '#f5f5f5' }}>
                No products mapped to this group
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
                title="Mapped Products"
            />
        </Box>
    );
};

const NonMappedDialog = ({ open, onClose, nonMappedProducts = [] }) => {
    const [search, setSearch] = useState('');

    const filtered = nonMappedProducts.filter(p =>
        (p.Product_Name && p.Product_Name.toLowerCase().includes(search.toLowerCase())) ||
        (p.Pro_Group && p.Pro_Group.toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
      
        createCol('Product_Name', 'string', 'Product Name',  'left'),
        createCol('Pro_Group',    'string', 'Product Group', 'left'),
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                    Non-Grouped Products
                  
                </span>
                <TextField
                    size="small"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                        style: { height: 36 }
                    }}
                    sx={{ width: 220 }}
                />
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {filtered.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        {nonMappedProducts.length === 0
                            ? '✅ All products are mapped to a group!'
                            : 'No results found for your search.'}
                    </Box>
                ) : (
                    <FilterableTable
                        dataArray={filtered}
                        columns={columns}
                        EnableSerialNumber
                        bodyFontSizePx={13}
                        headerFontSizePx={13}
                        CellSize="small"
                        initialPageCount={15}
                        title="Non-Grouped Products"
                    />
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ItemGroupMaster = ({ EditRights }) => {
    const [itemGroups, setItemGroups]               = useState([]);
    const [nonMappedProducts, setNonMappedProducts] = useState([]);
    const [filteredGroups, setFilteredGroups]       = useState([]);
    const [loading, setLoading]                     = useState(true);
    const [searchTerm, setSearchTerm]               = useState('');
    const [nonMappedOpen, setNonMappedOpen]         = useState(false);

    const navigate = useNavigate();

    // ── Fetch ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchLink({ address: `masters/itemGroup` });
                if (data?.success) {
                    setItemGroups(data.itemGroups || []);
                    setFilteredGroups(data.itemGroups || []);
                    setNonMappedProducts(data.nonMappedProducts || []); // ← from single API
                }
            } catch (err) {
                console.error('Error fetching item groups:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

   
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredGroups(itemGroups);
        } else {
            setFilteredGroups(
                itemGroups.filter(item =>
                    item.Group_Name?.toLowerCase().includes(term) ||
                    item.Group_HSN?.toLowerCase().includes(term) ||
                    item.GST_P?.toString().includes(term)
                )
            );
        }
    };

   
    const columns = [
        {
            ColumnHeader: 'Group Name',
            Field_Name: 'Group_Name',
            isVisible: 1,
            align: 'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    {row.Group_Name}
                </Typography>
            ),
        },
        {
            ColumnHeader: 'Group HSN',
            Field_Name: 'Group_HSN',
            isVisible: 1,
            align: 'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">{row.Group_HSN || '—'}</Typography>
            ),
        },
        {
            ColumnHeader: 'GST %',
            Field_Name: 'GST_P',
            isVisible: 1,
            align: 'center',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Chip
                    label={`${row.GST_P ?? 0}%`}
                    size="small"
                    color="info"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
            ),
        },
    
        {
            ColumnHeader: 'Action',
            Field_Name: 'action',
            isVisible: 1,
            align: 'center',
            isCustomCell: true,
            Cell: ({ row }) => (
                <ButtonActions
                    buttonsData={[
                        {
                            name: 'Edit',
                            onclick: () => navigate('Create', {
                                state: {
                                    ...row,
                                    Products_List: row?.details || [],
                                    isEdit: true,
                                },
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

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    Item Group
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>

       
                    <TextField
                        variant="outlined"
                        placeholder="Search item group..."
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
                        variant="outlined"
                        color="warning"
                        onClick={() => setNonMappedOpen(true)}
                     
                        sx={{ whiteSpace: 'nowrap', height: 40 }}
                    >
                        Non-Group Items
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/erp/master/itemGroupMaster/Create')}
                        sx={{ whiteSpace: 'nowrap', height: 40 }}
                    >
                        Add Item Group
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
                title="Item Group"
                ExcelPrintOption={true}
                PDFPrintOption={true}
                maxHeightOption={true}
                tableMaxHeight={600}
            />


            <NonMappedDialog
                open={nonMappedOpen}
                onClose={() => setNonMappedOpen(false)}
                nonMappedProducts={nonMappedProducts}
            />
        </Box>
    );
};

export default ItemGroupMaster;