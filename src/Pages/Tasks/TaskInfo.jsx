import { IconButton } from '@mui/material'
import { KeyboardArrowLeft, WorkHistory, QueryBuilder, BusinessCenter, PersonAdd, PlaylistAdd, Notes, Person } from '@mui/icons-material';


const CardDiv = ({ label, icon, data }) => (
    <div className="col-xl-3 col-lg-4 col-md-6 px-2 py-1">
        <div className="badge text-start bg-primary w-100 p-3 fa-16">
            <span className='float-start text-uppercase'>{icon} {label}</span>
            <span className='float-end'>{data}</span>
        </div>
    </div>
)

const TaskInfo = ({ row, branch, users, baseGroup, taskType, project, status, projectHead, filterValue, setFilterValue, setScreen }) => {

    console.log(row)


    return (
        <>
            <div className="card mb-2">
                <div className="card-header fw-bold bg-white d-flex align-items-center justify-content-between rounded-3">
                    <span className='text-primary'>TASK INFO</span>
                    <div className="text-end">
                        <IconButton size="small" onClick={setScreen} color='primary'>
                            <KeyboardArrowLeft />
                        </IconButton>
                        <IconButton size="small" onClick={setScreen} color='primary'>
                            <PersonAdd />
                        </IconButton>
                        <IconButton size="small" onClick={setScreen} color='primary'>
                            <PlaylistAdd />
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className="row">
                <CardDiv 
                    label={'PROJECT'} 
                    icon={<BusinessCenter className='fa-in me-2' />} 
                    data={row?.Task_Name} />
                <CardDiv
                    label={'FROM'}
                    icon={<QueryBuilder className='fa-in me-2' />}
                    data={new Date(row?.Est_Start_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
                <CardDiv
                    label={'TO'}
                    icon={<QueryBuilder className='fa-in me-2' />}
                    data={new Date(row?.Est_End_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
                <CardDiv 
                    label={'Main Task'} 
                    data={row?.Main_Task_Name}
                    icon={<Notes className='fa-in me-2' />} />
                <CardDiv 
                    label={'project head'} 
                    data={row?.Project_Head_User_Name}
                    icon={<Person className='fa-in me-2' />} />

            </div>
        </>
    )
}

export default TaskInfo;