// --- Setup dimensions and margins ---
const margin = {top: 40, right: 30, bottom: 60, left: 120};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// --- Append SVG inside <section id="vis-bar"> ---
const svgBar = d3.select("#vis-bar")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// --- Data: proficiency (0–100%) ---
const dataBar = [
  {software: "UE5", score: 85},
  {software: "Unity", score: 75},
  {software: "Blender", score: 90},
  {software: "Spyder", score: 60},
  {software: "Figma", score: 80}
];

// --- Scales ---
const yBar = d3.scaleBand()
  .domain(dataBar.map(d => d.software))
  .range([0, height])
  .padding(0.2);

const xBar = d3.scaleLinear()
  .domain([0, 100])
  .range([0, width]);

// --- Axes ---
svgBar.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xBar).ticks(5).tickFormat(d => d + "%"));

svgBar.append("g")
  .call(d3.axisLeft(yBar));

// --- Bars ---
svgBar.selectAll("rect")
  .data(dataBar)
  .enter()
  .append("rect")
  .attr("y", d => yBar(d.software))
  .attr("x", 0)
  .attr("height", yBar.bandwidth())
  .attr("width", d => xBar(d.score))
  .attr("fill", "steelblue")
  .style("opacity", 0.8);

// --- Labels (numbers at end of bars) ---
svgBar.selectAll("text.label")
  .data(dataBar)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", d => xBar(d.score) + 5)
  .attr("y", d => yBar(d.software) + yBar.bandwidth() / 1.6)
  .text(d => d.score + "%")
  .style("font-size", "12px")
  .style("fill", "#333");

// --- X-axis annotation (Skill Proficiency %) ---
svgBar.append("text")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height + 40)
  .text("Skill Proficiency (%)")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .style("fill", "#333");
  
// --- Y-axis annotation (Software) ---
svgBar.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", `rotate(-90)`)
  .attr("x", -height / 2)
  .attr("y", -80)
  .text("Software")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .style("fill", "#333");
