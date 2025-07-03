import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const MarketAreaChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartElement = chartRef.current;

    if (chartElement) {
      const options = {
        chart: {
          height: 200,
          type: 'line',
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        series: [
          {
            name: 'Market Data',
            color: '#2E37A4',
            data: [45, 60, 75, 51, 42, 42, 30],
          },
        ],
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        },
      };

      const chart = new ApexCharts(chartElement, options);
      
      try {
        chart.render();
      } catch (error) {
        console.error('Error rendering chart:', error);
      }

      return () => {
        chart.destroy();
      };
    }
  }, []);

  return <div id="market-area" ref={chartRef}></div>;
};

export default MarketAreaChart;
