document.addEventListener("DOMContentLoaded", function() {

  // --- Setup SVG ---
  const margin = { top: 80, right: 50, bottom: 80, left: 50 };
  const width =900 ;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#vis-timeline")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- Achievements data (2022-2025) ---
  const data = [
    { year: 2022, name: "CityU Top Entrance Scholarship", type: "Scholarship" },
    { year: 2022, name: "HKSAR Talent Development", type: "Scholarship" },
    { year: 2022, name: "Dean’s List", type: "Scholarship" },
    { year: 2023, name: "Dr. Peter Chung Yin Lee Memorial Fund", type: "Scholarship" },
    { year: 2023, name: "USFHK Women Tennis Bronze", type: "Sports" },
    { year: 2024, name: "CityU Scholarship", type: "Scholarship" },
    { year: 2024, name: "Animation Project Screening – Experimental Film Festival", type: "Exhibition" },
    { year: 2024, name: "Animation Project Screening – Montreal", type: "Exhibition" },
    { year: 2024, name: "Animation Project Screening – Lugano", type: "Exhibition" },
    { year: 2024, name: "Dr. Herman Hu Sports Awards", type: "Sports" },
    { year: 2024, name: "USFHK Women Tennis 1st Place", type: "Sports" },
    { year: 2025, name: "Beijing International Jewellery Exhibition", type: "Exhibition" }
  ];

  // --- X scale (years) ---
  const xScale = d3.scaleLinear()
    .domain([2022, 2025])
    .range([0, width]);

  // --- Timeline axis ---
  const yAxisPos = height / 2;
  svg.append("line")
    .attr("x1", xScale(2022))
    .attr("y1", yAxisPos)
    .attr("x2", xScale(2025))
    .attr("y2", yAxisPos)
    .attr("stroke", "#999")
    .attr("stroke-width", 2);

  // --- Color mapping ---
  const colorScale = d3.scaleOrdinal()
    .domain(["Scholarship", "Exhibition", "Sports"])
    .range(["#4682B4", "#87CEEB", "#FF8C00"]);

  // --- Group by year for stacking ---
  const yearMap = {};
  data.forEach(d => {
    if (!yearMap[d.year]) yearMap[d.year] = [];
    yearMap[d.year].push(d);
  });

  // --- Draw dots, labels, and connectors ---
  Object.keys(yearMap).forEach(year => {
    const items = yearMap[year];
    items.forEach((d, i) => {
      // Vertical positioning: alternate above/below, spacing grows with number of items per year
      const direction = i % 2 === 0 ? -1 : 1; // alternate up/down
      const level = Math.floor(i / 2);
      const spacing = 50; // bigger vertical spacing to avoid overlap
      const yPos = yAxisPos + direction * (spacing + level * spacing);

      // Dot on timeline
      svg.append("circle")
        .attr("cx", xScale(d.year))
        .attr("cy", yAxisPos)
        .attr("r", 6)
        .attr("fill", colorScale(d.type));

      // Connector line
      svg.append("line")
        .attr("x1", xScale(d.year))
        .attr("y1", yAxisPos)
        .attr("x2", xScale(d.year))
        .attr("y2", yPos)
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");

      // Label
      svg.append("text")
        .attr("x", xScale(d.year))
        .attr("y", yPos + (direction < 0 ? -5 : 12))
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#333")
        .text(d.name);
    });
  });

  // --- Year markers ---
  svg.selectAll("text.year")
    .data([2022,2023,2024,2025])
    .enter()
    .append("text")
    .attr("class", "year")
    .attr("x", d => xScale(d))
    .attr("y", yAxisPos + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "#333")
    .text(d => d);

});
