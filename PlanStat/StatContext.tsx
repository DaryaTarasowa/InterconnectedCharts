import React, { createContext, FC, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type TID = 'string' | 'int';
interface IStatContext {
  changeFilter?: (newId: TID) => void;
  dataArray?: any[];
  filtered: TID[];
}

export const StatContext = createContext<IStatContext>({
  changeFilter: undefined,
  dataArray: undefined,
  filtered: [],
});

interface IStat extends PropsWithChildren {
  dataArray: any[] | undefined;
}

interface IStatChild extends PropsWithChildren {
  getChildren: (data: any) => any[];
  // eslint-disable-next-line react/no-unused-prop-types
  getParent: (childId: TID) => TID;
}

export const StatComponent: FC<IStat> = ({ children, dataArray }) => {
  const [filtered, setFiltered] = useState<TID[]>([]);
  const changeFilter = (newId: TID) => {
    const isInArray = filtered.includes(newId);
    const newFiltered = isInArray ? filtered.filter(id => id !== newId) : [newId, ...filtered];
    setFiltered(newFiltered);
  };
  const PlanStatContextValue = useMemo(
    () => ({ changeFilter, dataArray, filtered }),
    [changeFilter, filtered, dataArray]
  );

  return <StatContext.Provider value={PlanStatContextValue}>{dataArray?.length && children}</StatContext.Provider>;
};

export const StatChildComponent: FC<IStatChild> = ({ children, getChildren }) => {
  const { filtered, dataArray } = useContext(StatContext);

  const childFilteredArray = filtered.length
    ? getChildren(dataArray?.filter(item => filtered.includes(item.id)))
    : getChildren(dataArray) ?? [];
  const childFiltered = childFilteredArray.map(item => item.id);

  // const [childFiltered, setChildFiltered] = useState<TID[]>([]);
  // const childChangeFilter = (newId: TID) => {
  //   const newChildFiltered = [newId];
  //   if (!childFiltered.includes(newId)) {
  //     // select only parent item
  //     setChildFiltered(newChildFiltered);
  //     filtered.forEach(changeFilter); // deselect all
  //     changeFilter(getParent(newId));
  //   }
  // };

  const StatChildContextValue = useMemo(
    () => ({ dataArray: childFilteredArray, filtered: childFiltered }),
    [childFiltered, childFilteredArray]
  );

  return <StatContext.Provider value={StatChildContextValue}>{dataArray?.length && children}</StatContext.Provider>;
};

export default { StatChildComponent, StatComponent, StatContext };
