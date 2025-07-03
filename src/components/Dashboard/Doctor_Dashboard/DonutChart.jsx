import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const RadialPatientsChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartElement = chartRef.current;

    if (chartElement) {
      const donutChartOptions = {
        chart: {
          height: 290,
          type: 'donut',
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        series: [44, 55],
        labels: ['Male', 'Female'],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
        legend: {
          position: 'bottom',
        },
      };

      const donut = new ApexCharts(chartElement, donutChartOptions);

      try {
        donut.render();
      } catch (error) {
        console.error('Error rendering chart:', error);
      }

      return () => {
        donut.destroy();
      };
    }
  }, []);

  return <div id="radial-patients" ref={chartRef}></div>;
};

export default RadialPatientsChart;
