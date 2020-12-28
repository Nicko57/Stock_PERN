import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PieChart(props) {

    // var data = props.data;
    var width = 500
    var height = 500
    var margin = 100
    var radius = Math.min(width, height) / 2 - margin

    const ref = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');
                }, []);

    useEffect(() => {
        d3.select(ref.current).selectAll("*").remove()
        drawChart();
    }, [props.data]);

    const drawChart = () => {
        let data = props.data

        var svg = d3.select(ref.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

        // Create dummy data
        // var data = [{ticker:"A", current_total:1}, {ticker:"B", current_total:4}]

        // set the color scale
        var color = d3.scaleOrdinal()
            .domain(["A", "B"])
            .range(d3.schemeDark2);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            // .sort(null) // Do not sort group by size
            .value(function (d) { console.log(d.current_total); return d.current_total; })
        var data_ready = pie(data)
        console.log("data ready", data_ready)
        // The arc generator
        var arc = d3.arc()
            .innerRadius(radius * 0.5)         // This is the size of the donut hole
            .outerRadius(radius * 0.8)

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
            .innerRadius(radius * 1)
            .outerRadius(radius * 1)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
            .selectAll('allSlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) { return (color(d.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)

        // Add the polylines between chart and labels:
        svg
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function (d) {
                var posA = arc.centroid(d) // line insertion in the slice
                var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            })

        // Add the polylines between chart and labels:
        svg
            .selectAll('allLabels')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) { console.log("DATA", d); return d.data.ticker })
            .attr('transform', function (d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
    }

    return (
        <div className="piechart" style={{ padding: 10 }}>
            <svg ref={ref} >
            </svg>
        </div>
    );

}

export default PieChart;