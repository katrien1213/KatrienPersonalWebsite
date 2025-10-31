function createVisitorMap({
  svgSelector = "#visitor-map",
  initialVisitors = 30,
  updateInterval = 2000
} = {}) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select(svgSelector)
    .attr("width", width)
    .attr("height", height);

  const projection = d3.geoNaturalEarth1()
    .scale(Math.min(width, height) / 2.1) // bigger scale to include all land/ocean
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Color settings
  const oceanColor = "#a6cee3";
  const landColor = "#c4da92ff";
  const borderColor = "#ffffff";
  const visitorColor = "#ff5722";

  // Random visitor generator
  function generateRandomVisitors(n = initialVisitors) {
    return Array.from({length: n}, () => ({
      id: Math.random().toString(36).substring(7),
      coords: [Math.random() * 360 - 180, Math.random() * 180 - 90],
      size: Math.random() * 6 + 3  // radius 3-9
    }));
  }

  // Load world GeoJSON
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(worldData => {
      // Draw ocean background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", oceanColor);

      // Draw land
      svg.append("g")
        .selectAll("path")
        .data(worldData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", landColor)
        .attr("stroke", borderColor)
        .attr("stroke-width", 0.5);

      let visitors = generateRandomVisitors();

      const visitorGroup = svg.append("g").attr("class", "visitors");

      function updateVisitors() {
        visitors = generateRandomVisitors();

        const circles = visitorGroup.selectAll("circle").data(visitors, d => d.id);

        // Remove old
        circles.exit()
          .transition().duration(1000)
          .attr("opacity", 0)
          .remove();

        // Add new visitors
        circles.enter()
          .append("circle")
          .attr("cx", d => projection(d.coords)[0])
          .attr("cy", d => projection(d.coords)[1])
          .attr("r", 0)
          .attr("fill", visitorColor)
          .attr("opacity", 0.8)
          .transition()
          .duration(1000)
          .attr("r", d => d.size);
      }

      // Initial render
      updateVisitors();

      // Update periodically
      setInterval(updateVisitors, updateInterval);
    });

  // Responsive scaling
  window.addEventListener("resize", () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    svg.attr("width", newWidth).attr("height", newHeight);

    projection.scale(Math.min(newWidth, newHeight) / 2.1)
              .translate([newWidth / 2, newHeight / 2]);

    svg.selectAll("rect").attr("width", newWidth).attr("height", newHeight);
    svg.selectAll("path").attr("d", path);
    svg.selectAll("circle")
       .attr("cx", d => projection(d.coords)[0])
       .attr("cy", d => projection(d.coords)[1]);
  });
}

// --- Call the function ---
createVisitorMap({
  svgSelector: "#visitor-map",
  initialVisitors: 40,
  updateInterval: 2000
});
