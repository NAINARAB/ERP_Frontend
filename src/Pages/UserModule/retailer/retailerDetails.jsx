import { Card, CardContent, CardMedia, Paper } from "@mui/material";
import { Person, Call, LocationOn } from "@mui/icons-material";
import ImagePreviewDialog from "../../../Components/imagePreview";
import { useEffect, useState } from "react";
import { checkIsNumber } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";

const RetailerDetailsCard = ({ Retailer_Id }) => {
    const [retailerInfo, setRetailerInfo] = useState({});

    useEffect(() => {
        setRetailerInfo({})
        if (checkIsNumber(Retailer_Id)) {
            fetchLink({
                address: `masters/retailers/info?Retailer_Id=${Retailer_Id}`
            }).then(data => {
                if (data?.success && data?.data?.length > 0) {
                    setRetailerInfo(data.data[0])
                }
            }).catch(e => console.error(e))
        }
    }, [Retailer_Id])

    return (
        <Card component={Paper} variant='outlined'>
            <div className="row">
                <div className="col-xl-2 col-md-3 d-flex align-items-center">
                    <ImagePreviewDialog url={retailerInfo?.imageUrl} >
                        <CardMedia
                            component="img"
                            sx={{ width: 200, height: 200 }}
                            image={retailerInfo?.imageUrl}
                            alt="retailer_picture"
                        />
                    </ImagePreviewDialog>
                </div>

                <div className="col-xl-10 col-md-9 d-flex flex-column justify-content-center p-2" >
                    <CardContent>

                        <h6
                            className="mb-2 fa-18 fw-bold text-primary text-decoration-underline"
                            onClick={() => {
                                if (retailerInfo?.VERIFIED_LOCATION?.latitude && retailerInfo?.VERIFIED_LOCATION?.longitude) {
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${retailerInfo?.VERIFIED_LOCATION?.latitude},${retailerInfo?.VERIFIED_LOCATION?.longitude}`, '_blank');
                                } else {
                                    if (retailerInfo?.Latitude && retailerInfo?.Longitude) {
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${retailerInfo?.Latitude},${retailerInfo?.Longitude}`, '_blank');
                                    }
                                }
                            }}
                        >
                            {retailerInfo?.Retailer_Name}
                        </h6>
                        <p><LocationOn className="fa-14 text-primary" /> {retailerInfo?.Reatailer_Address}</p>
                        <p className="fa-14 "> {retailerInfo?.RouteGet}</p>
                        <p className="fa-14 ">Class: {retailerInfo?.Retailer_Class}</p>
                        <p className="text-primary "><Person className="fa-14 text-primary" /> {retailerInfo?.Contact_Person}</p>
                        <a href={`tel:${retailerInfo?.Mobile_No}`}><Call className="fa-14 text-primary" />
                            <span className="ps-1">{retailerInfo?.Mobile_No}</span>
                        </a>

                        <p className="fw-bold fa-14 text-muted">
                            Created: {retailerInfo?.Created_Date ? new Date(retailerInfo?.Created_Date).toLocaleDateString('en-IN') : '--:--:--'}
                            &nbsp; - &nbsp;
                            {retailerInfo?.createdBy}
                        </p>

                    </CardContent>
                </div>
            </div>
        </Card>
    )
}

export default RetailerDetailsCard;