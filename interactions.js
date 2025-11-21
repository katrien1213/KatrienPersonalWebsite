function createInteractiveMap(containerId) {
  const container = d3.select(containerId);
  if (container.empty()) return;

  // 1. DYNAMIC DIMENSIONS (Crucial for Vertical Layout)
  // We get the actual width/height of the CSS container
  const element = document.querySelector(containerId);
  const width = element.clientWidth;
  const height = element.clientHeight;

  container.html(""); // Clear previous

  // 2. SVG SETUP
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#e0f2fe"); // Match CSS pastel blue

  // Group for map elements (this is what we zoom)
  const mapGroup = svg.append("g");

  // 3. PROJECTION (Vertical Focused)
  // We scale it up slightly so the world fills the vertical space better
  const projection = d3.geoNaturalEarth1()
    .scale(width / 1.8) // Dynamic scale based on narrow width
    .translate([width / 2, height / 2]);

  const path = d3.geoPath(projection);

  // Colors (Minimalist Palette)
  const colorVisited = "#ef4444"; // Tailwind Red-500
  const colorStudied = "#8b5cf6"; // Tailwind Violet-500
  const colorLand = "#ffffff";    // White land looks clean on blue
  const colorHover = "#fef3c7";   // Soft yellow

  // Data
  const visitedPlaces = [
    { name: "Shanghai", coords: [121.4737, 31.2304] },
    { name: "Xiamen", coords: [118.0894, 24.4798] },
    { name: "Xinjiang", coords: [87.6177, 43.7928] },
    { name: "Xizang", coords: [91.1172, 29.6469] },
    { name: "Shenzhen", coords: [114.0579, 22.5431] },
    { name: "Sanya", coords: [109.5121, 18.2528] },
    { name: "Paris", coords: [2.3522, 48.8566] },
    { name: "Milano", coords: [9.19, 45.4642] },
    { name: "Luzern", coords: [8.3059, 47.0502] },
    { name: "Lugano", coords: [8.9511, 46.0037] },
    { name: "Barcelona", coords: [2.1734, 41.3851] },
    { name: "Malaga", coords: [-4.4214, 36.7213] },
    { name: "Greece", coords: [23.7275, 37.9838] }
  ];

  const studiedPlaces = [
    { name: "Dalian", coords: [121.6147, 38.914] },
    { name: "Hong Kong", coords: [114.1694, 22.3193] },
    { name: "London", coords: [-0.1276, 51.5072] },
    { name: "Zurich", coords: [8.5417, 47.3769] },
    { name: "Seoul", coords: [126.978, 37.5665] }
  ];

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "map-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.95)")
    .style("padding", "8px 12px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "12px")
    .style("font-family", "Inter, sans-serif")
    .style("font-weight", "600")
    .style("z-index", "100");

  // 4. ZOOM BEHAVIOR
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[-100, -100], [width + 100, height + 100]]) // Limit panning
    .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
        // Keep dots consistent size
        mapGroup.selectAll("circle").attr("r", 5 / event.transform.k);
        mapGroup.selectAll("path").attr("stroke-width", 0.5 / event.transform.k);
    });

  svg.call(zoom);

  // 5. LOAD & DRAW
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(world => {
      
      // Draw Land
      mapGroup.selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", colorLand)
        .attr("stroke", "#d1d5db") // Light gray borders
        .attr("stroke-width", 0.5)
        .on("mouseover", function() { d3.select(this).attr("fill", colorHover); })
        .on("mouseout", function() { d3.select(this).attr("fill", colorLand); });

      // Helper to draw cities
      const drawCities = (data, color) => {
        mapGroup.selectAll("circle." + color) // unique selector
          .data(data)
          .enter().append("circle")
          .attr("cx", d => projection(d.coords)[0])
          .attr("cy", d => projection(d.coords)[1])
          .attr("r", 5)
          .attr("fill", color)
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .on("mouseover", (event, d) => {
             tooltip.style("opacity", 1).html(d.name)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
             d3.select(event.currentTarget).attr("r", 8); // Pop effect
          })
          .on("mouseout", (event) => {
             tooltip.style("opacity", 0);
             d3.select(event.currentTarget).attr("r", 5);
          });
      };

      drawCities(visitedPlaces, colorVisited);
      drawCities(studiedPlaces, colorStudied);

      // 6. MINIMALIST LEGEND (Bottom Center)
      const legend = svg.append("g")
        .attr("transform", `translate(20, ${height - 40})`); // Bottom Left

      // Visited
      legend.append("circle").attr("r", 5).attr("fill", colorVisited).attr("cx", 0).attr("cy", 0);
      legend.append("text").text("Visited").attr("x", 12).attr("y", 4)
            .style("font-size", "10px").style("font-family", "Inter").style("fill", "#555");

      // Studied
      legend.append("circle").attr("r", 5).attr("fill", colorStudied).attr("cx", 70).attr("cy", 0);
      legend.append("text").text("Studied").attr("x", 82).attr("y", 4)
            .style("font-size", "10px").style("font-family", "Inter").style("fill", "#555");

    });
}