// sf36Viz.js

/**
 * Creates an interactive Grouped Bar Chart from the SF-36 data.
 * It uses a hardcoded container ID and data to avoid changing the HTML file.
 */
function createSF36Viz() {
    // 1. Data Extraction and Pre-calculation (Internal to the function)
    const rawData = [
        { time: 0, Physical: 46.7, Mental: 36.8 },
        { time: 3, Physical: 47.9, Mental: 36.9 },
        { time: 6, Physical: 48.1, Mental: 38.4 },
        { time: 9, Physical: 47.6, Mental: 39.6 },
        { time: 12, Physical: 47.7, Mental: 41.1 },
        { time: 15, Physical: 47.0, Mental: 40.3 },
        { time: 18, Physical: 47.1, Mental: 39.6 },
        { time: 21, Physical: 48.0, Mental: 40.1 },
        { time: 24, Physical: 46.9, Mental: 41.2 }
    ];

    const SCORES = ["Physical", "Mental"];
    const POP_NORM = 50.0;
    const containerId = "#keto-chart"; // Using the ID from your existing HTML structure

    // Calculate Change from Baseline (Diff)
    const baseline = rawData[0];
    const data = rawData.map(d => ({
        time: d.time,
        Physical: d.Physical,
        Mental: d.Mental,
        Physical_Diff: d.Physical - baseline.Physical,
        Mental_Diff: d.Mental - baseline.Mental,
        P_Baseline: baseline.Physical,
        M_Baseline: baseline.Mental
    }));

    // Data Transformation (Wide to Long format for D3 grouping)
    let dataLong = data.flatMap(d => SCORES.map(key => ({
        time: d.time,
        component: key,
        Absolute: d[key],
        Change: d[`${key}_Diff`],
        Baseline: d[`${key}_Baseline`]
    })));
    
    // Remove the baseline data points (time=0) for bar chart drawing
    dataLong = dataLong.filter(d => d.time > 0);
    const timePoints = data.filter(d => d.time > 0).map(d => d.time);


    // 2. Setup Dimensions
    const margin = { top: 70, right: 40, bottom: 60, left: 70 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Clear existing content and set up SVG
    d3.select(containerId).html(""); // Clear everything inside the container
    
    // Append the control panel (mode selector) BEFORE the chart container
    const selectorContainer = d3.select(containerId)
        .append("div")
        .attr("id", "mode-selector")
        .style("text-align", "center")
        .style("margin-bottom", "20px");
        
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const color = d3.scaleOrdinal()
        .domain(SCORES)
        .range(["#549860ff", "#9672d7ff"]); 

    // 3. UI Control: Mode Selector (Absolute vs. Change)
    const modes = [
        { value: "Absolute", label: "Absolute Score" },
        { value: "Change", label: "Change from Baseline (Month 0)" }
    ];

    selectorContainer.selectAll("label")
        .data(modes)
        .enter()
        .append("label")
        .style("margin-right", "20px")
        .html(d => `
            <input type="radio" name="displayMode" value="${d.value}" ${d.value === "Absolute" ? "checked" : ""}>
            ${d.label}
        `);

    // 4. Scales
    // X-Scale: Groups (Time points)
    const x0 = d3.scaleBand()
        .domain(timePoints)
        .range([0, width])
        .padding(0.2);

    // X1-Scale: Individual bars within a group (Physical/Mental)
    const x1 = d3.scaleBand()
        .domain(SCORES)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    // Y-Scale (Initial: Absolute Score) - Domain will be updated in updateChart
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataLong, d => d.Absolute) * 1.05]) 
        .nice()
        .range([height, 0]);

    // 5. Axes
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    const yAxis = svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));
        
    // Axis Labels
    svg.append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Time, months");

    const yLabel = svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("SF-36 Component Score, mean");
        
    // 6. Draw Bars (Grouped)
    const groups = svg.selectAll(".group")
        .data(data.filter(d => d.time > 0))
        .enter()
        .append("g")
        .attr("class", "group")
        .attr("transform", d => `translate(${x0(d.time)},0)`);

    const bars = groups.selectAll("rect")
        .data(d => SCORES.map(key => ({
            key: key,
            time: d.time,
            Absolute: d[key],
            Change: d[`${key}_Diff`]
        })))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("width", x1.bandwidth())
        .attr("fill", d => color(d.key))
        .attr("class", d => `bar bar-${d.key}`)
        // Initial state (Absolute)
        .attr("y", d => y(d.Absolute))
        .attr("height", d => height - y(d.Absolute));

    // 7. Tooltip and Interactivity
    const tooltip = d3.select(containerId)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.9)")
        .style("padding", "8px 12px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    bars.on("mouseover", function(event, d) {
        const displayMode = d3.select('input[name="displayMode"]:checked').property("value");
        let value = d[displayMode];
        
        // *NEW: Only show positive change if in 'Change' mode*
        if (displayMode === "Change") {
            // The tooltip should still show the true change value, even if the bar is zero height
            value = value.toFixed(1); 
        } else {
            value = value.toFixed(1);
        }
        
        let htmlContent = `
            <span style="color:${color(d.key)}; font-weight:bold;">${d.key} Score</span><br>
            Time: ${d.time} months<br>
            ${displayMode === "Absolute" ? "Score" : "Change from M0"}: ${value}
        `;

        tooltip.html(htmlContent)
            .style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");

        d3.select(this).style("filter", "brightness(1.2)");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).style("filter", "none");
    });
    
    // 8. Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, -40)`);

    SCORES.forEach((d, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(${i * 80}, 0)`);
        g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(d));
        g.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d)
            .attr("font-size", "12px");
    });
    
    // Optional: Population Norm line (only for Absolute mode)
    const normLine = svg.append("line")
        .attr("class", "pop-norm-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(POP_NORM))
        .attr("y2", y(POP_NORM))
        .attr("stroke", "#aaa")
        .attr("stroke-dasharray", "4")
        .attr("stroke-width", 1);
        
    svg.append("text")
        .attr("class", "pop-norm-label")
        .attr("x", width - 5)
        .attr("y", y(POP_NORM) - 5)
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", "#aaa")
        .text(`Population norm: ${POP_NORM.toFixed(1)}`);


    // 9. Update Function (The Core of Interactivity)
    function updateChart(mode) {
        let yDomain, yLabelText;
        
        if (mode === "Absolute") {
            // Absolute Scores: Standard scale from 0
            yDomain = [0, d3.max(dataLong, d => d.Absolute) * 1.05];
            yLabelText = "SF-36 Component Score, mean";
            normLine.transition().duration(500).style("opacity", 1);
            svg.select(".pop-norm-label").transition().duration(500).style("opacity", 1);
        } else {
            // Change from Baseline (Diff) - MODIFIED FOR POSITIVE ONLY
            // 1. Calculate max positive change
            const maxPositiveChange = d3.max(dataLong, d => Math.max(0, d.Change));
            
            // 2. Set Y-Domain from 0 to max positive change (removes negative numbers)
            yDomain = [0, maxPositiveChange * 1.1]; 
            
            yLabelText = "Positive Change in SF-36 Score (Relative to Month 0)";
            normLine.transition().duration(500).style("opacity", 0); 
            svg.select(".pop-norm-label").transition().duration(500).style("opacity", 0);
        }

        // 1. Update Y Scale and Axis
        y.domain(yDomain);
        yAxis.transition().duration(750).call(d3.axisLeft(y));
        
        // 2. Update Y Axis Label
        svg.select(".y-label").text(yLabelText);

        // 3. Update Bar positions and heights
        bars.transition()
            .duration(750)
            .attr("y", d => {
                const value = d[mode];
                // *NEW: Only plot positive values. Negative values start at y(0) and have 0 height.*
                const plotValue = Math.max(0, value); 
                return y(plotValue); 
            })
            .attr("height", d => {
                const value = d[mode];
                // *NEW: Height is the distance from the plotted value to zero. Use Math.max(0, value).*
                const plotValue = Math.max(0, value);
                return height - y(plotValue); // Since y(0) is at the bottom (height)
            });
    }

    // Event listener for the mode selector
    d3.selectAll('input[name="displayMode"]').on("change", function() {
        updateChart(this.value);
    });

    // Initial draw
    updateChart("Absolute"); 
}

// Ensure the D3 script is loaded before calling the function
// Use a timeout or window load event to ensure the target element exists
window.addEventListener('load', createSF36Viz);