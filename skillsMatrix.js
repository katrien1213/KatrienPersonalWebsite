document.addEventListener("DOMContentLoaded", function() {

    // 1. SETUP
    const container = d3.select("#skills-matrix");
    container.selectAll("*").remove();

    // 2. DATA
    const allData = [
        { cat: "Software", items: [
            { name: "Unity", val: 4 }, { name: "UE5", val: 3 },
            { name: "Blender", val: 2 }, { name: "Substance", val: 2 },
            { name: "P5.js", val: 5 }, { name: "Figma", val: 5 }
        ]},
        { cat: "Machine Learning", items: [
            { name: "PyTorch", val: 3 }, { name: "TensorFlow", val: 2 },
            { name: "Scikit-learn", val: 2 }
        ]},
        { cat: "Code", items: [
            { name: "C#", val: 3 }, { name: "C++", val: 2 },
            { name: "HTML/CSS", val: 3 }, { name: "Java", val: 4 },
            { name: "Python", val: 3 }
        ]},
        { cat: "Languages", items: [
            { name: "English", val: 5 }, { name: "Mandarin", val: 5 },
            { name: "Cantonese", val: 3 }, { name: "German", val: 2 }
        ]}
    ];

    // 3. CONFIGURATION
    const margin = { top: 35, right: 0, bottom: 20, left: 0 }; 
    const totalWidth = 800; // Fixed internal width to match standard content width
    const rowHeight = 28;       
    const catHeaderHeight = 35; 
    
    const boxSize = 11;         
    const boxGap = 3;           
    const labelWidth = 95;      // Increased slightly for "Scikit-learn" text
    
    // Calculate the exact width of ONE column (Label + 5 Boxes)
    const singleColWidth = labelWidth + (5 * (boxSize + boxGap));
    
    // Calculate "Justified" Spacing
    // Formula: (TotalWidth - Width of Last Column) / (Number of Gaps)
    // This gives us the step distance between the START of each column.
    const numberOfCols = allData.length;
    const spacingStep = (totalWidth - singleColWidth) / (numberOfCols - 1);

    // Calculate Height
    const maxItems = Math.max(...allData.map(d => d.items.length));
    const totalHeight = (maxItems * rowHeight) + catHeaderHeight + margin.top + margin.bottom;

    // 4. CREATE SVG
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", totalHeight)
        .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
        .style("font-family", "'Inter', sans-serif");

    // 5. RENDER LOOP
    allData.forEach((category, colIndex) => {
        
        // ALIGNMENT LOGIC:
        // Col 0 starts at 0.
        // Col 3 starts at (800 - singleColWidth).
        const xOffset = colIndex * spacingStep;
        
        let currentY = margin.top;

        // A. Draw Category Header
        svg.append("text")
            .attr("x", xOffset)
            .attr("y", currentY - 15)
            .text(category.cat)
            .style("font-size", "10px")
            .style("font-weight", "700")
            .style("fill", "#111827")
            .style("text-transform", "uppercase")
            .style("letter-spacing", "0.05em");

        // B. Draw Items
        category.items.forEach(skill => {
            
            const group = svg.append("g")
                .attr("transform", `translate(${xOffset}, ${currentY})`)
                .style("cursor", "pointer");

            // 1. Skill Name
            group.append("text")
                .attr("x", 0)
                .attr("y", boxSize - 2)
                .text(skill.name)
                .style("font-size", "11px")
                .style("fill", "#6b7280")
                .style("font-weight", "400");

            // 2. Proficiency Boxes
            const boxesStartX = labelWidth; 
            
            for (let i = 0; i < 5; i++) {
                group.append("rect")
                    .attr("x", boxesStartX + (i * (boxSize + boxGap)))
                    .attr("y", 0)
                    .attr("width", boxSize)
                    .attr("height", boxSize)
                    .attr("rx", 2)
                    .attr("ry", 2)
                    .attr("fill", i < skill.val ? "#374151" : "#f3f4f6") 
                    .attr("class", i < skill.val ? "filled-box" : "empty-box");
            }

            // 3. Interaction Overlay
            group.append("rect")
                .attr("x", -5)
                .attr("y", -5)
                .attr("width", singleColWidth) // Precise width
                .attr("height", rowHeight)
                .attr("fill", "transparent")
                .on("mouseover", function() {
                    d3.select(this.parentNode).select("text")
                      .style("fill", "#992feae5") 
                      .style("font-weight", "600");
                    d3.select(this.parentNode).selectAll(".filled-box")
                      .style("fill", "#992feae5");
                })
                .on("mouseout", function() {
                    d3.select(this.parentNode).select("text")
                      .style("fill", "#6b7280")
                      .style("font-weight", "400");
                    d3.select(this.parentNode).selectAll(".filled-box")
                      .style("fill", "#374151");
                });

            currentY += rowHeight;
        });
    });
});