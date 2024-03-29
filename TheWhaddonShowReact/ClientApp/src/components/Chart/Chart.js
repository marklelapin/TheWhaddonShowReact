﻿import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import {
    Chart as chartJs,
    CategoryScale,
    LinearScale,
    ScatterController,
    BubbleController,
    BarController,
    LineController,
    PointElement,
    LineElement,
    BarElement,
} from 'chart.js'; //eslint-disable-line no-unused-vars

import { log, CHART as logType } from '../../dataAccess/logging';

const Chart = (props) => {

    const { id, config, onClick } = props;

    const chartRef = useRef(null)

    chartJs.register(CategoryScale);
    chartJs.register(LinearScale);
    chartJs.register(ScatterController);
    chartJs.register(BubbleController);
    chartJs.register(BarController);
    chartJs.register(LineController);
    chartJs.register(PointElement);
    chartJs.register(LineElement);
    chartJs.register(BarElement);

    log(logType, 'chart:' + id, config)

    //useEffect(() => {
    //    window.addEventListener('resize', resizeChart);
    //    return () => { removeEventListener('resize', resizeChart) }
    //}, []);


    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = chartRef.current.chartInstance;

            if (chartInstance) {
                chartInstance.destroy();
            }

            if (!config) return;

            const newChartInstance = createChartInstance();

            chartRef.current.chartInstance = newChartInstance

        }
    }, [config]) //eslint-disable-line react-hooks/exhaustive-deps

    //const resizeChart = () => {
    //    const chart = chartRef.current;
    //    const chartContainer = chart?.parentNode;
    //    if (chartContainer) {
    //        const width = chartContainer.clientWidth;
    //        const height = chartContainer.clientHeight;
    //        chart.width = width;
    //        chart.height = height;
    //        console.log('chartContainer', { width, height })
    //    }

    //    const chartInstance = chartRef.current.chartInstance;
    //    console.log('resizeChart', { chartInstance: chartRef.current.chartInstance })
    //    if (chartInstance) {
    //        chartInstance.update();
    //    }

    //};


    const handleClick = (event, elements, chart) => {

        console.log('resultChartClickHandler', elements, chart)

        let chartValues = {}

        if (elements.length > 0) {
            var datasetIndex = elements[0].datasetIndex;
            var index = elements[0].index;

            var xValue = chart.data.labels[index];
            var stackLabel = chart.data.datasets[datasetIndex].label;
            var stackValue = chart.data.datasets[datasetIndex].data[index];
            var yValue = stackValue;
            var bubbleLabel = stackValue.Label;
            var bubbleLabelX = stackValue.Label?.split('-')[0];
            var bubbleLabelY = stackValue.Label?.split('-')[1];
            var bubbleId = stackValue.Id;
            var bubbleX = stackValue.x;
            var bubbleY = stackValue.y;
            var bubbleSize = stackValue.r;

            chartValues = { xValue, yValue, stackLabel, stackValue, bubbleLabel, bubbleLabelX, bubbleLabelY, bubbleId,bubbleX, bubbleY,bubbleSize }
        }

        log(logType, 'chart clicked - chartValues:', chartValues)

        onClick(chartValues)

    }









    const createChartInstance = () => {
        // NB: rather not do this but allows callback functions to be passed in from c# controller for labels etc. (the functions can't be parsed to json)
        //Config is a string of the chart.js config object and is only coming from internal controller so limited security risk

        const func = new Function('chartJs', 'chartRef', 'onClick', 'moment', `return new chartJs(chartRef.current, ${config})`);
        console.log('function', func)
        const newChartInstance = func(chartJs, chartRef, handleClick, moment)//eslint-disable-line no-new-func
        return newChartInstance;
    }

    //div with height 100% is needed to stop chart.js from continually growing

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            {config &&
                <canvas id={id} ref={chartRef}></canvas>
            }
            {!config &&
                <div>
                    No data
                </div>

            }
        </div>

    )
}
export default Chart