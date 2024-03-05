
import { useContext, useState } from "react";
import { MyContext } from "../../Components/context/contextProvider";



const ProjectDetails = () => {
    const [projectDetails, setProjectDetails] = useState([]);
    const { contextObj } = useContext(MyContext);
    
    return parseInt(contextObj.Read_Rights) === 1 ? (
        <>
        
        </>
    ) : 
    <></>
}

export default ProjectDetails;