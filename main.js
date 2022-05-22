/* CONSTANTS AND GLOBALS */
const margin = {
  top: 15,
  right: 25,
  bottom: 25,
  left: 75
};

const width = 1000 - margin.right - margin.left;
const height = 1000 - margin.top - margin.bottom;

/* LOAD DATA */
d3.csv('../Data/MoMAArtists.csv', d3.autoType)
  .then(MoMAArtists => {
    // console.log('MoMA artists', MoMAArtists)
  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
//                                                Gender treemap                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const noNullGender = MoMAArtists
                      .filter(function(d) {return d.Gender != null})
    
  const groupedByGender = d3.group(noNullGender, d => d.Gender)
    
  const hierarchyGroup = d3.hierarchy(groupedByGender)
                          .count(d => d.value)
                          .sort((a,b) => b.value - a.value)
 
  const treemap = d3.treemap()
                    .size([650, 400])
                    .round(true)


  const treemapRoot = treemap(hierarchyGroup)
    // console.log('treemapRoot.children', treemapRoot.children)

  // Color scale
  const treeMapcolorScale = d3.scaleOrdinal()
                              .domain(treemapRoot.children)
                              .range(["#D3D0CB","#E2C044","#587B7F"])  // color palette (middle three colors) https://coolors.co/palette/393e41-d3d0cb-e2c044-587b7f-1e2019

  // Color legend 
  const genderLegend = d3.legendColor()
                          .labels(["Male", "Female", "Non-Binary"])
                          .scale(treeMapcolorScale);
        
  const genderLegendSVG = d3.select("#gender-map-legend")
                              .append("svg")
                              .attr("width", "70%")
        
        genderLegendSVG.append("text")
        .text("Gender")
        .attr("x", 20)
        .attr("y", 20)

        genderLegendSVG.append("g")
                        .attr("class", "genderLegend")
                        .attr("transform", "translate(0,30)");
        
        genderLegendSVG.select(".genderLegend")
                        .call(genderLegend);

  // Non-binary legend
  const nonBinaryLabelSVG = d3.select("#nonBinary-label")
                              .append("svg")
                              .attr("width", "100%")
                              .attr("height", "100%")
          
        nonBinaryLabelSVG.append("g")
                        .attr("class", "nonBinary-label")
                        .attr("transform", "translate(0,335)");

        nonBinaryLabelSVG.select(".nonBinary-label")
                        .append("text")
                        .text("__Non-Binary 3")    
                        .style('font-size', 14)

  // Treemap SVG  
  const treemapChart = d3.select("#gender-map-chart")
                        .append("svg")
                        .attr("viewBox", `0 0 ${width*.73} ${height*0.4}`)
                        .attr("preserveAspectRatio", "xMidYMid meet")
                        .classed("gender-map", true)
                        // .attr("width", 650)
                        // .attr("height", 400)
                        .style("background-color", "#ffffff")


  const g = treemapChart.append('g')
                        .attr('class', 'treemap-container')

  const gender = g.selectAll('g.gender')
                .data(treemapRoot.children)
                .join('g')
                  .attr('class', 'gender')
                  .attr('transform', d => `translate(${ d.x0 },${ d.y0 })`)
                  .style('font-size', 14)
                // console.log('data[1]', treemapRoot.children)

        gender.append('rect')
              .attr('fill', d => treeMapcolorScale(d))
              .attr('stroke', 'white')
              .attr('opacity', 0.7)
              // the width is the right edge position - the left edge position
              .attr('width', d => d.x1 - d.x0)
              // same for height, but bottom - top
              .attr('height', d => d.y1 - d.y0)
              // make corners rounded
              .attr('rx', 3)
              .attr('ry', 3)

        gender.each((d, i, arr) => {
  
          // The current leaf element
          const current = arr[i]
          
          const left = d.x0,
                right = d.x1,
                // calculate its width from the data
                width = right - left,
                top = d.y0,
                bottom = d.y1,
                // calculate its height from the data
                height = d.y1 - d.y0
      
          // too small to show text
          const tooSmall = width < 34 || height < 25
          
          // and append the text (you saw something similar with the pie chart (day 6)
          const text = d3.select( current ).append('text')
              // If it's too small, don't show the text
            .attr('opacity', tooSmall ? 0 : 0.9)
            .selectAll('tspan')
            .data(d => [ d.data[0], d.value.toLocaleString() ])
            .join('tspan')
              .attr('x', 3)
              .attr('y', (d,i) => i ? '2.5em' : '1.15em')
              .text(d => d)
          })

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                                                    //
  //                                                   Bubble chart                                                     //
  //                                                                                                                    //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**********************************/
        /*****           Data         *****/
        /**********************************/

        const noNullNation = MoMAArtists
        .filter(function(d) {return d.Nationality != null })
        .filter(function(d) {return d.Nationality != "Nationality unknown"})
        // console.log('No Null Nation', noNullNation)
      
  
        // https://observablehq.com/@d3/d3-groupsort -- d3.groupSort
        const sortedNationality = d3.flatRollup(noNullNation, v => v.length, d => d.Continent, d => d.Nationality)
                                    .sort(([,,a],[,,b]) => d3.descending(a,b))
                                    .map(([ continent, nationality, value]) => ({ ["continent"]: continent, ["nationality"]: nationality, ["value"]:value }))
        console.log('sortedNationality', sortedNationality)
  
        /**********************************/
        /*****          Scales        *****/
        /**********************************/

        const bubbleColor = d3.scaleOrdinal()
        .domain(["Africa", "Americas", "Asia", "Europe", "Oceania"])
        // color palette https://coolors.co/palette/f6bd60-f7ede2-f5cac3-84a59d-f28482
        .range(["#F6BD60","#F5CAC3","#F28482","#84A59D","#F7EDE2"]);


        const bubbleSize = d3.scaleLinear()
                      .domain([0, 5000])
                      .range([10,200])  // circle will be between 2 and 300 px wide

        /**********************************/
        /*****         Legends        *****/
        /**********************************/

        const bubbleColorLegend = d3.legendColor()
                                    .labelFormat(d3.format(".2f"))
                                    .scale(bubbleColor);
        
        const bubbleColorLegendSVG = d3.select("#bubble-chart-legend")
                                      .append("svg")
                                      .attr("width", "100%")
                                      // .attr("height", "100%")
                                      
              bubbleColorLegendSVG.append("text")
                                  .text("Continent")
                                  .attr("x", 20)
                                  .attr("y", 20)


        bubbleColorLegendSVG.append("g")
          .attr("class", "bubbleLegend")
          .attr("transform", "translate(0,30)");
        
        bubbleColorLegendSVG.select(".bubbleLegend")
          .call(bubbleColorLegend);
  
        /**********************************/
        /*****         Chart          *****/
        /**********************************/
        
        const bubbleChart = d3.select("#bubble-chart")
                            .append("svg")
                            .attr("viewBox", `0 0 ${width*0.8} ${height*0.8}`)
                            .attr("preserveAspectRatio", "xMidYMid meet")
                            // .attr("width", width * 0.8)
                            // .attr("height", height * 0.8)
                            .classed("bubble", true)
                            .style("border-style", "solid")
                            .style("border-width", 0)
  
        // https://d3-graph-gallery.com/graph/circularpacking_template.html
  
         
        // create a tooltip
        const Tooltip = d3.select("#bubble-tooltip")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "transparent")
        .style("padding", "5px")

  
      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = function(event, d) {
        Tooltip
          .style("opacity", 1)
          .style("background-color", bubbleColor(d.continent))
      }
      const mousemove = function(bubbleEvent, d) {
        Tooltip
          .html('<p class="bordered">' + d.value + " " + d.nationality + " " + "artists" + '</p>')
      }
      
      var mouseleave = function(event, d) {
        Tooltip
          .style("opacity", 0)
      }
  
        const bubbleNode = bubbleChart.append("g")
          .selectAll("circle")
          .data(sortedNationality)
          .join("circle")
          .attr("class", "bubbleNode")
          .attr("r", d => bubbleSize(d.value))
          .attr("cx", width / 2)
          .attr("cy", height /2)
          .style("fill", d => bubbleColor(d.continent))
          .style("fill-opacity", 0.6)
          .attr("stroke", "#4A4E69")
          .style("stroke-width", 1)
          .on("mouseover", mouseover) // What to do when hovered
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
          console.log("sortedNationality", sortedNationality)
  
     // Features of the forces applied to the bubbleNodes:
     const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width * 0.4).y(height * 0.4)) // Attraction to the center of the svg area
        // .force("charge", d3.forceManyBody().strength(.1)) // bubbleNodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (bubbleSize(d.value)+3) }).iterations(1)) // Force that avoids circle overlapping
  
    // Apply these forces to the bubbleNodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
      .nodes(sortedNationality)
      .on("tick", function(d){
        bubbleNode
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
      }
      );      


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                                                    //
  //                                                  Circle pack                                                       //
  //                                                                                                                    //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const topNations = MoMAArtists
    // Filter out null Gender and below top 10 nations
    .filter(function(d) { return  d.Nationality == "American" || d.Nationality == "German" || d.Nationality == "British" || d.Nationality == "French" || d.Nationality == "Italian" || d.Nationality == "Japanese" || d.Nationality == "Swiss" || d.Nationality == "Canadian" || d.Nationality == "Dutch" || d.Nationality == "Austrian"})
    .filter(function(d) { return d.Gender != null })

    const topNationHierarchy = d3.hierarchy(d3.rollup(topNations, v => v.length, d => d.Nationality, d => d.Gender, d => d.FirstName))
                            .sum(d => d[1])
                            .sort((a,b) => d3.descending(a.value, b.value))
 
    // https://observablehq.com/d/c3866becb48941a8
    // https://observablehq.com/@didoesdigital/d3-circle-packing-with-data-wrangling-and-interactive-grou

    
    const bubbleColorRegion = d3.scaleOrdinal()
                      .domain(["American", "German", "British", "French", "Italian", "Japanese", "Swiss", "Canadian", "Dutch", "Austrian"])
                      .range(["#F5CAC3", "#84A59D", "#84A59D", "#84A59D", "#84A59D", "#F28482", "#84A59D", "#F5CAC3", "#84A59D", "#84A59D"])

    const bubbleColorGender = d3.scaleOrdinal()
                      .domain(["Male", "Female", "Non-Binary"])
                      .range(["#D3D0CB","#E2C044","#587B7F"])

    const cpGenderLengendSVG = d3.select("#circle-pack-legend")
                              .append("svg")
                              .classed("cpGenderLengendSVG", true)
                              .attr("width", 120)
                              .attr("height", 100)

          cpGenderLengendSVG.append("text")
                            .text("Gender")
                            .attr("x", 20)
                            .attr("y", 20)

          cpGenderLengendSVG.append("g")
                        .attr("class", "cpGenderLengend")
                        .attr("transform", "translate(0,30)");
        
          cpGenderLengendSVG.select(".cpGenderLengend")
                        .call(genderLegend);

    const continentScale = d3.scaleOrdinal()
                        .domain(["Americas", "Asia", "Europe"])
                        .range(["#F5CAC3", "#F28482", "#84A59D"])
  
    
    const cpRegionLegend = d3.legendColor()
                        .labelFormat(d3.format(".2f"))
                        .scale(continentScale);

    const cpRegionLegendSVG = d3.select("#circle-pack-legend")
                        .append("svg")
                        .classed("cpRegionLegendSVG", true)
                        .attr("width", 120)
                        // .style("margin-top", 50)


          cpRegionLegendSVG.append("text")
                        .text("Continent")
                        .attr("x", 20)
                        .attr("y", 20)

          cpRegionLegendSVG.append("g")
                          .attr("class", "cpRegionLegend")
                          .attr("transform", "translate(0,30)");

          cpRegionLegendSVG.select(".cpRegionLegend")
                            .call(cpRegionLegend);

    packedData = d3.pack()
    .size([width, height])
    .padding(4)
    
    const circlePackRoot = packedData(topNationHierarchy);
    let focus = circlePackRoot;
    let view;

   const circlePack = d3.select("#circle-pack-chart")
    .append("svg")
    .attr("viewBox", `-${width/2} -${height/2} ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .classed("circle-pack", true)
    .style("padding", "0,0")
    .style("cursor", "pointer")
    .style("border-width",0)
    .style("border-style", "solid")
    .on("click", (event) => zoom(event, circlePackRoot));

    const circleNode = circlePack.append("g")
      .selectAll("circle")
      .data(circlePackRoot.descendants().slice(1))
      .join("circle")
      .attr("class", "circleNode")
      // .style("fill", "transparent")
      .style("stroke-width", function(d) {
        if (d.depth == 1) {
          return 3
        } else if (d.depth == 2) {
          return 1
        }else {
          return 1
        }
      })
      // .style("stroke", "#C5C3C6")
      .style("stroke", function(d) {
        if (d.depth == 1) {
          return bubbleColorRegion(d.data[0])
        } else if (d.depth == 2) {
          return "white"
        }else {
          return "white"
        }
      })
      .style("fill", function(d) {
        if (d.depth == 1) {
          return "white"
        } else if (d.depth == 2) {
          return bubbleColorGender(d.data[0])
        }
        else {
          return "white"
        }
      })
      .attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function() { d3.select(this).attr("stroke", null); })
      .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

      const label = circlePack.append("g")
      .style("font", "18px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(circlePackRoot.descendants())
    .join("text")
      .style("fill-opacity", d => d.parent === circlePackRoot ? 1 : 0)
      .style("display", d => d.parent === circlePackRoot ? "inline" : "none")
      .text(d => d.data[0]);


      zoomTo([circlePackRoot.x, circlePackRoot.y, circlePackRoot.r * 2]);

      function zoomTo(v) {
        const k = width / v[2];
    
        view = v;
        console.log("v", view)
        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        circleNode.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        circleNode.attr("r", d => d.r * k);
      }
    
      function zoom(event, d) {
        const focus0 = focus;
    
        focus = d;
    
        const transition = circlePack.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
              const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
              return t => zoomTo(i(t));
            })
          
        label
              .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
              .transition(transition)
                .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }
  })


