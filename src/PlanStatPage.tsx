import React, {useEffect, useState} from 'react';
import * as d3 from 'd3';
import {Box, Stack} from '@mui/material';
import {Plan, StatComponent} from './StatContext';
import {FacetedSearch} from './FacetedSearch';
import CustomBarChart from './CustomBarChart';

const PlanStatPage = () => {
    const [data, setData] = useState<Plan[]>([]);

    useEffect(() => {
        d3.csv('/plan_data.csv', d => ({
            id: d.name || '',
            name: d.name || '',
            avg_duration: +d.avg_duration!,
            runsCount: +d.runsCount!,
            nodesCount: +d.nodesCount!
        })).then(setData);
    }, []);

    if (data.length === 0) {
        return <div>Loading…</div>;
    }

    const getYValueRunsCount = (d: any) => d.runsCount;
    const getYValueRunsDuration = (d: any) => d.avg_duration;
    const getDurationPerNode = (d: any) => d.avg_duration / d.nodesCount;

    return (
        <Box padding={6}>
            <StatComponent data={data}>
                <Stack spacing={2} direction="row">
                    <Stack spacing={4} direction="column">
                        <CustomBarChart
                            chartId="planRunsDuration"
                            chartTitle="Plan runs average duration"
                            getYValue={getYValueRunsDuration}
                            height={350}
                            width={600}
                        />
                        <CustomBarChart
                            chartId="planNodesCount"
                            chartTitle="Duration/node count"
                            getYValue={getDurationPerNode}
                        />
                        <CustomBarChart
                            chartId="planRunsCount"
                            chartTitle="Plan runs count"
                            getYValue={getYValueRunsCount}
                            isShowingOutliers={false}
                        />
                    </Stack>
                    <FacetedSearch itemName="Plans:"/>
                </Stack>
            </StatComponent>
        </Box>
    );
};

export default PlanStatPage;