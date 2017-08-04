///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// World Map
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// The data are loaded in the main .Rmd file under the var name world.
// This script has to be loaded in the main file.
// dataWorld : imports and tariffs statistics

var margin = { top: 50, left: 50, right: 50, bottom: 50 };
var rescale = 1.25;
var height = 480  * rescale - margin.top - margin.bottom; //480
var width = 960 * rescale - margin.left - margin.right; // 960
var maxValue = 2300;
var formatNumber = d3.format(".4f"), formatMap = function(d) { 
      return formatNumber(d); 
    };
var active = d3.select(null);
    
var div = d3.select('#worldMapInteractive').append('div')
    .attr('class', 'tooltip')
    .style("fill", "transparent")
    .style('opacity', 0);

var svg = d3.select("#worldMapInteractive").append("svg")
    .attr('id', 'worldMapInteractiveSvg')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);

var rect = svg.append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("class", "background")
    .style("fill", "transparent")
    .style('opacity', 0);      

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var projection = d3.geoEquirectangular()
  .scale(width / 2 / Math.PI)
  //.scale(100)
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);
    
var countries = world.features;

var radius = d3.scaleSqrt()
    .domain([0, maxValue])
    .range([0, 40]);

var legendTitleText = ['Size: Amount of imports in US$ billion - Color: Average applied tariffs in %'];
var legendRectText = ["  n/a ", " 0<2 ", " 2<4 ", " 4<6 ", " 6<8 ", " 8<10", "10<15", "15<20", " 20< "];
var legendRectColor = ["#DEE0DE","#F7FCF5", "#E5F5E0", "#C7E9C0", "#A1D99B", "#74C476", "#41AB5D", "#238B45", "#005A32"];

var legendCircleSize = svg.append("g")
    .attr("class", "legendMap")
  .selectAll("g")
    .data([100, 500, 1000])
  .enter().append("g");
  
var legendCountryColor = svg.append('g')
  .attr("class", "legendMap")
  .selectAll("g")
    .data(legendRectColor)
  .enter().append('g');

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

// Draw Background 
g.append("path")
  .attr("d", path(world))
  .style("filter", "url(#drop-shadow)");

rect.on("click", reset);

// Draw countries 
g.selectAll(".country")
  .data(countries)
  .enter().append("path")
  .attr("class", "country")
  .attr("d", path)
  .attr("fill", function(d) {
    return d.properties.color;
  })
  .style("stroke", "#b3cde3")
  .style("stroke-linejoin", "round")
  .style("stroke-linecap", "round")
  .on("click", function(d){
    console.log(d);
  });

// Draw bubbles 
g.selectAll(".bubble")
  .data(countries
      .sort(function(a, b) { 
        return b.properties.value - a.properties.value; 
      })
  )
  .enter().append("circle")
  .attr("class", "bubble")
  .attr("transform", function(d) {
    if (d.properties.iso === 'USA') {
      return "translate(" + path.centroid(d) + ")" + "translate(25, 10)";
    } else {
      return "translate(" + path.centroid(d) + ")";
    }
  })
  .attr("r", function(d) {
    return radius(d.properties.value);
  })
  .style("fill", "brown")
  .style("opacity", 0.5)
  .style("stroke", "#b3cde3")
  .style("stroke-width", "0.5px")
  .on("click", function(d){
    console.log(d);
  })
  .on('mouseover', function(d) {      
    div.transition()        
    .duration(0)      
    .style('opacity', 1);      
    div.html('<b><font size = "3">' + d.properties.name + '</font></b>' + '<br/>' +'Imports: $' + formatMap(d.properties.value) + ' bn' + '<br/>' + 'Average Tariffs: ' + d.properties.tariffs + '%' + '<br/>' + 'Binding Coverage: ' + d.properties.binding + '%' + '<br/>' + 'Average Bound Tariffs: ' + d.properties.bound + '%')
    .style('left', (d3.event.pageX - 10) + 'px')       //Tooltip positioning, edit CSS
    .style('top', (d3.event.pageY - 100) + 'px'); //Tooltip positioning, edit CSS
    })
  .on('mousemove', function(d) {      
    div.html('<b><font size = "3">' + d.properties.name + '</font></b>' + '<br/>' +'Imports: $' + formatMap(d.properties.value) + ' bn' + '<br/>' + 'Average Tariffs: ' + d.properties.tariffs + '%' + '<br/>' + 'Binding Coverage: ' + d.properties.binding + '%' + '<br/>' + 'Average Bound Tariffs: ' + d.properties.bound + '%')
    .style('left', (d3.event.pageX + 10) + 'px')       //Tooltip positioning, edit CSS
    .style('top', (d3.event.pageY - 100) + 'px'); //Tooltip positioning, edit CSS
    })  
  .on('mouseout', function(d) {       
    div.transition()        
    .duration(500)      
    .style('opacity', 0);
  });

// Draw Legend
legendCircleSize.append("circle")
    .attr("transform", "translate(" + 40 + "," + (height + margin.top + margin.bottom - 10) + ")")
    .attr("cy", function(d) { return -radius(d); })
    .attr("r", radius)
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-width", "1.5px");

var legendCircleSizeText = legendCircleSize.append("text")
    .attr("transform", "translate(" + 40 + "," + (height + margin.top + margin.bottom - 10) + ")")
    .attr("y", function(d) { return -2.2 * radius(d); })
    .attr("dy", "1.3em")
    .text(d3.format(""))
    .style("fill", "#666666")
    .style("font-family", "calibri")
    .style("font", "9px sans-serif")
    .style("text-anchor", "middle");

legendCountryColor.append('rect')
  .attr('transform', function(d, i) { return 'translate(' + i * 36 + ', 0)'; })
  .attr('x', 80)
  .attr('y', height + margin.top + margin.bottom - 40)
  .attr('width', 36)
  .attr('height', 10)
  .style('fill', function(d) { return d; });
  
legendCountryColor.append('text')
  .attr('transform', function(d, i) { return 'translate(' + i * 36 + ', 0)'; })
  .attr('x', 98)
  .attr('y', height + margin.top + margin.bottom - 48)
  .attr('dy', '.35em')
  .style('text-anchor', 'middle')
  .style('fill', '#666666')
  .style('font', '9px sans-serif')
  .style('font-family', 'calibri')
  .text(function(d, i) { return legendRectText[i]; });
  
legendCountryColor.append('text')
  .attr('x', 80)
  .attr('y', height + margin.top + margin.bottom - 10)
  .style('text-anchor', 'start')
  .style('fill', '#666666')
  .style('font', '11px sans-serif')
  .style('font-family', 'calibri')
  .text(legendTitleText);

// Zoom behavior 
svg.call(zoom);

function zoomed() {
  var transform = d3.event.transform; 
  g.style("stroke-width", 1.5 / transform.k + "px");
  g.attr("transform", transform);
  
  legendCircleSizeText.transition()
    .text(function(d) { return d3.format(".0f")(d / Math.pow(transform.k, 2)); });
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      //.call( zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top) ); // Normally
      .call( zoom.transform, d3.zoomIdentity.translate(margin.left / 2, margin.top / 2) ); // Presentation Slide
}

// Drop Shadow 
var filter = svg.append("defs")
  .append("filter")
  .attr("id", "drop-shadow")
  .attr("height", "110%");
  
filter.append("feGaussianBlur")
  .attr("in", "SourceAlpha")
  .attr("stdDeviation", 1)
  .attr("result", "blur");

filter.append("feOffset")
  .attr("in", "blur")
  .attr("dx", 1)
  .attr("dy", 1)
  .attr("result", "offsetBlur");

var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
  .attr("in", "offsetBlur");
    
feMerge.append("feMergeNode")
  .attr("in", "SourceGraphic");