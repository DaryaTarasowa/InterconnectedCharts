import { Checkbox, FormControl, Grid, InputLabel } from '@ayx/onyx-ui';
import React, { useContext } from 'react';

import { StatContext, TID } from './StatContext';

export const FacetedSearch: React.FC<{ itemName?: string }> = ({ itemName = 'Items:' }) => {
  const { filtered, changeFilter, dataArray } = useContext(StatContext);
  const handleFilterChange = (newId: TID) => changeFilter(newId);
  return (
    <Grid container direction="row" item>
      <FormControl fullWidth>
        <InputLabel htmlFor="input-expression">{itemName}</InputLabel>
        {dataArray?.map(item => (
          <Grid item>
            <Checkbox checked={filtered.includes(item.id as TID)} onChange={() => handleFilterChange(item.id as TID)} />
            {item.id}
          </Grid>
        ))}
      </FormControl>
    </Grid>
  );
};
