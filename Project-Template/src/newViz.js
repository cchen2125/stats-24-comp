import React, { Component } from 'react';
import { getJSON } from './utils/stats';
import { select, selectAll, mouse} from 'd3-selection';
import { map, format } from 'd3';
import { stack } from 'd3-shape';
import { scaleOrdinal, scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3';

// TODO: Import libraries needed and set up d3 here
const d3 = {
    select,
    selectAll,
    mouse,
    map,
    format,
    stack,
    scaleOrdinal,
    scaleBand,
    scaleLinear,
    axisBottom,
    axisLeft,
    max
}

class NewViz extends Component {

    // TODO: load the data here

    // TODO: set up the D3 here

    async componentDidMount() {
        // this runs the first time the component loads
        const dataURL = 'data/love_language_gender.json';
        try {
            const data = await getJSON(dataURL);
            this.setState({ data });
          } catch (e) {
            console.error(e);
          }
    }

    componentDidUpdate() {
        // this runs every time the component is updated

        var data = this.state.data

        var subgroups = Object.keys(data.women)
        var abbreviations = {
            "Quality Time": "QT",
            "Physical Touch": "PT",
            "Acts of Service": "AoS",
            "Words of Affirmation": "WoA",
            "Gifts": "G"

        }
        
        

        var stackedData = d3.stack().keys(subgroups)(Object.values(data))

        var margin = {top: 30, right: 30, bottom: 30, left: 120};
        var parentWidth = d3.select('#love-lang-barplot').node().getBoundingClientRect().width
        var parentHeight = d3.select('#love-lang-barplot').node().getBoundingClientRect().height
        var width = 0.9*parentWidth - margin.right - margin.left
        var height = 0.9*parentHeight - margin.top - margin.bottom;

        var svg = d3.select('#love-lang-barplot')
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr('transform', `translate (${margin.left}, ${margin.top})`)

        // tooltip
        var tooltip = d3.select('#love-lang-barplot')
            .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('width', '200px')
            .style('position', 'relative')
            .style('border-width', '2px')
            .style('border-radius', '1px')
            .style('font-size', '12px')
            .style('text-align', 'center')
            .style('left', '0px')
            .style('top', '0px');

        // Scales
        const y = d3.scaleBand()
                    .domain(Object.keys(data))
                    .range([0, height])
                    .paddingInner(0.2);

        const x = d3.scaleLinear()
                    .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
                    .nice()
                    .range([0, width]);

        // Colors
        const color = d3.scaleOrdinal()
                        .domain(subgroups)
                        .range(['#80122e','#aa193d','#e3426a','#e96d8c','#ef97ad']);

        // Bars
        svg.append("g")
           .selectAll("g")
           .data(stackedData)
           .join("g")
           .attr("fill", d => color(d.key))
           .selectAll("rect")
           .data(d => d)
           .join("rect")
           .attr("x", d => x(d[0]))
           .attr("y", (d, i) => y(Object.keys(data)[i]))
           .attr("width", d => x(d[1]) - x(d[0]))
           .attr("height", y.bandwidth())
           .on('mouseover', function(d, i) {
                var innerHTML = '<p><b>' + d3.format(".0%")(d[1]- d[0]) + "</b> of " + Object.keys(data)[i] + ' indicated <b>' + d3.select(this.parentNode).datum().key +'</b> as their love language' + '</p>'
                tooltip.style('opacity', 1)
                    .html(innerHTML)
                    .style("left", d3.mouse(this)[0] + "px")
                    .style("top", (d3.mouse(this)[1] - height - margin.top) +"px")

                d3.select(this).attr("opacity", 0.7)
           })
           .on('mouseout', function(d, i) {
                tooltip.style('opacity', 0)
                d3.select(this).attr("opacity", 1)
           })

        svg.selectAll("text.label")
           .data(stackedData)
           .join("g")
           .selectAll("text.label")
           .data(d=> d)
           .join("text")
           .attr("class", "label")
           .attr("y", (d, i) => y(Object.keys(data)[i]) + y.bandwidth() / 2 - 5)
           .attr("x", d => x(d[1]) + (x(d[0]) - x(d[1])) / 2)
           .attr("text-anchor", "middle")
           .attr("fill", "white")
           .attr("font-size", 18)
           .text(function (d) {
            var key = abbreviations[d3.select(this.parentNode).datum().key];
            return key;
          });

        svg.selectAll("text.value")
          .data(stackedData)
          .join("g")
          .selectAll("text.value")
          .data(d=> d)
          .join("text")
          .attr("class", "value")
          .attr("y", (d, i) => y(Object.keys(this.state.data)[i]) + y.bandwidth() / 2 + 15)
          .attr("x", d => x(d[1]) + (x(d[0]) - x(d[1])) / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", 14)
          .text(d => d3.format(".0%")(d[1]- d[0]));


        // Axes
        const yAxis = d3.axisLeft(y);

        svg.append("g")
            .style('font-family', 'Cousine')
            .style('font-size', 16)
           .call(yAxis);
        
    }

    render() {
        return (
            <div className="visualization-container">
                <h3 style={{textAlign: "center"}}>Love Language by Gender</h3>
                <div id="love-lang-barplot" style={{height: "60vh"}}></div>
            </div>
        )
    }

}

export default NewViz;