import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, Box } from "@mui/material";

const AppTabs = ({ tabData = [], defaultTab = 0 }) => {
    const safeDefaultTab =
        defaultTab >= 0 && defaultTab < tabData.length ? defaultTab : 0;

    const [value, setValue] = useState(safeDefaultTab);

    useEffect(() => {
        setValue(safeDefaultTab);
    }, [safeDefaultTab]);

    if (!tabData.length) return null;

    return (
        <Box>
            <Tabs
                value={value}
                onChange={(_, newValue) => setValue(newValue)}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
            >
                {tabData.map((tab, index) => (
                    <Tab
                        key={tab.key || index}
                        label={tab.label}
                        disabled={tab.disabled}
                        id={`app-tab-${index}`}
                        aria-controls={`app-tabpanel-${index}`}
                    />
                ))}
            </Tabs>

            {tabData.map((tab, index) => (
                <div
                    key={tab.key || index}
                    role="tabpanel"
                    hidden={value !== index}
                    id={`app-tabpanel-${index}`}
                    aria-labelledby={`app-tab-${index}`}
                >
                    {value === index && <Box>{tab.children}</Box>}
                </div>
            ))}
        </Box>
    );
};

AppTabs.propTypes = {
    tabData: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.node.isRequired,
            children: PropTypes.node,
            disabled: PropTypes.bool,
            key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ).isRequired,
    defaultTab: PropTypes.number,
};

export default AppTabs;
