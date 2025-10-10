// Run after DOM is ready
document.addEventListener("DOMContentLoaded", function () {

  // --- Sample Data ---
  const data = [
    { year: 2023, type: "Painting", count: 4 },
    { year: 2023, type: "Video Art", count: 2 },
    { year: 2024, type: "VR", count: 5 },
    { year: 2024, type: "Installation", count: 2 },
    { year: 2025, type: "Performance", count: 3 },
    { year: 2025, type: "VR", count: 4 },
    { year: 2026, type: "AI Art", count: 2 }
  ];

  // --- Dimensions ---
  const margin = { top: 40, right: 40, bottom: 60, left: 130 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // --- Create SVG inside the section ---
  const svg = d3.select("#vis-scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- Scales ---
  const x = d3.scaleLinear()
    .domain([2022, 2026]) // fixed range
    .range([0, width]);

  const types = [...new Set(data.map(d => d.type))];
  const y = d3.scalePoint()
    .domain(types)
    .range([height, 0])
    .padding(0.5);

  const r = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.count)])
    .range([5, 25]);

  // --- Axes ---
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .ticks(5) // show 2022, 2023, 2024, 2025, 2026
    );

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("dx", "-0.8em"); // move y labels left so they don't overlap the axis

  // --- Dots ---
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.type))
    .attr("r", d => r(d.count))
    .attr("fill", "#4682B4")
    .attr("opacity", 0.75);

  // --- Labels ---
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -100)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Type of Creative Work");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", "16px")
    .text("Creative Works by Year and Type");
});
