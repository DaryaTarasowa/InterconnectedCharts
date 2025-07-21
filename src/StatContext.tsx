import React, {createContext, useState, ReactNode} from 'react';

export type TID = string;
export type Plan = { id: TID; name: string; avg_duration: number };

interface StatContextType {
    dataArray: Plan[];
    filtered: TID[];
    switchFilter: (id: TID) => void;
    selectOne: (id: TID) => void;
    selectAll: () => void;
}

export const StatContext = createContext<StatContextType>({
                                                              dataArray: [],
                                                              filtered: [],
                                                              switchFilter: () => {
                                                              },
                                                              selectOne: () => {
                                                              },
                                                              selectAll: () => {
                                                              }
                                                          });

export const StatComponent = ({data, children}: { data: Plan[]; children: ReactNode }) => {
    const [filtered, setFiltered] = useState<TID[]>(data.map(d => d.id));

    const changeFilter = (id: TID) => {
        setFiltered(prev =>
                        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectOne = (id: TID) => {
        setFiltered([id]);
    };

    const selectAll = () => {
        setFiltered(data.map(d => d.id));
    }

    return (
        <StatContext.Provider
            value={{dataArray: data, filtered, switchFilter: changeFilter, selectOne: selectOne, selectAll: selectAll}}>
            {children}
        </StatContext.Provider>
    );
};

export const StatChildComponent = ({children}: { children: ReactNode }) => children;