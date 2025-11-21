function createInteractiveMap(containerId) {
    const container = d3.select(containerId);
    if (container.empty()) {
        console.error("Map container not found:", containerId);
        return;
    }

    // 1. DIMENSIONS
    // We grab the dimensions from the CSS (500px height defined in CSS)
    const element = document.querySelector(containerId);
    const width = element.clientWidth;
    const height = element.clientHeight;

    container.html(""); // Clear

    // 2. SVG
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("background-color", "#e0f2fe"); // Ocean Color

    const mapGroup = svg.append("g");

    // 3. PROJECTION
    // Scale 160 is good for a ~260px wide column
    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.5) 
        .translate([width / 2, height / 2]);

    const path = d3.geoPath(projection);

    // 4. DATA POINTS
    const visitedPlaces = [
        { name: "Shanghai", coords: [121.4737, 31.2304] },
        { name: "Paris", coords: [2.3522, 48.8566] },
        { name: "Milano", coords: [9.19, 45.4642] },
        { name: "Barcelona", coords: [2.1734, 41.3851] },
        { name: "Shenzhen", coords: [114.0579, 22.5431] },
        { name: "Xizang", coords: [91.1172, 29.6469] },
        { name: "Greece", coords: [23.7275, 37.9838] }
    ];

    const studiedPlaces = [
        { name: "Hong Kong", coords: [114.1694, 22.3193] },
        { name: "London", coords: [-0.1276, 51.5072] },
        { name: "Zurich", coords: [8.5417, 47.3769] },
        { name: "Seoul", coords: [126.978, 37.5665] }
    ];

    // 5. TOOLTIP
    const tooltip = d3.select("body").append("div")
        .attr("class", "map-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.9)")
        .style("padding", "5px 10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("color", "#333")
        .style("z-index", "9999");

    // 6. DRAW MAP
    // Using a reliable GeoJSON source
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then(data => {
            
            // Draw Countries
            mapGroup.selectAll("path")
                .data(data.features)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", "#ffffff")
                .attr("stroke", "#cbd5e1")
                .attr("stroke-width", 0.5);

            // Draw Points Helper
            function drawDots(placeData, color) {
                mapGroup.selectAll(".dot-" + color.replace("#",""))
                    .data(placeData)
                    .enter().append("circle")
                    .attr("cx", d => projection(d.coords)[0])
                    .attr("cy", d => projection(d.coords)[1])
                    .attr("r", 5) // Bigger initial size
                    .attr("fill", color)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                    .on("mouseover", function(event, d) {
                        d3.select(this).transition().attr("r", 8);
                        tooltip.style("opacity", 1)
                               .html(d.name)
                               .style("left", (event.pageX + 10) + "px")
                               .style("top", (event.pageY - 20) + "px");
                    })
                    .on("mouseout", function() {
                        d3.select(this).transition().attr("r", 5);
                        tooltip.style("opacity", 0);
                    });
            }

            // Execute Draw
            drawDots(visitedPlaces, "#2ff4c0ff"); // Red for Visited
            drawDots(studiedPlaces, "#8b5cf6"); // Purple for Studied

        }).catch(err => {
            console.error("Failed to load map data:", err);
            container.html("<p style='text-align:center; padding:20px; color:#666;'>Map could not load.</p>");
        });

    // 7. ZOOM BEHAVIOR
    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform);
            // Keep dots uniformly sized during zoom
            mapGroup.selectAll("circle").attr("r", 5 / event.transform.k);
            mapGroup.selectAll("path").attr("stroke-width", 0.5 / event.transform.k);
        });

    svg.call(zoom);
}