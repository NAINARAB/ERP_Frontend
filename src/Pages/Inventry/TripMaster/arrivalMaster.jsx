import { useState } from "react";
import ArrivalList from "./arrivaList";
import ArrivalCreation from "./arrivalCreation";

const ArrivalMaster = ({ loadingOn, loadingOff }) => {
    const [display, setDisplay] = useState('list')
    return (
        <>
            {display === 'list' && (
                <ArrivalList 
                    switchDisplay={() => setDisplay('create')}
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                />
            )}
            {display === 'create' && (
                <ArrivalCreation 
                    switchDisplay={() => setDisplay('list')}
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    
                />
            )}
        </>
    )
}

export default ArrivalMaster;