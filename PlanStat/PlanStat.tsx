import { AyxAppWrapper } from '@ayx/onyx-ui';
import { QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';

import { PlanStatPage } from '@plans/components/PlanStat/PlanStatPage';
import { messages } from '@plans/locales';
import { queryClient } from '@plans/queryClient';
import { store } from '@plans/redux/store';

export const PlanStat: React.FC = () => (
  <AyxAppWrapper messages={messages}>
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <PlanStatPage />
      </ReduxProvider>
    </QueryClientProvider>
  </AyxAppWrapper>
);
