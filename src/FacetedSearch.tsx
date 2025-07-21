import React, {useContext} from 'react';
import {StatContext} from './StatContext';
import {Button, Stack} from "@mui/material";

export const FacetedSearch: React.FC<{ itemName?: string }> = ({itemName = 'Items:'}) => {
    const {filtered, switchFilter, dataArray, selectAll} = useContext(StatContext);

    const handleFilterChange = (id: string) => {
        switchFilter(id);
    };

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={5} alignItems="center" justifyContent="space-between">
                <strong>{itemName}</strong>
                <Button size='small' variant={'contained'} onClick={() => selectAll()}>Select all</Button>
            </Stack>

            {dataArray.map(item => (
                <div key={item.id}>
                    <label>
                        <input
                            type="checkbox"
                            checked={filtered.includes(item.id)}
                            onChange={() => handleFilterChange(item.id)}
                        />{' '}
                        {item.name}
                    </label>
                </div>
            ))}
        </Stack>
    );
};