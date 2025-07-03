import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const DonutChart = () => {
  useEffect(() => {
    const chartElement = document.querySelector('#donut-chart-dash');

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
        series: [44, 55, 41, 17],
        labels: ['Neurology', 'Dental Care', 'Gynecology', 'Orthopedic'],
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

      try {
        const donut = new ApexCharts(chartElement, donutChartOptions);
        donut.render();
      } catch (error) {
        console.error('Error rendering chart:', error);
      }
    } else {
      console.error('Chart element not found');
    }
  }, []);

  return <div id="donut-chart-dash"></div>;
};

export default DonutChart;
