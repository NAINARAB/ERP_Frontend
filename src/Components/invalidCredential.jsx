

const InvalidPageComp = ({message}) => {
    return (
        <>
            <div className="d-flex flex-column align-items-center justify-content-center p-5">
                <h5>{ message || 'Invalid Credentials'} ☹️</h5>
                <button 
                    className="btn btn-primary rounded-5 px-5"
                    // onClick={() => window.location.reload()}
                    >
                        Refresh
                </button>
            </div>
        </>
    )
}

export default InvalidPageComp;