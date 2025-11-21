document.addEventListener("DOMContentLoaded", function () {

    const containerId = "#vis-scatterplot";
    const container = document.querySelector(containerId);

    if (!container) {
        console.warn("Scatterplot container not found.");
        return;
    }

    // --- 1. ROBUST DIMENSIONS ---
    // If container is hidden (width=0), default to 800px so it still renders
    let boxWidth = container.clientWidth || 800;
    // Force a good height for separation
    let boxHeight = 500; 

    const margin = { top: 50, right: 60, bottom: 60, left: 140 }; // Left margin for Category labels
    const width = boxWidth - margin.left - margin.right;
    const height = boxHeight - margin.top - margin.bottom;

    // Clear previous
    d3.select(containerId).html("");

    // --- 2. SETUP SVG ---
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", "100%") // Responsive width
        .attr("height", boxHeight)
        .attr("viewBox", `0 0 ${boxWidth} ${boxHeight}`)
        .style("overflow", "visible") // Allow tooltips/glows to bleed out
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- 3. DATA ---
    const data = [
        { year: 2023, type: "Painting", count: 4, desc: "Oil on canvas series" },
        { year: 2023, type: "Video Art", count: 2, desc: "Short film festivals" },
        { year: 2024, type: "VR", count: 5, desc: "Interactive Unity projects" },
        { year: 2024, type: "Installation", count: 2, desc: "Physical computing" },
        { year: 2025, type: "Performance", count: 3, desc: "Live coding events" },
        { year: 2025, type: "VR", count: 4, desc: "Metaverse exhibition" },
        { year: 2026, type: "AI Art", count: 2, desc: "Generative networks" }
    ];

    // --- 4. SCALES (GRID LAYOUT) ---
    // X Axis: Years
    const allYears = [2023, 2024, 2025, 2026];
    const x = d3.scalePoint()
        .domain(allYears)
        .range([0, width])
        .padding(0.5);

    // Y Axis: Categories
    // Extract unique types and sort them
    const allTypes = [...new Set(data.map(d => d.type))].sort();
    const y = d3.scalePoint()
        .domain(allTypes)
        .range([height, 0])
        .padding(0.8);

    // Size: Radius based on count
    const r = d3.scaleSqrt()
        .domain([0, 6]) // 0 to max count
        .range([0, 28]); // Max radius 28px

    // Color Palette
    const color = d3.scaleOrdinal()
        .domain(allTypes)
        .range(["#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#3b82f6"]);

    // --- 5. AESTHETICS (Grid & Glow) ---
    
    // Glow Filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "softGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Horizontal Grid Lines (Dashed)
    svg.selectAll("line.grid-line")
        .data(allTypes)
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    // --- 6. AXES ---
    // Top X Axis (Years)
    svg.append("g")
        .call(d3.axisTop(x).tickSize(0).tickPadding(15))
        .select(".domain").remove();
    
    svg.selectAll(".tick text")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "700")
        .style("fill", "#111827");

    // Left Y Axis (Categories)
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(15))
        .select(".domain").remove();

    svg.selectAll(".tick text")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#6b7280");

    // --- 7. BUBBLES ---
    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.type))
        .attr("r", 0) // Animate from 0
        .attr("fill", d => color(d.type))
        .style("filter", "url(#softGlow)")
        .style("opacity", 0.9)
        .style("cursor", "pointer");

    // Animation: Pop In
    circles.transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("r", d => r(d.count));

    // --- 8. NUMBER LABELS INSIDE BUBBLES ---
    // Only show number if bubble is big enough
    svg.selectAll(".bubble-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bubble-label")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.type))
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d.count)
        .style("fill", "white")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400) // Delay until bubble pops
        .style("opacity", 1);


    // --- 9. INTERACTION (Floating Tooltip) ---
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(255,255,255,0.95)")
        .style("backdrop-filter", "blur(4px)")
        .style("padding", "8px 12px")
        .style("border", "1px solid #e5e7eb")
        .style("border-radius", "6px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");

    circles.on("mouseenter", function(event, d) {
        d3.select(this)
            .transition().duration(200)
            .attr("r", r(d.count) * 1.2); // Expand

        tooltip
            .style("visibility", "visible")
            .html(`
                <div style="font-weight:700; color:#111;">${d.type}</div>
                <div style="color:#666; margin-bottom:4px;">${d.year} • ${d.count} Works</div>
                <div style="color:#888; font-style:italic;">"${d.desc}"</div>
            `);
    })
    .on("mousemove", function(event) {
        tooltip
            .style("top", (event.pageY - 80) + "px")
            .style("left", (event.pageX - 70) + "px");
    })
    .on("mouseleave", function() {
        d3.select(this)
            .transition().duration(200)
            .attr("r", r(d.count)); // Reset size
        
        tooltip.style("visibility", "hidden");
    });

});