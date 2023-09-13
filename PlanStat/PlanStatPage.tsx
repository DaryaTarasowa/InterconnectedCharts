import { Box, Grid } from '@ayx/onyx-ui';
import React, { FC } from 'react';

import { usePlansTableQuery } from '@plans/hooks/api/queries';

import { CustomBarChart } from './CustomBarChart';
import { FacetedSearch } from './FacetedSearch';
import { StatChildComponent, StatComponent, TID } from './StatContext';

export const PlanStatPage: FC = () => {
  const { data, isError } = usePlansTableQuery();

  if (isError) {
    return <>isError</>;
  }

  const plans = data?.data ?? [];

  const getRunsOutOfPlans = (plansLocal: any): any[] => {
    const snapshots = plansLocal.reduce((acc: any[], plan: any) => acc.concat(plan.planSnapshots?.data), []);
    return snapshots.reduce((acc: any[], snapshot: any) => acc.concat(snapshot.planSnapshotRuns?.data), []);
  };

  const getPlanIdFromPlanRun = (runId: TID): TID => {
    const isRunFromPlan = (plan: any) => {
      const snapshots = plan.planSnapshots?.data;
      if (snapshots?.length > 0) {
        const runIds = snapshots.reduce(
          (acc: TID[], snapshot: any) => acc.concat(snapshot.planSnapshotRuns?.data?.map((planRun: any) => planRun.id)),
          []
        );
        return runIds.includes(runId);
      }
      return false;
    };
    const foundId = plans.find(isRunFromPlan)?.id;
    return foundId as unknown as TID;
  };

  const getYValueRunsDuration = (d: any) =>
    // @ts-expect-error
    (new Date(d.finishedAt) - new Date(d.startedAt)) / 60000;
  const getYValueNodesCount = (d: any) => d.planNodes?.data?.length;
  const getYValueRunsCount = (d: any) => {
    const snapshots = d.planSnapshots?.data;
    if (snapshots?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,no-unsafe-optional-chaining
      return snapshots.reduce((acc: number, i: any) => acc + i.planSnapshotRuns?.data?.length ?? 0, 0);
    }
    return 0;
  };

  return (
    <Box padding={6}>
      <StatComponent dataArray={plans}>
        <Grid container>
          <Grid container item md={10} sm={8} xs={4}>
            <Grid item md={4} sm={6} xs={12}>
              <CustomBarChart chartId="planNodesCount" chartTitle="Plan nodes count" getYValue={getYValueNodesCount} />
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
              <CustomBarChart chartId="planRunsCount" chartTitle="Plan runs count" getYValue={getYValueRunsCount} />
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
              <StatChildComponent getChildren={getRunsOutOfPlans} getParent={getPlanIdFromPlanRun}>
                <CustomBarChart
                  chartId="planRunsDuration"
                  chartTitle="Plan runs duration"
                  getYValue={getYValueRunsDuration}
                />
              </StatChildComponent>
            </Grid>
          </Grid>

          <Grid item md={2} sm={4} xs={12}>
            <FacetedSearch itemName="Plans:" />
          </Grid>
        </Grid>
      </StatComponent>
    </Box>
  );
};
