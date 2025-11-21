document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // 1. DATA (Synced with Skills Matrix)
    // ==========================================
    const skillsData = {
        "Software": [
            { name: "Unity", val: 80 },
            { name: "UE5", val: 60 },
            { name: "Blender", val: 40 },
            { name: "Substance", val: 40 },
            { name: "P5.js", val: 100 },
            { name: "Figma", val: 100 }
        ],
        "Code": [
            { name: "C#", val: 60 },
            { name: "C++", val: 40 },
            { name: "HTML/CSS", val: 60 },
            { name: "Java", val: 80 },
            { name: "Python", val: 60 }
        ],
        "AI / ML": [
            { name: "PyTorch", val: 60 },
            { name: "TensorFlow", val: 40 },
            { name: "Scikit-learn", val: 40 }
        ],
        "Languages": [
            { name: "English", val: 100 },
            { name: "Mandarin", val: 100 },
            { name: "Cantonese", val: 60 },
            { name: "German", val: 40 }
        ]
    };

    // ==========================================
    // 2. VIEW TOGGLE LOGIC (Matrix <-> Bar)
    // ==========================================
    const toggleBtn = document.getElementById("toggle-skills-view-btn");
    const matrixView = document.getElementById("skills-matrix");
    const barView = document.getElementById("vis-bar");
    const btnText = toggleBtn.querySelector("span");

    let isBarView = false;

    toggleBtn.addEventListener("click", () => {
        isBarView = !isBarView;

        if (isBarView) {
            // Switch to Bar
            matrixView.style.display = "none";
            matrixView.classList.remove("active");
            
            barView.style.display = "block";
            // Small timeout to allow display:block to render before opacity transition
            setTimeout(() => barView.classList.add("active"), 10);
            
            btnText.innerText = "Switch to Matrix View";
            
            // Trigger initial render if empty
            if(!d3.select("#bar-chart-canvas svg").node()) {
                updateChart("Software");
            }
        } else {
            // Switch to Matrix
            barView.classList.remove("active");
            setTimeout(() => barView.style.display = "none", 300);
            
            matrixView.style.display = "block";
            setTimeout(() => matrixView.classList.add("active"), 10);
            
            btnText.innerText = "Switch to Bar Chart";
        }
    });

    // ==========================================
    // 3. DYNAMIC BAR CHART LOGIC
    // ==========================================
    
    // A. Setup Canvas
    const container = document.getElementById("bar-chart-canvas");
    const margin = {top: 20, right: 50, bottom: 40, left: 100};
    const width = 700 - margin.left - margin.right; // Fixed width for aesthetics
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart-canvas")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // B. Scales
    // Y Axis: Skills
    const y = d3.scaleBand()
        .range([0, height])
        .padding(0.3);

    // X Axis: Proficiency (0 to 100)
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // Append Axes Groups
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis");

    const yAxisGroup = svg.append("g")
        .attr("class", "y-axis");

    // Customize Axis styling via CSS-in-JS
    const axisStyle = (g) => {
        g.call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%").tickSize(-height))
         .select(".domain").remove(); // Remove outer line
        g.selectAll("line").attr("stroke", "#f3f4f6"); // Light grid lines
        g.selectAll("text").attr("fill", "#9ca3af").style("font-family", "Inter");
    };

    // C. Update Function
    function updateChart(category) {
        const data = skillsData[category];

        // 1. Update Domains
        y.domain(data.map(d => d.name));

        // 2. Render Axes
        xAxisGroup.transition().duration(750).call(axisStyle);
        yAxisGroup.transition().duration(750).call(d3.axisLeft(y).tickSize(0));
        yAxisGroup.selectAll("text")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .style("font-family", "Inter")
            .style("fill", "#374151");

        // 3. DATA JOIN
        const bars = svg.selectAll("rect")
            .data(data, d => d.name);

        // EXIT
        bars.exit()
            .transition().duration(500)
            .attr("width", 0)
            .remove();

        // UPDATE
        bars.transition().duration(750)
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.val))
            .attr("fill", "#9333ea"); // Default Purple

        // ENTER
        bars.enter()
            .append("rect")
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("width", 0) // Start at 0 for animation
            .attr("fill", "#9333ea") // Purple
            .attr("rx", 4) // Rounded corners
            .transition().duration(750)
            .attr("width", d => x(d.val));

        // 4. INTERACTION (Hover = Green)
        svg.selectAll("rect")
            .on("mouseover", function(event, d) {
                d3.select(this)
                  .transition().duration(200)
                  .attr("fill", "#73d3bcff"); // Mint Green on Hover
                
                // Optional: Add value text at end of bar on hover
                svg.append("text")
                   .attr("class", "val-label")
                   .attr("x", x(d.val) + 5)
                   .attr("y", y(d.name) + y.bandwidth()/2 + 4)
                   .text(d.val + "%")
                   .style("font-size", "11px")
                   .style("fill", "#0d9488")
                   .style("font-weight", "bold");
            })
            .on("mouseout", function() {
                d3.select(this)
                  .transition().duration(200)
                  .attr("fill", "#9333ea"); // Back to Purple
                
                svg.selectAll(".val-label").remove();
            });
    }

    // ==========================================
    // 4. CATEGORY BUTTON LISTENERS
    // ==========================================
    const catButtons = document.querySelectorAll(".cat-btn");
    
    catButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            // Remove active class from all
            catButtons.forEach(b => b.classList.remove("active"));
            // Add to clicked
            this.classList.add("active");
            
            // Get category and update
            const cat = this.getAttribute("data-cat");
            updateChart(cat);
        });
    });

    // Initial Render (Hidden until toggled, but ready)
    // We wait for the toggle to trigger the first render for animation effect
});