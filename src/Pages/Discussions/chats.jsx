import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../API';
import { useNavigate } from 'react-router-dom';


const ChatsDisplayer = () => {
    const location = useLocation();
    // const locationData = location.state;
    const locationData = {
        CreatedAt : "2024-03-07T11:27:20.790Z",
        Description:"booring to say",
        Id:6,
        InvolvedUsers:[
            {UserId: 1, Name: 'ADMIN'},
            {UserId: 2, Name: 'RAJ'}
        ],
        InvolvedUsersCount:2,
        Project_Id: 0,
        Topic: "Booring Topic",
        TotalMessages: 0
    };
    const navigate = useNavigate();
    const [messageData, setMessageData] = useState([])


    useEffect(() => {
        // if (!locationData) {
        //     return navigate('/discussions')
        // }
        // fetch(`${api}messages?Topic_Id=${locationData?.Id}`) 
        // .then(res => res.json())
        // .then(data => {
        //     if (data.success) {
        //         setMessageData(data.data);
        //     }
        // })
        fetch(`${api}messages?Topic_Id=${1}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessageData(data.data);
                }
            })
    }, [])

    return (
        <>
        
        </>
    )
}

export default ChatsDisplayer;