// scrollyTimeline.js
function createScrollyTimeline(containerId) {
    
    // Data (as defined in section 1)
    const timelineData = [
        { year: 2022, type: 'Academic', title: 'Top Entrance Scholarship', description: 'CityU Top Entrance Scholarship for International Students, 2022-2026.' },
        { year: 2022, type: 'Academic', title: "Dean's List", description: 'Dean\'s List, 2022.' },
        { year: 2023, type: 'Academic', title: 'Overseas Experience Awards', description: 'Dr. Peter Chung Yin Lee Memorial Fund Overseas Experience Awards, 2023.' },
        { year: 2024, type: 'Academic', title: 'CityU Scholarship', description: 'CityU Scholarship, 2024.' },
        { year: 2022, type: 'Academic', title: 'Talent Development Scholarship (HKSAR)', description: 'HKSAR Government Scholarship Fund (Non-academic Awards) - Talent Development 2022-2025.' },
        { year: 2025, type: 'Academic', title: 'Reaching Out Award (HKSAR)', description: 'HKSAR Government Scholarship Fund - Reaching Out Award 2025.' },
        
        { year: 2025, type: 'Creative', title: 'Jewellery Exhibition (Beijing)', description: 'Artwork exhibited in Beijing International Jewllery Exhibition 2025.' },
        { year: 2024, type: 'Creative', title: 'Film Festival (Lugano)', description: 'Animation project screening at Lugano Animation Days in Switzerland, 2024.' },
        { year: 2024, type: 'Creative', title: 'Film Festival (Cinémathèque québécoise)', description: 'Animation project screening at the Cinémathèque québécoise in Montreal, Canada 2024.' },
        { year: 2024, type: 'Creative', title: 'Experimental Film Festival', description: 'Animation project screening at International Experimental Film Festival, 2024.' },

        { year: 2018, type: 'Sports', title: 'National First-class Golf Athlete', description: 'National First-class Golf Athlete, 2018.' },
        { year: 2023, type: 'Sports', title: 'Bronze (Tennis)', description: 'Bronze of USFHK Women Tennis competition, 2023.' },
        { year: 2024, type: 'Sports', title: 'First Place (Tennis)', description: 'First place of USFHK Women Tennis competition, 2024.' },
        { year: 2024, type: 'Sports', title: 'Sports Awards (Dr. Herman Hu)', description: 'Dr. Herman Hu Sports Awards and Scholarships, 2024.' } 
    ].sort((a, b) => a.year - b.year); // Sort by year

    const container = d3.select(containerId);
    container.html(''); // Clear container
    
    // 1. Setup Dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 30 };
    const chartWidth = 1600; // Make it wide for horizontal scroll/storytelling
    const chartHeight = 250;
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    // 2. Scales and Colors
    const years = Array.from(new Set(timelineData.map(d => d.year)));
    const types = ['Sports', 'Creative', 'Academic']; // Order matters for Y-axis
    
    // X-Scale (Time/Year)
    const x = d3.scalePoint()
        .domain(years)
        .range([0, width])
        .padding(0.5);

    // Y-Scale (Type of Honor)
    const y = d3.scalePoint()
        .domain(types)
        .range([height, 0])
        .padding(0.5);

    // Color Scale
    const color = d3.scaleOrdinal()
        .domain(types)
        .range(["#E41A1C", "#377EB8", "#4DAF4A"]); // Red, Blue, Green

    // 3. Create Container and SVG
    
    // The wrapper creates the scrollable area
    const wrapper = container.append("div")
        .style("overflow-x", "scroll")
        .style("width", "100%")
        .style("height", `${chartHeight + 150}px`); // Extra height for info panel

    const svg = wrapper.append("svg")
        .attr("width", chartWidth) 
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 4. Draw Timeline Axis and Line
    
    // Base Line
    svg.append("line")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .attr("y1", height)
        .attr("y2", height)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

    // X-Axis (Years)
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .attr("font-size", "14px");
        
    // Y-Axis Labels (Types)
    svg.append("g")
        .attr("class", "y-axis-labels")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .select(".domain").remove(); // Hide the domain line

    // 5. Draw the Data Points (Circles)
    const points = svg.selectAll(".event-point")
        .data(timelineData)
        .enter()
        .append("circle")
        .attr("class", "event-point")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.type))
        .attr("r", 8)
        .attr("fill", d => color(d.type))
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("cursor", "pointer")
        .attr("data-title", d => d.title) // Used for Intersection Observer
        .attr("data-description", d => d.description)
        .attr("data-year", d => d.year)
        .attr("data-type", d => d.type);
        
    // 6. Scrollytelling Interaction Panel
    
    const infoPanel = container.append("div")
        .attr("id", "timeline-info-panel")
        .style("position", "sticky")
        .style("top", "10px") // Stick near the top of the viewport
        .style("margin-top", "20px")
        .style("background", "#f0f0f0")
        .style("padding", "15px")
        .style("border-left", "5px solid #377EB8")
        .style("width", "350px")
        .style("font-family", "sans-serif")
        .html("<h3>Scroll to Explore Your Honors!</h3><p>Find the different types of awards plotted on the vertical axis (Y).</p>");

    // 7. Intersection Observer for Scroll-Triggered Text
    
    const observerOptions = {
      root: wrapper.node(), // Observe within the scrollable wrapper
      rootMargin: "0px -50% 0px -50%", // Defines a central vertical 'target' zone
      threshold: 1.0 // Trigger when 100% of the element is visible in the rootMargin target
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const circle = d3.select(entry.target);
            const data = {
                title: circle.attr("data-title"),
                description: circle.attr("data-description"),
                year: circle.attr("data-year"),
                type: circle.attr("data-type")
            };

            if (entry.isIntersecting) {
                // Highlight the point
                points.transition().duration(200).attr("r", 8).attr("opacity", 0.3);
                circle.transition().duration(200).attr("r", 12).attr("opacity", 1);
                
                // Update the info panel
                infoPanel.html(`
                    <span style="color: ${color(data.type)}; font-weight: bold; text-transform: uppercase; font-size: 0.9em;">${data.type} Honor (${data.year})</span>
                    <h3 style="margin-top: 5px; margin-bottom: 5px;">${data.title}</h3>
                    <p style="margin: 0; font-size: 0.9em;">${data.description}</p>
                `)
                .style("border-left-color", color(data.type));

            } else {
                // Dim the point when scrolling away (handled by the .isIntersecting block above)
            }
        });
    }, observerOptions);

    // Attach the observer to all points
    points.each(function() {
        observer.observe(this);
    });

}

// Use a self-invoking function or window.onload to ensure it runs
window.addEventListener('load', () => {
    // You must add an HTML element with this ID: <div id="timeline-container"></div>
    createScrollyTimeline('#timeline-container');
});