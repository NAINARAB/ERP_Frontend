import { useEffect, useState, useContext } from "react";
import api from "../../API";
import '../common.css'
import { BarChart, Group, WorkHistory, CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from '../../Components/invalidCredential';


const ActiveProjects = () => {
    const [projects, setProjects] = useState([]);
    const { contextObj } = useContext(MyContext);
    const nav = useNavigate();

    useEffect(() => {
        fetch(`${api}projectAbstract`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setProjects(data.data);
                }
            });
    }, []);

    const calcPercentage = (mainTask, subTask, mainCompleted, subCompleted) => {
        const taskCount = parseInt(mainTask) + parseInt(subTask);
        const completed = parseInt(mainCompleted) + parseInt(subCompleted);
        if (taskCount === 0) {
            return 0;
        } else {
            return (completed / taskCount) * 100;
        }
    }

    return parseInt(contextObj.Read_Rights) === 1 ? (
        <>
            {projects.map((o, i) => (
                <div className="project-card" key={i}>
                    <p className="fa-18 text-dark text-uppercase fw-bold">
                        <span>{o.Project_Name} </span>
                    </p>

                    <div className="row">

                        <div className="col-lg-4 col-md-6 mb-3">
                            <div className="p-3 rounded-3 mnh">
                                <div className="d-flex">
                                    <span className='smallicon fa-17 me-2'><BarChart className="fa-in" /></span>
                                    <span className='text-uppercase fw-bold fa-16 text-muted'>progress</span>
                                </div>
                                <p className="text-end fa-20 mb-0 fw-bold" >
                                    {calcPercentage(o?.InvolvedTasksCount, o?.InvolvedSubTasksCount, o?.CompletedTasks, o?.CompletedSubTasks)} %
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-3">
                            <div className="p-3 rounded-3 mnh" >
                                <div className="d-flex">
                                    <span className='smallicon fa-17 me-2'><Group className="fa-in" /></span>
                                    <span className='text-uppercase fw-bold fa-16 text-muted'>employee</span>
                                </div>
                                <p className="text-end fa-20 mb-0 fw-bold">{o?.InvolvedEmployeesCount}</p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-3">
                            <div className="p-3 rounded-3 mnh" >
                                <div className="d-flex">
                                    <span className='smallicon fa-17 me-2'><WorkHistory className="fa-in" /></span>
                                    <span className='text-uppercase fw-bold fa-16 text-muted'>tasks / completed</span>
                                </div>
                                <p className="text-end fa-20 mb-0 fw-bold">{o?.InvolvedTasksCount + " | " + o?.CompletedTasks}</p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-3">
                            <div className="p-3 rounded-3 mnh" >
                                <div className="d-flex">
                                    <span className='smallicon fa-17 me-2'><WorkHistory className="fa-in" /></span>
                                    <span className='text-uppercase fw-bold fa-16 text-muted'>sub tasks / completed</span>
                                </div>
                                <p className="text-end fa-20 mb-0 fw-bold">{o?.InvolvedSubTasksCount + " | " + o?.CompletedSubTasks}</p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-3">
                            <div className="p-3 rounded-3 mnh" >
                                <div className="d-flex">
                                    <span className='smallicon fa-17 me-2'><CalendarMonth className="fa-in" /></span>
                                    <span className='text-uppercase fw-bold fa-16 text-muted'>duration</span>
                                </div>
                                <p className="text-end fa-15 mb-0 fw-bold">
                                    {o?.Est_Start_Dt && (
                                        new Date(o.Est_Start_Dt)
                                            .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                    {" - "}
                                    {o?.Est_End_Dt && (
                                        new Date(o.Est_End_Dt)
                                            .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                    {" "}
                                    {"\(" + ((new Date(o.Est_End_Dt) - new Date(o.Est_Start_Dt)) / (1000 * 60 * 60 * 24) + 1) + "DAYS\)"}
                                </p>
                            </div>
                        </div>

                    </div>

                    <hr className="m-0" />

                    <div className="text-end mt-2">
                        <button className="btn btn-primary rounded-5 px-4 text-white fw-bold" onClick={() => { }}>
                            OPEN
                        </button>
                    </div>

                </div>
            ))}
        </>
    )
        : <InvalidPageComp />
}

export default ActiveProjects;