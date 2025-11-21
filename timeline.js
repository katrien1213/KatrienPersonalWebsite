document.addEventListener("DOMContentLoaded", function() {

    // 1. SETUP
    const container = d3.select("#vis-timeline");
    container.html(""); // Clear previous

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    // Get width dynamically or fallback
    const width = container.node().clientWidth || 900;
    const height = 450 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 2. DATA
    const data = [
        { year: 2022, name: "CityU Top Entrance Scholarship", type: "Scholarship" },
        { year: 2022, name: "HKSAR Talent Development", type: "Scholarship" },
        { year: 2022, name: "Dean’s List", type: "Scholarship" },
        { year: 2023, name: "Dr. Peter Chung Yin Lee Fund", type: "Scholarship" },
        { year: 2023, name: "USFHK Women Tennis Bronze", type: "Sports" },
        { year: 2024, name: "CityU Scholarship", type: "Scholarship" },
        { year: 2024, name: "Animation Screening – Experimental Film", type: "Exhibition" },
        { year: 2024, name: "Animation Screening – Montreal", type: "Exhibition" },
        { year: 2024, name: "Animation Screening – Lugano", type: "Exhibition" },
        { year: 2024, name: "Dr. Herman Hu Sports Awards", type: "Sports" },
        { year: 2024, name: "USFHK Women Tennis 1st Place", type: "Sports" },
        { year: 2025, name: "Beijing Int'l Jewellery Exhibition", type: "Exhibition" }
    ];

    // 3. SCALES & COLORS
    const years = [2022, 2023, 2024, 2025];
    
    const xScale = d3.scaleLinear()
        .domain([2022, 2025])
        .range([50, width - 50]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Scholarship", "Exhibition", "Sports"])
        .range(["#8b5cf6", "#ec4899", "#10b981"]); // Purple, Pink, Emerald

    // 4. TOOLTIP
    const tooltip = d3.select("body").append("div")
        .attr("class", "timeline-tooltip");

    // 5. DRAW MAIN AXIS (Center Line)
    const yCenter = height / 2;

    svg.append("line")
        .attr("x1", 0)
        .attr("y1", yCenter)
        .attr("x2", width)
        .attr("y2", yCenter)
        .attr("class", "timeline-axis");

    // 6. DRAW YEAR MARKERS (Big Numbers in Background)
    svg.selectAll(".year-label")
        .data(years)
        .enter()
        .append("text")
        .attr("class", "timeline-year")
        .attr("x", d => xScale(d))
        .attr("y", yCenter + 15) // Slightly centered
        .attr("text-anchor", "middle")
        .text(d => d);

    // 7. PROCESS DATA FOR LAYOUT
    // We need to stack items above and below the line so they don't overlap
    const yearMap = {};
    data.forEach(d => {
        if (!yearMap[d.year]) yearMap[d.year] = { top: [], bottom: [] };
        
        // Distribute: Even index goes Top, Odd index goes Bottom
        // This balances the tree
        const target = (yearMap[d.year].top.length <= yearMap[d.year].bottom.length) 
            ? yearMap[d.year].top 
            : yearMap[d.year].bottom;
        
        target.push(d);
    });

    // 8. DRAW EVENTS
    Object.keys(yearMap).forEach(year => {
        const yr = parseInt(year);
        const xPos = xScale(yr);
        const spacing = 35; // Vertical space between items

        // --- Draw TOP Items ---
        yearMap[year].top.forEach((d, i) => {
            const yPos = yCenter - 40 - (i * spacing); // Go Up
            drawEvent(d, xPos, yPos, true);
        });

        // --- Draw BOTTOM Items ---
        yearMap[year].bottom.forEach((d, i) => {
            const yPos = yCenter + 50 + (i * spacing); // Go Down
            drawEvent(d, xPos, yPos, false);
        });
    });

    // Helper function to draw a single event node
    function drawEvent(d, x, y, isTop) {
        const group = svg.append("g").style("cursor", "pointer");

        // 1. Connector Line (Curved)
        // Control point determines the curve intensity
        const cY = isTop ? y + 20 : y - 20; 
        
        group.append("path")
            .attr("d", `M ${x} ${yCenter} C ${x} ${cY}, ${x} ${cY}, ${x} ${y}`)
            .attr("stroke", "#e5e7eb")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        // 2. The Dot
        const circle = group.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 6)
            .attr("fill", "white")
            .attr("stroke", colorScale(d.type))
            .attr("stroke-width", 2)
            .transition().duration(1000)
            .attr("r", 6);

        // 3. Interaction (Hover)
        group.on("mouseover", function(event) {
            // Pop animation
            d3.select(this).select("circle")
                .transition().duration(200)
                .attr("r", 9)
                .attr("fill", colorScale(d.type));

            // Show Tooltip
            tooltip.style("opacity", 1)
                .html(`
                    <span>${d.type}</span><br>
                    <strong>${d.name}</strong>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            // Reset animation
            d3.select(this).select("circle")
                .transition().duration(200)
                .attr("r", 6)
                .attr("fill", "white");
            
            tooltip.style("opacity", 0);
        });

        // 4. Short Label (Truncated)
        // We truncate text if it's too long to keep the timeline clean
        const shortName = d.name.length > 20 ? d.name.substring(0, 18) + "..." : d.name;
        
        group.append("text")
            .attr("class", "timeline-label")
            .attr("x", x + 10) // Offset to right
            .attr("y", y + 4)
            .text(shortName)
            .style("opacity", 0)
            .transition().delay(500).duration(500)
            .style("opacity", 1);
    }

});