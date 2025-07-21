import React, {useContext, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {StatContext, TID} from './StatContext';

const DEFAULT_WIDTH = 460;
const DEFAULT_HEIGHT = 200;
const NULL_VALUE_HEIGHT = 0.02;

interface ICustomBarChart {
    chartContainerId?: string;
    chartId: string;
    chartTitle?: string;
    getYValue: (d: any) => number;
    height?: number;
    width?: number;
    threshold?: number;
    isShowingOutliers?: boolean;
}

export const CustomBarChart = ({
                                   chartContainerId = `chart_${Math.floor(
                                       Math.random() * 100000)}_container`,
                                   chartId,
                                   chartTitle = 'Bar chart',
                                   getYValue,
                                   height = DEFAULT_HEIGHT,
                                   width = DEFAULT_WIDTH,
                                   threshold = 1.5,
                                   isShowingOutliers = true,
                               }: ICustomBarChart) => {
    const {filtered, switchFilter, selectOne, dataArray} = useContext(StatContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredId, setHoveredId] = useState<TID | null>(null);

    const margin = {
        top: height / 12,
        right: width / 16,
        bottom: height / 6,
        left: width / 8,
    };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const computeScales = () => {
        const values = dataArray.map(getYValue);
        const maxY = d3.max(values) || 0;

        return {
            xScale: d3.scaleBand<TID>()
                .domain(dataArray.map(d => d.id))
                .range([0, chartWidth])
                .padding(0.2),
            yScale: d3.scaleLinear()
                .domain([0, maxY])
                .range([chartHeight, 0]),
            outlierThreshold: (d3.mean(values) || 0) + (threshold * (d3.deviation(values) || 0)),
        };
    };

    const drawAxes = (xScale: d3.ScaleBand<TID>, yScale: d3.ScaleLinear<number, number>) => {
        d3.select(containerRef.current).selectAll('svg').remove();

        const svg = d3.select(containerRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0)
            .style('pointer-events', 'none');

        svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top + chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(d3.axisLeft(yScale));
    };

    const drawChart = () => {
        if (!canvasRef.current || !dataArray.length) {
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
            return;
        }

        const {xScale, yScale, outlierThreshold} = computeScales();
        const filteredSet = new Set(filtered);

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(margin.left, margin.top);

        // Draw title
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '14px Verdana';
        ctx.fillStyle = 'black';
        ctx.fillText(chartTitle, chartWidth / 2, -margin.top);

        // Draw bars
        dataArray.forEach(d => {
            const x = xScale(d.id);
            const yVal = getYValue(d);
            const y = yScale(yVal);
            const barHeight = chartHeight - y;

            if (x == null) {
                return;
            }

            const isOutlier = isShowingOutliers && yVal > outlierThreshold;
            const isSelected = filteredSet.has(d.id);

            ctx.fillStyle = isOutlier
                            ? isSelected ? 'darkred' : 'lavenderblush'
                            : isSelected ? 'steelblue' : 'lightgray';

            ctx.fillRect(x, y, xScale.bandwidth(), barHeight || NULL_VALUE_HEIGHT);

            if (hoveredId === d.id) {
                ctx.strokeStyle = 'midnightblue';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, xScale.bandwidth(), barHeight || NULL_VALUE_HEIGHT);
            }
        });

        ctx.restore();

        drawAxes(xScale, yScale);
    };

    useEffect(drawChart,
              [dataArray, getYValue, filtered, threshold, isShowingOutliers, width, height,
               hoveredId]);

    const getClickedId = (event: React.MouseEvent): TID | undefined => {
        const canvas = canvasRef.current;
        if (!canvas || !dataArray.length) {
            return;
        }

        const {xScale} = computeScales();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - margin.left;

        return dataArray.find(d => {
            const barX = xScale(d.id);
            return barX != null && x >= barX && x <= barX + xScale.bandwidth();
        })?.id;
    };

    const handleSingleClick = (event: React.MouseEvent) => {
        const id = getClickedId(event);
        if (id) {
            switchFilter(id);
        }
    };

    const handleDoubleClick = (event: React.MouseEvent) => {
        const id = getClickedId(event);
        if (id) {
            selectOne(id);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        const id = getClickedId(event);
        setHoveredId(id ?? null);
    };

    return (
        <div id={chartContainerId} ref={containerRef} style={{position: 'relative'}}>
            <canvas
                id={chartId}
                ref={canvasRef}
                width={width}
                height={height}
                onClick={handleSingleClick}
                onDoubleClick={handleDoubleClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredId(null)}
                style={{display: 'block', cursor: hoveredId ? 'pointer' : 'default'}}
            />
        </div>
    );
};

export default CustomBarChart;
