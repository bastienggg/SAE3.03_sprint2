import ApexCharts from 'ApexCharts';
import { Candidats } from "./../../data/data-candidats";

let ChartView = {

    render: function () {
        let data = Candidats.getPostBac();
        let data2 = Candidats.getType4();

        let combinedData = data.map(item => {
            let match = data2.find(d => d.codePostal === item.codePostal);
            return {
                codePostal: item.codePostal.slice(0, -3), // Remove the last 3 characters
                count: item.count,
                generale: match ? match.generale : 0,
                sti2d: match ? match.sti2d : 0,
                autres: match ? match.autres : 0
            };
        });

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