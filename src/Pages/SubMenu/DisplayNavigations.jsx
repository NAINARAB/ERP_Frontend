import { MyContext } from "../../Components/context/contextProvider";
import React, { useContext } from "react";
import { KeyboardDoubleArrowRight } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';


const setLoclStoreage = (pageId, menu) => {
    localStorage.setItem('CurrentPage', JSON.stringify({ id: pageId, type: menu }));
}

const DisplayNavigations = () => {
    const { contextObj } = useContext(MyContext);
    const nav = useNavigate();

    return (
        <>
            <div className="d-flex align-items-center flex-wrap justify-content-start">
                {contextObj?.ChildMenu?.map((o, i) => (
                    <button 
                        className={`childNavs d-flex justify-content-between`} 
                        key={i}
                        onClick={() => {
                            nav(o.url);
                            setLoclStoreage(o.id, 3);
                        }}
                    >
                        {o?.name} <KeyboardDoubleArrowRight /> 
                    </button>
                ))}
            </div>
        </>
    )
}

export default DisplayNavigations;