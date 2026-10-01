import { useEffect, useRef, useState } from "react";
import { toArray, checkIsNumber, numberToWords, NumberFormat } from "../../../../Components/functions";
import { fetchLink } from "../../../../Components/fetchComponent";
import { useReactToPrint } from "react-to-print";
import { Button } from "@mui/material";
import { Print } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import a5BackgroundImage from './plain.jpeg';

const SAFE_LEFT_PADDING = "0.23cm";

const InvoiceTemplate = ({ Do_Id, Do_Ids = [], data: propData, loadingOn, loadingOff, isCombinedPrint = false }) => {
	const [data, setData] = useState([]);
	const printRef = useRef(null);
	const nav = useNavigate();
	const location = useLocation();
	const [companyInfo, setCompanyInfo] = useState({});
	const storage = JSON.parse(localStorage.getItem('user'));


	const isMultiple = Array.isArray(Do_Ids) && Do_Ids.length > 0;
	const idsToFetch = isMultiple ? Do_Ids : (Do_Id ? [Do_Id] : []);
	const [printReady, setPrintReady] = useState(false);

	useEffect(() => {
		if (propData) {
			setData(Array.isArray(propData) ? propData : [propData]);
			setPrintReady(true);
		}
		if (idsToFetch.length === 0) return;

		loadingOn?.();
		fetchLink({
			address: `masters/company?Company_id=${storage?.Company_id}`
		}).then(data => {
			if (data.success) {
				setCompanyInfo(data?.data[0] ? data?.data[0] : {});
			}
		}).catch(e => console.error(e));


		const fetchAllInvoices = async () => {
			try {
				const promises = idsToFetch.map(id =>
					fetchLink({
						address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${id}`,
						loadingOn: () => { },
						loadingOff: () => { },
					})
				);

				const results = await Promise.all(promises);
				const allData = results
					.filter(result => result?.success && result?.data?.[0])
					.map((result, idx) => {
						const fallbackItem = Array.isArray(propData) ? propData[idx] : propData;
						return {
							...(fallbackItem || {}),
							...result.data[0],
							Sale_Order_Created: result.data[0]?.Sale_Order_Created || fallbackItem?.Sale_Order_Created || "",
							Created_BY_Name: result.data[0]?.Created_BY_Name || fallbackItem?.Created_BY_Name || ""
						};
					});
				setData(allData.length > 0 ? allData : (propData ? (Array.isArray(propData) ? propData : [propData]) : []));
				setPrintReady(true);
			} catch (error) {
				console.error('Error fetching invoices:', error);
				if (propData) {
					setData(Array.isArray(propData) ? propData : [propData]);
				}
			} finally {
				loadingOff?.();
			}
		};

		fetchAllInvoices();
	}, [JSON.stringify(idsToFetch), propData]);

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
		onAfterPrint: () => console.log("Print completed")
	});


	if (!isCombinedPrint && data.length > 0) {
		return (
			<div style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center"
			}}>

				<style>
					{`
@media print {
  @page {
    size: A5 landscape;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-page {
    width: 21cm;
    height: 14.8cm;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .print-safe-area {
    margin-left: 0.3cm;  
  }

  .no-print {
    display: none !important;
  }
}
`}
				</style>


				<Button onClick={handlePrint} startIcon={<Print />} className="no-print" style={{ margin: "20px" }}>
					Print Preview {data.length > 1 ? `(${data.length} invoices)` : ''}
				</Button>

				<div ref={printRef}>
					{data.map((invoice, index) => (
						<div key={index} style={{ marginBottom: data.length > 1 ? '50px' : '0' }}>
							<SingleInvoice
								data={invoice}
								companyInfo={companyInfo}
								isPreview={true}
							/>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Combined print mode (for dialog)
	return (
		<div ref={printRef}>
			{data.map((invoice, index) => (
				<div
					key={index}
					className="invoice-page"
					style={{
						pageBreakAfter: index < data.length - 1 ? 'always' : 'auto'
					}}
				>
					<SingleInvoice
						data={invoice}
						companyInfo={companyInfo}
						isPreview={false}
					/>
				</div>
			))}
		</div>
	);
};

// Single Invoice Component (your exact design)
const SingleInvoice = ({ data, companyInfo, isPreview }) => {
	const rawProducts = toArray(data?.productDetails || data?.Products_List || data?.productsList || data?.productsDetails);
	const products = rawProducts.map(p => ({
		...p,
		itemName: p.itemName || p.Item_Name || p.Product_Name || p.productName || "",
		hsnCode: p.hsnCode || p.HSN_Code || p.hsn_code || "",
		gstPercentage: p.gstPercentage ?? p.Tax_Rate ?? p.taxRate ?? p.Taxble ?? p.taxble ?? 0,
		quantity: p.quantity ?? p.Total_Qty ?? p.total_qty ?? p.Act_Qty ?? p.act_qty ?? p.Bill_Qty ?? p.bill_qty ?? 0,
		itemRate: p.itemRate ?? p.Item_Rate ?? p.item_rate ?? p.Taxable_Rate ?? p.taxable_rate ?? 0,
		billQuantity: p.billQuantity ?? p.Bill_Qty ?? p.bill_qty ?? p.Alt_Bill_Qty ?? p.alt_bill_qty ?? p.quantity ?? 0,
		amount: p.amount ?? p.Final_Amo ?? p.final_amo ?? p.Amount ?? p.Taxable_Amount ?? p.taxable_amount ?? 0
	}));

	const rawExpenses = toArray(data?.expencessDetails || data?.Expenses_List || data?.Expence_Array || data?.expensesDetails || data?.expencessArray || data?.expenses || []);
	const expenses = rawExpenses
		.filter(e => !(e.expenseName || e.Expense_Name || e.Expence_Name || e.expense_name || "")?.toLowerCase().includes("round off"))
		.map(e => ({
			...e,
			expenseName: e.expenseName || e.Expense_Name || e.Expence_Name || e.expense_name || "",
			expenseValue: e.expenseValue ?? e.Expense_Value ?? e.Expence_Value ?? e.expense_value ?? e.Amount ?? e.amount ?? 0
		}));

	const staffList = toArray(data?.staffDetails || data?.Staffs_Array || data?.staffs || []);
	const broker = staffList.find(e => (e.empType || e.Involved_Emp_Type)?.toLowerCase() === "broker");
	const transport = staffList.find(e => (e.empType || e.Involved_Emp_Type)?.toLowerCase() === "transport");
	const attendant = staffList.find(e => (e.empType || e.Involved_Emp_Type)?.toLowerCase() === "attendant");
	const brokerName = broker?.empName || broker?.Emp_Name || broker?.name || "-";
	const transportName = transport?.empName || transport?.Emp_Name || transport?.name || "-";
	const attendantName = attendant?.empName || attendant?.Emp_Name || attendant?.name || "";

	const formatStaffName = (name) => {
		if (!name) return "-";
		const trimmed = String(name).trim();
		if (!trimmed || trimmed.toLowerCase() === "unknown" || trimmed === "-" || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") return "-";
		return trimmed;
	};

	const rawOrderBy =
		data?.Sale_Order_Created ||
		data?.SaleOrderCreated ||
		data?.saleOrderCreated ||
		data?.Sales_Order_Created ||
		data?.sales_order_created ||
		data?.Sale_Order_Created_By ||
		attendantName ||
		staffList.find(e => (e.empType || e.Involved_Emp_Type)?.toLowerCase()?.includes("sale") || (e.empType || e.Involved_Emp_Type)?.toLowerCase()?.includes("order"))?.empName ||
		staffList.find(e => (e.empType || e.Involved_Emp_Type)?.toLowerCase()?.includes("sale") || (e.empType || e.Involved_Emp_Type)?.toLowerCase()?.includes("order"))?.Emp_Name ||
		(formatStaffName(data?.Sales_Person_Name) !== "-" ? data?.Sales_Person_Name : "") ||
		(formatStaffName(data?.salesPersonName) !== "-" ? data?.salesPersonName : "");

	const orderBy = formatStaffName(rawOrderBy);

	const rawInvoiceBy =
		data?.Created_BY_Name ||
		data?.Created_by_name ||
		data?.Created_By_Name ||
		data?.CreatedByGet ||
		data?.createdByGet ||
		data?.CreatedByName ||
		data?.createdByName ||
		(isNaN(Number(data?.Created_by)) ? data?.Created_by : "") ||
		(isNaN(Number(data?.createdBy)) ? data?.createdBy : "");

	const invoiceBy = formatStaffName(rawInvoiceBy);

	const roundOffValue = data?.roundOffValue ?? data?.Round_off ?? data?.round_off ?? 0;
	const totalAmount = products.reduce((a, b) => a + Number(b.amount || 0), 0);
	const totalExpenses = expenses.reduce((a, b) => a + Number(b.expenseValue || 0), 0);
	const netAmount = data?.Total_Invoice_value ?? data?.totalInvoiceValue ?? (totalAmount + totalExpenses + Number(roundOffValue || 0));

	const groupHSNSummary = (list) => {
		const map = new Map();
		list.forEach(p => {
			const hsn = p?.hsnCode || "";
			const amt = Number(p?.amount) || 0;
			map.set(hsn, (map.get(hsn) || 0) + amt);
		});
		return Array.from(map.entries()).map(([hsn, amount]) => ({ hsn, amount }));
	};
	const hsnSummary = groupHSNSummary(products);

	const mailingName = data?.mailingName || data?.Retailer_Name || data?.retailerName || data?.Party_Name || "";
	const partyLocation = data?.Party_Location || data?.Retailer_Location || data?.Location || data?.City || "";
	const mailingAddress = data?.mailingAddress || data?.Retailer_Address || data?.Address || data?.deliveryAddress || "";
	const mailingNumber = data?.mailingNumber || data?.Retailer_Mobile || data?.Mobile_No || data?.Contact_No || "";
	const retailerGstNumber = data?.retailerGstNumber || data?.Retailer_GST || data?.GSTIN || data?.Gst_No || data?.retailerGstin || "";
	const createdDate = data?.createdOn || data?.Do_Date || data?.Created_on || data?.do_date;
	const voucherType = data?.voucherTypeGet || data?.VoucherTypeGet || data?.Voucher_Type || "";
	const voucherNumber = data?.voucherNumber || data?.Do_Inv_No || data?.Do_No || "";

	return (
		<div
			style={{
				width: "21cm",
				height: "14.8cm",
				position: "relative",
				margin: isPreview ? "0" : "0",
				boxSizing: "border-box",
				paddingLeft: SAFE_LEFT_PADDING   // ✅ FIXED HERE
			}}
		>
			{/* Background Image */}
			<img
				src={a5BackgroundImage}
				alt="A5 Invoice Layout"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					zIndex: 0
				}}
			/>

			{/* Content Overlay */}
			<div style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 1,
				boxSizing: "border-box"
			}}>
				<div style={{
					position: "absolute",
					top: "0.4cm",
					width: "100%",
					display: "flex"
				}}>
					{/* ================= LEFT SIDE ================= */}
					<div style={{ position: "relative", width: "60%" }}>
						<div style={{ position: "absolute", left: "0cm", width: "9cm", padding: "0px" }}>
							<div style={{
								position: "absolute",
								left: "5.3cm",
								fontWeight: "bold",
								top: "0.2cm",
								fontSize: "25px",
								width: "7cm",
								padding: "3px",
								color: "#000"
							}}>
								{companyInfo?.Company_Name}
							</div>
						</div>

						<div style={{
							position: "absolute",
							left: "4.2cm",
							fontSize: "15px",
							width: "10cm",
							marginTop: "1cm",
							color: "#000"
						}}>
							<p>H.O: 153, Chitrakara Street, Madurai -01</p>

							<div style={{
								position: "absolute",
								fontSize: "14px",
								width: "10cm",
								bottom: "0cm",
								left: "10px",
								top: "0.0cm",
								padding: "0px",
								color: "#000"
							}}>
								<br />
								<p>G.O:746 Puliyur, Sayanapuram, Svga</p>
							</div>

							<div style={{
								position: "absolute",
								fontSize: "14px",
								width: "10cm",
								bottom: "0cm",
								top: "15px",
								right: "20px",
								padding: "0px",
								color: "#000"
							}}>
								<br />
								<p>Bill of Supply- Disclaimer Affidavit Filed -Exempted</p>
							</div>
						</div>
					</div>

					{/* ================= RIGHT SIDE (STATIC DATA) ================= */}
					<div style={{
						position: "relative",
						width: "40%",
						fontSize: "13px",
						color: "#000",
						paddingRight: "1cm",
						textAlign: "right",
						top: "15px"
					}}>
						<div><strong>GSTIN :</strong> 33AADFS4987M1ZL</div>
						<div><strong>Phone :</strong> 0452 - 4371625</div>
						<div><strong></strong> 9786131353</div>
						<div><strong>FSSAI No</strong> 12418012000176</div>
					</div>
				</div>

				<div style={{
					position: "absolute",
					top: "2.7cm",
					width: "100%"
				}}>
					<p style={{
						position: "absolute",
						left: "1.0cm",
						fontSize: "13px",
						top: "0.0cm",
						width: "9cm",
						padding: "2.5px"
					}}>
						{/* To */}
					</p>

					<div style={{
						position: "absolute",
						left: "3.25cm",
						fontSize: "13px",
						top: "0.3cm",
						width: "9cm",
						padding: "2.5px"
					}}>
						<div style={{ color: "#000" }}>{mailingName}{partyLocation ? `, ${partyLocation}` : ""}</div>
						<div style={{ color: "#000" }}>{mailingAddress}</div>
						<div style={{ color: "#000" }}>{mailingNumber}</div>
						<div style={{ color: "#000" }}>{retailerGstNumber ? `GSTIN: ${retailerGstNumber}` : ""}</div>
					</div>

					<div style={{
						position: "absolute",
						left: "12cm",
						width: "8cm",
						fontSize: "12px",
						padding: "0px",
						top: "0.3cm"
					}}>
						<div style={{
							height: "0.7cm",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center"
						}}>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<span style={{ fontWeight: "bold", color: "#000" }}>
									{/* Date: */}
								</span>
								<span style={{ color: "#000", marginLeft: "30px" }}>
									{createdDate && new Date(createdDate).toLocaleDateString("en-GB")}
								</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<span style={{ fontWeight: "bold", color: "#000", marginLeft: "50px" }}>
									{/* Bill Type: */}
								</span>
								<b style={{ color: "#000", marginLeft: "50px" }}>
									{voucherType}
								</b>
							</div>
						</div>

						<div style={{
							height: "0.7cm",
							display: "flex",
							alignItems: "center",
							gap: "5px"
						}}>
							<span style={{ fontWeight: "bold", color: "#000" }}>
								{/* Bill No: */}
							</span>
							<b style={{ color: "#000", marginLeft: "50px" }}>{voucherNumber}</b>
						</div>

						<div style={{
							height: "1cm",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center"
						}}>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<span style={{ fontWeight: "bold", color: "#000" }}>
									{/* Broker: */}
								</span>
								<span style={{ color: "#000", marginLeft: "50px" }}>{brokerName}</span>
							</div>
							<div style={{ display: "flex" }}>
								<span style={{ fontWeight: "bold", color: "#000" }}>
									{/* Transport: */}
								</span>
								<span style={{ color: "#000", alignItems: "center", gap: "5px" }}>{transportName}</span>
							</div>
						</div>
					</div>
				</div>


				<div style={{
					position: "absolute",
					top: "5.1cm",
					left: "0",
					width: "20cm",
					fontSize: "12px"
				}}>

					<div style={{
						display: "flex",
						height: "0.5cm",
						lineHeight: "0.5cm",
						alignItems: "left",
						fontWeight: "bold",
						marginBottom: "0.3cm"
					}}>
						<div style={{ width: "1cm", textAlign: "right", marginLeft: "0.4cm" }}>

						</div>
						<div style={{ marginLeft: "0.2cm", width: "8.2cm", color: "#000" }}>

						</div>
						<div style={{ width: "2cm", color: "#000" }}>

						</div>
						<div style={{ width: "1.5cm", color: "#000" }}>

						</div>
						<div style={{ width: "1.2cm", color: "#000" }}></div>
						<div style={{ width: "3cm", color: "#000" }}></div>
						<div style={{ width: "1cm", color: "#000" }}></div>
						<div style={{ width: "3.5cm", textAlign: "right", color: "#000" }}></div>
					</div>

					{products.filter(p => p.itemName).map((p, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								height: "0.5cm",
								lineHeight: "0.5cm",
								alignItems: "center",
							}}
						>
							<div style={{
								width: "1cm",
								textAlign: "right",
								marginLeft: "2.3cm",
								fontWeight: "bold",
								color: "#000",
								flexShrink: 0
							}}>
								{i + 1}
							</div>

							<div style={{
								marginLeft: "0.7cm",
								width: "6.5cm",
								color: "#000",
								fontWeight: "bold",
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								flexShrink: 0
							}}>
								{p.itemName}
							</div>

							<div style={{
								width: "1cm",
								color: "#000",
								marginLeft: "-0.3cm",
								textAlign: "left",
								fontWeight: "bold",
								flexShrink: 0
							}}>
								{p.hsnCode}
							</div>

							<div style={{
								width: "1cm",
								color: "#000",
								textAlign: "center",
								fontWeight: "bold",
								flexShrink: 0,
								marginLeft: "0.25cm"
							}}>
								{p.gstPercentage}
							</div>

							<div style={{
								width: "5cm",
								color: "#000",
								textAlign: "center",
								fontWeight: "bold",
							}}>{p.quantity}</div>

							<div style={{
								width: "4.7cm",
								color: "#000",
								textAlign: "center",
								fontWeight: "bold",
								marginRight: "0.5cm"
							}}>{p.itemRate}</div>

							<div style={{
								width: "1.2cm",
								color: "#000",
								fontWeight: "bold",
								marginLeft: "1cm",
								textAlign: "left",
								marginRight: "0.9cm"
							}}>{p.billQuantity}</div>

							<div style={{
								width: "5cm",
								textAlign: "right",
								fontWeight: "bold",
								color: "#000",
							}}>
								{/* {NumberFormat(p.amount)} */}
								{parseFloat(p.amount || 0).toFixed(2)}
							</div>
						</div>
					))}
				</div>

				<p style={{
					position: "absolute",
					fontWeight: "bold",
					top: "9.94cm",
					left: "3.1cm"
				}}>
					TMB A/C NO: 002530350870041  IFSC : TMBL0000002
				</p>

				<div style={{
					position: "absolute",
					top: "10.5cm",
					left: "3.1cm",
					color: "#000",
					width: "15cm"
				}}>
					<span>INR</span>   {numberToWords(parseInt(netAmount))}
				</div>

				<div style={{
					position: "absolute",
					top: "9.1cm",
					left: "0cm",
					width: "20cm"
				}}>

					{expenses.map((e, i) => (
						<div
							key={i}
							style={{
								position: "absolute",
								top: `${i * 0.5}cm`,
								display: "flex",
								height: "0.5cm",
								lineHeight: "0.5cm",
								alignItems: "center",
								width: "100%"
							}}
						>
							<div style={{ width: "5.0cm" }}></div>
							<div style={{ width: "0.3cm" }}></div>
							<div style={{ width: "1.9cm" }}></div>
							<div style={{ width: "0.9cm" }}></div>
							<div style={{ width: "1.3cm" }}></div>

							<div style={{
								width: "4.2cm",
								marginLeft: "4.5cm",
								lineHeight: "normal",
								color: "#000",
								fontSize: '10px'
							}}>
								{e.expenseName}
							</div>

							<div style={{ width: "0cm" }}></div>

							<div style={{
								width: "1.5cm",
								textAlign: "right",
								color: "#000",
								fontSize: '12px',
								marginRight: "auto"
							}}>
								{NumberFormat(e.expenseValue)}
							</div>
						</div>
					))}

					{roundOffValue ? (
						<div style={{
							position: "absolute",
							top: "0.5cm",
							display: "flex",
							height: "0.5cm",
							fontWeight: "bold",
							alignItems: "center",
							width: "100%"
						}}>
							<div style={{ width: "5.0cm" }}></div>
							<div style={{ width: "0.3cm" }}></div>
							<div style={{ width: "1.9cm" }}></div>
							<div style={{ width: "0.9cm" }}></div>
							<div style={{ width: "1.3cm" }}></div>

							<div style={{
								width: "4.2cm",
								marginLeft: "8.5cm",
								lineHeight: "normal",
								color: "#000",
								fontSize: '10px',
								fontWeight: "bold"
							}}>

							</div>

							<div style={{ width: "0cm" }}></div>


							<div style={{
								position: "absolute",
								right: "0.5cm",
								textAlign: "right",
								color: "#000",
								fontSize: '12px',
								fontWeight: "bold",
								top: "0.45cm"
							}}>
								{/* {parseFloat(p.amount || 0).toFixed(2)} */}
								{(parseFloat(roundOffValue) || 0).toFixed(2)}
							</div>
						</div>
					) : null}


					<div style={{
						position: "absolute",
						top: "1.6cm",
						left: "14cm",
						fontWeight: "bold",
						textAlign: "center",
						color: "#000",
						fontSize: "18px",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: "140px"
					}}>
						<span></span>
						{(Number(parseFloat(netAmount || 0)).toFixed(2))}
					</div>
				</div>

				{/* HSN Summary */}
				<div style={{
					position: "absolute",
					top: "11.6cm",
					fontSize: "10px",
					left: "3cm",
					width: "10cm"
				}}>
					{hsnSummary.map((h, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								alignItems: "center",
								width: "100%",
								marginBottom: "0.0cm"
							}}
						>
							<span style={{
								color: "#000",
								fontWeight: "bold",
								width: "3cm",
								textAlign: "left"
							}}>
								{h.hsn}
							</span>
							<span style={{
								color: "#000",
								fontWeight: "bold",
								width: "3cm",
								textAlign: "right",
								// marginLeft: "auto"
							}}>
								{NumberFormat(h.amount)}
							</span>
						</div>
					))}
					{/* Total Row */}
					<div style={{
						display: "flex",
						alignItems: "center",
						width: "100%",
						marginTop: "0.0cm",

						paddingTop: "0.1cm",
						fontWeight: "bold"
					}}>
						<span style={{
							color: "#000",
							width: "3cm",
							textAlign: "left"
						}}>

						</span>
						<span style={{
							color: "#000",
							width: "3cm",
							textAlign: "right",
							top: "0"
							// marginLeft: "auto"
						}}>
							{NumberFormat(
								hsnSummary.reduce(
									(sum, item) => sum + Number(item.amount || 0),
									0
								)
							)}
						</span>
					</div>
				</div>

				{/* Order By & Invoice By */}
				<div style={{
					position: "absolute",
					top: "11.6cm",
					left: "16cm",
					width: "4.4cm",
					overflow: "hidden",
					fontSize: "11px",
					color: "#000",
					fontWeight: "bold"
				}}>
					<div style={{ display: "flex", height: "0.5cm", alignItems: "center", whiteSpace: "nowrap" }}>
						<span style={{ flexShrink: 0 }}>Order By</span>
						<span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>: {orderBy}</span>
					</div>
					<div style={{ display: "flex", height: "0.5cm", alignItems: "center", whiteSpace: "nowrap" }}>
						<span style={{ flexShrink: 0 }}>Invoice By</span>
						<span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>: {invoiceBy}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvoiceTemplate;