const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        height: '45px',
        background: 'rgba(255, 255, 255, 0.322)'
    }),
    menu: (provided, state) => ({
        ...provided,
        zIndex: 9999,
    }),
};

const customSelectStyles2 = {
    control: (provided, state) => ({
        ...provided,
        background: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.322)',
        // minWidth: '160px'
    }),
    menu: (provided, state) => ({
        ...provided,
        color: 'black',
        zIndex: 9999,
    }),
};

const MainMenu = [
    {
        id: 1,
        headname: 'Menu ID',
        variant: 'head',
        align: 'left',
        width: 100
    },
    {
        id: 2,
        headname: 'MenuName',
    },
    {
        id: 3,
        headname: 'Read Rights'
    },
    {
        id: 4,
        headname: 'Add Rights'
    },
    {
        id: 5,
        headname: 'Edit Rights'
    },
    {
        id: 6,
        headname: 'Delete Rights'
    },
    {
        id: 7,
        headname: 'Print Rights'
    },
    {
        id: 8,
        headname: 'Action'
    }
];

export {
    MainMenu,
    customSelectStyles,
    customSelectStyles2
}