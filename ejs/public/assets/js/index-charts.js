'use strict';

window.chartColors = {
  green: '#75c181',
  gray: '#a9b5c9',
  text: '#252930',
  border: '#e7e9ed'
};

// Line Chart Configuration
var lineChartConfig = {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Weekly Sales',
      fill: false,
      backgroundColor: window.chartColors.green,
      borderColor: window.chartColors.green,
      data: salesData,
    }]
  },
  options: {
    responsive: true,
    aspectRatio: 1.5,
    legend: {
      display: true,
      position: 'bottom',
      align: 'end',
    },
    title: {
      display: true,
      text: 'Weekly Sales',
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      titleMarginBottom: 10,
      bodySpacing: 10,
      xPadding: 16,
      yPadding: 16,
      borderColor: window.chartColors.border,
      borderWidth: 1,
      backgroundColor: '#fff',
      bodyFontColor: window.chartColors.text,
      titleFontColor: window.chartColors.text,
      callbacks: {
        label: function(tooltipItem, data) {
          return '$' + tooltipItem.value.toLocaleString();
        }
      },
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          drawBorder: false,
          color: window.chartColors.border,
        },
      }],
      yAxes: [{
        display: true,
        gridLines: {
          drawBorder: false,
          color: window.chartColors.border,
        },
        ticks: {
          beginAtZero: true,
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
      }]
    }
  }
};

// Bar Chart Configuration
var barChartConfig = {
  type: 'bar',
  data: {
    labels: categories,
    datasets: [{
      label: 'Orders',
      backgroundColor: window.chartColors.green,
      borderColor: window.chartColors.green,
      borderWidth: 1,
      maxBarThickness: 16,
      data: orderCounts,
    }]
  },
  options: {
    responsive: true,
    aspectRatio: 1.5,
    legend: {
      position: 'bottom',
      align: 'end',
    },
    title: {
      display: true,
      text: 'Orders by Category',
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      titleMarginBottom: 10,
      bodySpacing: 10,
      xPadding: 16,
      yPadding: 16,
      borderColor: window.chartColors.border,
      borderWidth: 1,
      backgroundColor: '#fff',
      bodyFontColor: window.chartColors.text,
      titleFontColor: window.chartColors.text,
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          drawBorder: false,
          color: window.chartColors.border,
        },
      }],
      yAxes: [{
        display: true,
        gridLines: {
          drawBorder: false,
          color: window.chartColors.border,
        },
        ticks: {
          beginAtZero: true,
        },
      }]
    }
  }
};

// Generate charts on load
window.addEventListener('load', function() {
  var lineChart = document.getElementById('canvas-linechart').getContext('2d');
  window.myLine = new Chart(lineChart, lineChartConfig);

  var barChart = document.getElementById('canvas-barchart').getContext('2d');
  window.myBar = new Chart(barChart, barChartConfig);
});