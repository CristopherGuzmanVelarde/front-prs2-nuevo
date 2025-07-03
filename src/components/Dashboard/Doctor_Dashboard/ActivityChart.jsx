import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const ActivityChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartElement = chartRef.current;

    if (chartElement) {
      const sColStackedOptions = {
        chart: {
          height: 230,
          type: 'bar',
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 6,
          colors: ['transparent'],
        },
        series: [
          {
            name: 'Low',
            color: '#D5D7ED',
            data: [20, 30, 41, 67, 22, 43, 40, 10, 30, 20, 40, 40],
          },
          {
            name: 'High',
            color: '#2E37A4',
            data: [13, 23, 20, 8, 13, 27, 30, 25, 10, 15, 20, 20],
          },
        ],
        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
        },
      };

      const chart = new ApexCharts(chartElement, sColStackedOptions);

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

  return <div id="activity-chart" ref={chartRef}></div>;
};

export default ActivityChart;
