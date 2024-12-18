import ApexCharts from 'ApexCharts';
import { Candidats } from '../../data/data-candidats.js';

let ChartView = {

    render: function (sliderValue) {

        let data = Candidats.getPostBac();
        let data2 = Candidats.getType4();
        let combinedData = data.map(item => {
            let match = data2.find(d => d.codePostal === item.codePostal);
            return {
                codePostal: item.codePostal.slice(0, -3),
                count: item.count,
                generale: match ? match.generale : 0,
                sti2d: match ? match.sti2d : 0,
                autres: match ? match.autres : 0,
                total: item.count + (match ? match.generale + match.sti2d + match.autres : 0)
            };
        });
        let groupedData = { codePostal: "Autres", count: 0, generale: 0, sti2d: 0, autres: 0, total: 0 };
        combinedData = combinedData.map(item => {
            if (item.total < sliderValue) {
                groupedData.count += item.count;
                groupedData.generale += item.generale;
                groupedData.sti2d += item.sti2d;
                groupedData.autres += item.autres;
                groupedData.total += item.total;
                return null;
            }
            return item;
        }).filter(item => item !== null);

        if (groupedData.total > 0) {
            combinedData.push(groupedData);
        }
        combinedData.sort((a, b) => b.total - a.total);
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