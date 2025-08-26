import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
    Chip,
    Box,
    Grid,
    TextField,
    Autocomplete
} from "@mui/material";
import {
    FilterAlt,
    FilterAltOff
} from "@mui/icons-material";
import { useEffect, useState, useMemo, useCallback } from "react";

import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
// const useQuery = () => new URLSearchParams(useLocation().search);

const getFormattedDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

const defaultFilters = {
    passingDate: getFormattedDate(),
    selectedBrands: [],
    selectedProducts: []
};

const StockPaper = ({ loadingOn, loadingOff }) => {

    const storage = JSON.parse(localStorage.getItem("user"));

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ ...defaultFilters, filterDialog: false });
    const [allBrands, setAllBrands] = useState([]);
    const [allProducts, setAllProducts] = useState([]);


    useEffect(() => {
        if (reportData) {
            const brands = [...new Set(reportData.map(item => item.brandName).filter(Boolean))];
            setAllBrands(brands);

            const products = [];
            reportData.forEach(brand => {
                if (brand.godowns) {
                    brand.godowns.forEach(godown => {
                        if (godown.products) {
                            godown.products.forEach(product => {
                                if (product.baseProduct && !products.includes(product.baseProduct)) {
                                    products.push(product.baseProduct);
                                }
                            });
                        }
                    });
                }
            });
            setAllProducts(products);
        }
    }, [reportData]);


    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchLink({
                address: `reports/smtreports?PassingDate=${filters.passingDate}`,
                method: 'POST',
            });

            if (response.success) {
                setReportData(response.data);
            } else {
                console.error("Failed to fetch data:", response.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [filters.passingDate]);

    useEffect(() => {
        if (storage?.Company_id && filters.passingDate) {
            fetchReportData();
        }
    }, [storage?.Company_id, fetchReportData]);

    const filteredData = useMemo(() => {
        if (!reportData) return [];


        if (filters.selectedBrands.length === 0 && filters.selectedProducts.length === 0) {
            return reportData;
        }

        return reportData
            .filter(brand => {

                const brandMatch = filters.selectedBrands.length === 0 || filters.selectedBrands.includes(brand.brandName);
                if (!brandMatch) return false;


                if (filters.selectedProducts.length > 0) {
                    const hasProduct = brand.godowns?.some(godown =>
                        godown.products?.some(product =>
                            filters.selectedProducts.includes(product.baseProduct)
                        )
                    );
                    if (!hasProduct) return false;
                }

                return true;
            })
            .map(brand => {

                let filteredGodowns = brand.godowns;

                if (filters.selectedProducts.length > 0) {
                    filteredGodowns = brand.godowns
                        .map(godown => {
                            const filteredProducts = godown.products
                                .filter(product => filters.selectedProducts.includes(product.baseProduct));
                            return { ...godown, products: filteredProducts };
                        })

                        .filter(godown => godown.products.length > 0);
                }

                return { ...brand, godowns: filteredGodowns };
            });
    }, [reportData, filters.selectedBrands, filters.selectedProducts]);








    const ExpendableComponent2 = ({ row }) => {

        const godownPackMap = row.godowns.map(godown => ({
            godownName: godown.godownName,
            godownId: godown.godownId,
            packTypes: [...new Set(godown.products.flatMap(p => p.packs.map(pack => pack.packType)))],
        }));


        const totalCols = 1 + godownPackMap.reduce((sum, g) => sum + g.packTypes.length * 3, 0);

        return (
            <div className="p-3">
                <div className="table-responsive">
                    <table className="table table-bordered text-center" style={{ fontSize: "12px" }}>
                        <thead>
                            <tr>
                                <th colSpan={totalCols} className="text-center bg-light">
                                    STOCK PAPER - {new Date().toLocaleDateString("en-GB")}
                                </th>
                            </tr>

                            <tr>
                                <th className="bg-light">Products</th>
                                {godownPackMap.map((godown) => (
                                    <th
                                        key={godown.godownId}
                                        colSpan={godown.packTypes.length * 3}
                                        className="text-center bg-light"
                                    >
                                        {godown.godownName}
                                    </th>
                                ))}
                            </tr>

                            <tr>
                                <th className="bg-light"></th>
                                {godownPackMap.map((godown) =>
                                    godown.packTypes.map(packType => (
                                        <th
                                            key={`${godown.godownId}-${packType}`}
                                            colSpan={3}
                                            className="text-center bg-light"
                                        >
                                            {packType}
                                        </th>
                                    ))
                                )}
                            </tr>

                            <tr>
                                <th className="bg-light"></th>
                                {godownPackMap.map((godown) =>
                                    godown.packTypes.map(packType => (
                                        <>
                                            <th key={`wk-${godown.godownId}-${packType}`} className="text-center bg-light">Wk Avg</th>
                                            <th key={`yest-${godown.godownId}-${packType}`} className="text-center bg-light">Yest</th>
                                            <th key={`bal-${godown.godownId}-${packType}`} className="text-center bg-light">Bal</th>
                                        </>
                                    ))
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {row.godowns[0]?.products.map((product, pIndex) => (
                                <tr key={pIndex}>
                                    <td className="fw-medium">{product.baseProduct}</td>

                                    {godownPackMap.map((godown) =>
                                        godown.packTypes.map((packType) => {

                                            const godownObj = row.godowns.find(g => g.godownId === godown.godownId);
                                            const productObj = godownObj?.products.find(p => p.baseProduct === product.baseProduct);
                                            const pack = productObj?.packs.find(pk => pk.packType === packType);

                                            return (
                                                <>
                                                    <td key={`wkVal-${godown.godownId}-${pIndex}-${packType}`} className="text-center">
                                                        {pack?.weeklyAverage || 0}
                                                    </td>
                                                    <td key={`yestVal-${godown.godownId}-${pIndex}-${packType}`} className="text-center">
                                                        {pack?.yesterdayQty || 0}
                                                    </td>
                                                    <td key={`balVal-${godown.godownId}-${pIndex}-${packType}`} className="text-center">
                                                        {pack?.balanceQty || 0}
                                                    </td>
                                                </>
                                            );
                                        })
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };



    const exportToExcel = async () => {
        if (!filteredData || filteredData.length === 0) {
            alert("No data to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("SMT Report");


        worksheet.mergeCells("A1:D1");
        worksheet.getCell("A1").value = `SMT STOCK REPORT - ${new Date(
            filters.passingDate
        ).toLocaleDateString("en-GB")}`;
        worksheet.getCell("A1").font = { bold: true, size: 14 };
        worksheet.getCell("A1").alignment = { horizontal: "center" };


        const godownPackMap = filteredData[0].godowns.map((godown) => ({
            godownName: godown.godownName,
            godownId: godown.godownId,
            packTypes: [
                ...new Set(
                    godown.products.flatMap((p) => p.packs.map((pack) => pack.packType))
                ),
            ],
        }));


        const headerRow1 = ["Products"];
        const headerRow2 = [""];
        const headerRow3 = [""];

        godownPackMap.forEach((g) => {
            const span = g.packTypes.length * 3;

            for (let i = 0; i < span; i++) {
                headerRow1.push("");
            }

            g.packTypes.forEach((pt) => {
                headerRow2.push(pt, "", "");
                headerRow3.push("Wk Avg", "Yest", "Bal");
            });
        });

        worksheet.addRow(headerRow1);
        worksheet.addRow(headerRow2);
        worksheet.addRow(headerRow3);

        let colIndex = 2;
        godownPackMap.forEach((g) => {
            const span = g.packTypes.length * 3;

            worksheet.mergeCells(2, colIndex, 2, colIndex + span - 1);
            const godownCell = worksheet.getCell(2, colIndex);
            godownCell.value = g.godownName;

            godownCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };

            godownCell.alignment = { horizontal: "center", vertical: "middle" };

            godownCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "4472C4" },
            };


            for (let i = colIndex; i <= colIndex + span - 1; i++) {
                const cell = worksheet.getCell(2, i);
                cell.border = {
                    top: { style: "medium" },
                    left: { style: i === colIndex ? "medium" : "thin" },
                    right: { style: i === colIndex + span - 1 ? "medium" : "thin" },
                    bottom: { style: "medium" },
                };
            }

            colIndex += span;
        });


        colIndex = 2;
        godownPackMap.forEach((g) => {
            g.packTypes.forEach(() => {
                worksheet.mergeCells(3, colIndex, 3, colIndex + 2);
                colIndex += 3;
            });
        });

        worksheet.getRow(4).eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF00" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        filteredData.forEach((brand) => {
            const totalCols =
                1 + godownPackMap.reduce((sum, g) => sum + g.packTypes.length * 3, 0);

            const brandRow = worksheet.addRow([brand.brandName]);
            for (let i = 1; i <= totalCols; i++) {
                const cell = brandRow.getCell(i);
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "7030A0" },
                };
                cell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
                cell.alignment = {
                    horizontal: i === 1 ? "left" : "center",
                    vertical: "middle",
                };
            }

            brand.godowns[0]?.products.forEach((product) => {
                const row = [product.baseProduct];
                godownPackMap.forEach((godown) => {
                    const godownObj = brand.godowns.find(
                        (g) => g.godownId === godown.godownId
                    );
                    const productObj = godownObj?.products.find(
                        (p) => p.baseProduct === product.baseProduct
                    );
                    godown.packTypes.forEach((packType) => {
                        const pack = productObj?.packs.find((pk) => pk.packType === packType);
                        row.push(pack?.weeklyAverage || 0);
                        row.push(pack?.yesterdayQty || 0);
                        row.push(pack?.balanceQty || 0);
                    });
                });
                worksheet.addRow(row);
            });

            worksheet.addRow([]);
        });


        worksheet.columns.forEach((col) => {
            col.width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `STOCK_REPORT_${filters.passingDate}.xlsx`);
    };





    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Stock Paper
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
                    <Tooltip title="Filter">
                        <IconButton
                            color="primary"
                            onClick={() => setFilters({ ...filters, filterDialog: true })}
                        >
                            <FilterAlt />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Download Excel">
                        <Button variant="contained" color="success" onClick={exportToExcel}>
                            Download Excel
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            {(filters.selectedBrands.length > 0 || filters.selectedProducts.length > 0) && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Active Filters:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {filters.selectedBrands.map(brand => (
                            <Chip
                                key={brand}
                                label={`Brand: ${brand}`}
                                onDelete={() => setFilters({
                                    ...filters,
                                    selectedBrands: filters.selectedBrands.filter(b => b !== brand)
                                })}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                        {filters.selectedProducts.map(product => (
                            <Chip
                                key={product}
                                label={`Product: ${product}`}
                                onDelete={() => setFilters({
                                    ...filters,
                                    selectedProducts: filters.selectedProducts.filter(p => p !== product)
                                })}
                                color="secondary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            )}



            <FilterableTable
                title="Stock Details"
                dataArray={filteredData}
                EnableSerialNumber
                columns={[
                    createCol("brandName", "string", "Brand Name"),
                ]}
                ButtonArea={
                    <Tooltip title="Clear Filters">
                        <IconButton onClick={() => setFilters({
                            ...defaultFilters,
                            passingDate: filters.passingDate
                        })}>
                            <FilterAltOff />
                        </IconButton>
                    </Tooltip>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={ExpendableComponent2}
            />


            <Dialog
                open={filters.filterDialog}
                onClose={() => setFilters({ ...filters, filterDialog: false })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Filter Options</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={filters.passingDate}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        passingDate: e.target.value,
                                    })
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={allBrands}
                                value={filters.selectedBrands}
                                onChange={(e, newValue) =>
                                    setFilters({ ...filters, selectedBrands: newValue })
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="POS Brands" placeholder="Search brands..." />
                                )}
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={allProducts}
                                value={filters.selectedProducts}
                                onChange={(e, newValue) =>
                                    setFilters({ ...filters, selectedProducts: newValue })
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Products" placeholder="Search products..." />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>


                <DialogActions>
                    <Button onClick={() => setFilters({ ...filters, filterDialog: false })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setFilters({ ...filters, filterDialog: false });
                            fetchReportData();
                        }}
                        variant="contained"
                    >
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default StockPaper;


