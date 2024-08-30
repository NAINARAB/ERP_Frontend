import React from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';

const flowStyles = { width: '100%', height: 600 };

const FlowChart = ({ levelOneTasks, levelTwoTasks, levelThreeTasks }) => {
    const levelOneY = 50;
    const levelTwoY = 250;
    const levelThreeY = 450;

    const levelOneNodes = levelOneTasks.map((task, index) => ({
        id: task.Task_Levl_Id.toString(),
        data: { label: `${task.TaskNameGet} (${task.Task_Levl_Id})` },
        position: { x: index * 250, y: levelOneY },
        style: { border: '1px solid red', padding: 10, background: '#ffcccb' },
    }));

    const levelTwoNodes = levelTwoTasks.map((task, index) => ({
        id: task.Task_Levl_Id.toString(),
        data: { label: `${task.TaskNameGet} (${task.Task_Levl_Id})` },
        position: { x: index * 250, y: levelTwoY },
        style: { border: '1px solid blue', padding: 10, background: '#add8e6' },
    }));

    const levelTwoEdges = levelTwoTasks.flatMap((task) =>
        task.DependancyTasks.map(dependency => ({
            id: `e${dependency.Task_Depend_Level_Id}-${task.Task_Levl_Id}`,
            source: dependency.Task_Depend_Level_Id.toString(),
            target: task.Task_Levl_Id.toString(),
            type: 'straight',
            arrowHeadType: 'arrowclosed',
        }))
    );

    const levelThreeNodes = levelThreeTasks.map((task, index) => ({
        id: task.Task_Levl_Id.toString(),
        data: { label: `${task.TaskNameGet} (${task.Task_Levl_Id})` },
        position: { x: index * 250, y: levelThreeY },
        style: { border: '1px solid green', padding: 10, background: '#90ee90' },
    }));

    const levelThreeEdges = levelThreeTasks.flatMap((task) =>
        task.DependancyTasks.map(dependency => ({
            id: `e${dependency.Task_Depend_Level_Id}-${task.Task_Levl_Id}`,
            source: dependency.Task_Depend_Level_Id.toString(),
            target: task.Task_Levl_Id.toString(),
            type: 'straight',
            arrowHeadType: 'arrowclosed',
        }))
    );

    const nodes = [...levelOneNodes, ...levelTwoNodes, ...levelThreeNodes];
    const edges = [...levelTwoEdges, ...levelThreeEdges];

    return (
        <div style={flowStyles}>
            <ReactFlow
                elements={[...nodes, ...edges]}
                snapToGrid={true}
                snapGrid={[15, 15]}
            >
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
};

export default FlowChart;
