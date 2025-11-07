// interactiveMap.js

/**
 * Creates an interactive D3 map visualization with pan, zoom, and country hover labels.
 * @param {string} containerId - The selector ID of the container element (e.g., "#map").
 */
function createInteractiveMap(containerId) {
  // Ensure D3 is loaded and the container exists before proceeding
  if (typeof d3 === 'undefined' || !d3.select(containerId).node()) {
    console.error("D3 is not loaded or the container ID " + containerId + " was not found.");
    return;
  }

  const width = 1000;
  const height = 600;

  // Clear the container before drawing
  d3.select(containerId).html("");

  // 1. Setup SVG and Append Drawing Group
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Background Ocean (Static, does not pan/zoom) - Placed behind mapGroup
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#B3D9FF") // Clearer, vibrant ocean blue
    .attr("opacity", 1); // Full opacity for clear distinction

  // The main group element (g) where all map elements are drawn (for zoom/pan).
  const mapGroup = svg.append("g");

  // Country label for hover effect (initially hidden)
  const countryLabel = svg.append("text")
    .attr("class", "country-label")
    .attr("x", 10) // Position it near the top-left
    .attr("y", 20)
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .style("pointer-events", "none") // Ensures it doesn't block mouse events
    .style("opacity", 0);

  // 2. Map Projection and Path
  const projection = d3.geoNaturalEarth1()
    .scale(180)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath(projection);

  // Colors
  const colorVisited = "#612b8aff"; // Brighter Red for visited
  const colorStudied = "#bcd24cff"; // Brighter Blue for studied
  const colorLand = "#F0EAD6"; // Soft, light land color
  const colorHover = "#fdb4c6ff"; // Golden color for hover highlight

  // Data (Kept as is)
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

  // Tooltip for cities
  const cityTooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(255,255,255,0.9)")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "12px")
    .style("font-weight", "bold");

  function showCityTooltip(event, d) {
    cityTooltip.style("opacity", 1)
      .html(d.name)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
  }

  function hideCityTooltip() {
    cityTooltip.style("opacity", 0);
  }

  // 3. Zoom Functionality
  const zoom = d3.zoom()
    .scaleExtent([1, 10]) // Increased max zoom for more detail
    .on("zoom", zoomed);

  function zoomed(event) {
    mapGroup.attr("transform", event.transform);
    
    // Adjust marker radius and stroke width inversely to zoom level (k)
    // This keeps them visually consistent in size relative to the screen,
    // making them easier to click/see even when zoomed in.
    const currentK = event.transform.k;
    mapGroup.selectAll("circle")
        .attr("r", 6 / currentK) // Initial radius 6
        .attr("stroke-width", 1.2 / currentK); // Initial stroke 1.2

    // Adjust country border stroke width
    mapGroup.selectAll("path")
        .attr("stroke-width", 0.5 / currentK); // Initial stroke 0.5
    
    // Keep country label fixed relative to the screen (not affected by map zoom)
    // No change needed here as countryLabel is not in mapGroup
  }

  // Apply the zoom behavior to the SVG
  svg.call(zoom);

  // 4. Load Map and Draw Elements
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(world => {
      // Draw Countries (land masses)
      const countries = mapGroup.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", colorLand) // Distinct land color
        .attr("stroke", "#555") // Darker country borders
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", colorHover); // Highlight country on hover
            countryLabel.text(d.properties.name) // Show country name
                .transition().duration(100).style("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", colorLand); // Revert color
            countryLabel.transition().duration(200).style("opacity", 0); // Hide country name
        });

      // Function to draw points (cities)
      function drawPoints(data, className, color) {
        mapGroup.selectAll("." + className)
          .data(data)
          .enter()
          .append("circle")
          .attr("class", className)
          .attr("cx", d => projection(d.coords)[0])
          .attr("cy", d => projection(d.coords)[1])
          .attr("r", 6) // Initial radius
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.2)
          .attr("opacity", 0.9)
          .on("mouseover", showCityTooltip) // Use cityTooltip
          .on("mouseout", hideCityTooltip); // Use cityTooltip
      }
      
      // Draw Visited points
      drawPoints(visitedPlaces, "visited", colorVisited);

      // Draw Studied points
      drawPoints(studiedPlaces, "studied", colorStudied);

      // 5. Legend (Does not zoom/pan, so placed outside mapGroup)
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 200}, 40)`);

      legend.append("circle").attr("r", 7).attr("fill", colorVisited);
      legend.append("text").attr("x", 15).attr("y", 5).text("Visited Cities").style("font-size","12px").style("font-weight","bold").style("fill", "#333");

      legend.append("circle").attr("r", 7).attr("fill", colorStudied).attr("cy", 25);
      legend.append("text").attr("x", 15).attr("y", 30).text("Studied Cities").style("font-size","12px").style("font-weight","bold").style("fill", "#333");
    })
    .catch(err => console.error("Error loading GeoJSON:", err));
}