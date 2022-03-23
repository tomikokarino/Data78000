// https://stackoverflow.com/questions/67382950/use-d3-stratify-to-transform-flat-data-to-hierarchy-data
// https://observablehq.com/@xuanry-1839230/tree-map -- color scale 


/* CONSTANTS AND GLOBALS */
const margin = {
  top: 15,
  right: 25,
  bottom: 25,
  left: 75
};
const width = 750 - margin.right - margin.left;
const height = 600 - margin.top - margin.bottom;

/* LOAD DATA */
d3.csv('../Data/squirrelActivities.csv', d3.autoType)
  .then(squirrelActivities => {
    console.log(squirrelActivities)
    const svg = d3.select("#container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", "#ffffff")
      .style("margin-top", "20px")
      
  const stratify = d3.stratify()
    .id(d => d.activity)
    .parentId(d => d.parent)
 
  const map = d3.treemap()
  .tile(d3.treemapSquarify)
  .size([width,height])
  .padding(1)
  (stratify(squirrelActivities)
    .sum(d => d.count)
    .sort((a,b) => b.count - a.count)
  );


  const colorScale = d3
  .scaleOrdinal()
  .domain(squirrelActivities.map(d => {
    if (!d.parent) return "#fff";
    if(d.parent) return { key: d.activity, value: d.count };
    }) .sort((a,b)=> b.values - a.value).map(d => d.key))
  .range(d3.schemePastel1);

  

  const node = svg.selectAll("g")
    .data(d3.group(map, d => d.activity))
    .join("g")
    .selectAll("g")
    .data(d => d[1])
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    

  node.append("rect")
    .attr("fill", d => colorScale(d))
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);
  
  node.append("text")
  .text(d => d.data.activity)
  .style("font-family", "arial")
  .style("fill", "#333")
  .attr("transform", d => `translate(5,20)`)



  })