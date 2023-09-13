import * as d3 from 'd3';
import React, { createRef, useContext, useEffect } from 'react';

import { StatContext, TID } from './StatContext';

const BAR_CLASS_NAME = 'planStatRunsCountBar';

const MIN_WIDTH = 460;
const MIN_HEIGHT = 400;
const NULL_VALUE_HEIGHT = 0.02; // the height of a bar for a null
const CHART_ID = `chart${Math.floor(Math.random() * 100000)}`;

interface ICustomBarChart {
  chartContainerId?: string;
  chartId: string;
  chartTitle?: string;
  getYValue: (d: any) => number;
  minHeight?: number;
  minWidth?: number;
}

export const CustomBarChart: React.FC<ICustomBarChart> = ({
  getYValue,
  minWidth = MIN_WIDTH,
  minHeight = MIN_HEIGHT,
  chartTitle = 'Bar chart',
  chartId,
  chartContainerId = `${CHART_ID}_container`,
}) => {
  const { filtered, changeFilter, dataArray } = useContext(StatContext);
  const handleFilterChange = (newId: TID) => changeFilter(newId);

  const ref = createRef<SVGSVGElement>();

  const margin = {
    bottom: minHeight / 6,
    left: minWidth / 8,
    right: minWidth / 16,
    top: minHeight / 12,
  };
  const width = MIN_WIDTH - margin.left - margin.right;
  const height = MIN_HEIGHT - margin.top - margin.bottom;

  const buildChartSVG = () => {
    d3.select(ref.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('id', chartId);
  };

  const addTitle = () => {
    d3.select(`#${chartId}`)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 0 - margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(chartTitle);
  };

  const buildAxis = (xAxisGenerator: any, yAxisGenerator: any) => {
    d3.select(`#${chartId}`)
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisGenerator)
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');
    d3.select(`#${chartId}`).append('g').call(yAxisGenerator);
  };

  const x = (domain: string[]) => d3.scaleBand().range([0, width]).domain(domain).padding(0.2);
  const y = (domainMax: number) => d3.scaleLinear().domain([0, domainMax]).range([height, 0]);
  const xDomain = dataArray?.map(d => d.id) || [];
  const planRunsCountArray = dataArray?.map(getYValue || 0) || [];
  const yMax = Math.max(...planRunsCountArray);
  const xScale = x(xDomain);
  const yScale = y(yMax);

  // TODO: move style to css .BAR_CLASS_NAME class, implement :hover
  const buildBars = () => {
    d3.select(`#${chartId}`)
      .selectAll(BAR_CLASS_NAME)
      .data(dataArray || [])
      .enter()
      .append('rect')
      .on('click', d => handleFilterChange(d.id))
      .classed(BAR_CLASS_NAME, true)
      .attr('x', d => xScale(d.id) || 'No id')
      .attr('y', d => (getYValue(d) ? yScale(getYValue(d)) : (1 - NULL_VALUE_HEIGHT) * height))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(getYValue(d)) || NULL_VALUE_HEIGHT * height)
      .style('fill', d => (filtered.length === 0 || filtered.includes(d.id) ? '#5f0f40' : '#fcedf6'))
      .style('cursor', changeFilter ? 'pointer' : 'auto');
  };

  const cleanChart = () => {
    d3.select(ref.current).selectAll('*').remove();
  };

  const cleanBars = () => d3.select(`#${chartId}`).selectAll('rect').remove();

  useEffect(() => {
    const xAxisGenerator = d3.axisBottom(x(xDomain)).tickFormat((p, i) => dataArray?.map(d => d.name)[i]);
    const yAxisTicks = yScale.ticks().filter(tick => Number.isInteger(tick));
    const yAxisGenerator = d3.axisLeft(yScale).tickValues(yAxisTicks).tickFormat(d3.format('d'));

    cleanChart();
    buildChartSVG();
    addTitle();
    buildAxis(xAxisGenerator, yAxisGenerator);
    cleanBars();
    buildBars();
  }, [dataArray]);

  useEffect(() => {
    cleanBars();
    buildBars();
  }, [filtered]);

  return <svg id={chartContainerId} ref={ref} viewBox={`0 0 ${minWidth} ${minHeight}`} />;
};
