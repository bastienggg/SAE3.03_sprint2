import ApexCharts from 'ApexCharts';

let ChartView = {

    render: function (combinedData) {
        let categories = combinedData.map(item => item.codePostal);
        let series = [
            {
                name: 'Post Bac',
                data: combinedData.map(item => item.count)
            },
            {
                name: 'Generale',
                data: combinedData.map(item => item.generale)
            },
            {
                name: 'STI2D',
                data: combinedData.map(item => item.sti2d)
            },
            {
                name: 'Autres',
                data: combinedData.map(item => item.autres)
            }
        ];

        var options = {
            series: series,
            chart: {
                type: 'bar',
                height: 600,
                stacked: true,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                },
            },
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            title: {
                text: 'Candidats Data'
            },
            xaxis: {
                categories: categories,
                labels: {
                    formatter: function (val) {
                        return val;
                    }
                }
            },
            yaxis: {
                title: {
                    text: undefined
                },
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val;
                    }
                }
            },
            fill: {
                opacity: 1
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40
            }
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();

    }

}

export { ChartView };