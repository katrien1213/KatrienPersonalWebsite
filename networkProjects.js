document.addEventListener("DOMContentLoaded", function() {

  // 1. DATA
  const projectNodes = [
    { id: "Generative Calligraphy", year: "2023.08", tech: "P5.js, ML Object Detection", desc: "Interactive calligraphy interpreting gestures via ML classification.", image: "calligraphy.JPG" },
    { id: "Feminine Animation", year: "2023.10", tech: "Unity, Nomad, AE", desc: "Experimental animation blending 2D hand drawings and 3D abstraction.", image: "fem.JPG" },
    { id: "Integrative Sculpture", year: "2024.01", tech: "Blender, Arduino", desc: "Interactive sculpture using sensors and air pumps to simulate life.", image: "sculpture.JPG" },
    { id: "Buddha Restoration", year: "2024.06", tech: "Python, PyTorch, KNN", desc: "ML-based restoration of Buddhist sculptures using reconstruction algos.", image: "buddha_img.jpg" },
     { id: "Eye Tracking Reader", year: "2025.10", tech: "Python, Tobii SDK, NLP", desc: "A hands-free reading interface controlled by gaze fixation and blinking.", image: "project1_image.jpg" },
     { id: "VR Motion Trace", year: "2025.11", tech: "Unity, Oculus SDK, C#", desc: "Visualizing dance movements in 3D space using VR controller tracking.", image: "VRtrace_img.png" },
  ];

  // Generate sequential links
  const projectLinks = [];
  for (let i = 0; i < projectNodes.length - 1; i++) {
    projectLinks.push({ source: projectNodes[i].id, target: projectNodes[i+1].id });
  }

  // 2. SVG CONFIG (Narrower dimensions)
  const containerId = "#project-network";
  d3.select(containerId).selectAll("*").remove();

  const width = 800;  // Tighter width
  const height = 280; // Tighter height
  const nodeRadius = 35;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", `${width}px`)
    .style("overflow", "visible"); // Allow ripples to expand outside bounds
  // Add background rect
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#water-grade)")
    .style("pointer-events", "none"); // Let clicks pass through

  // 3. IMAGE PATTERNS
  const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
  
  projectNodes.forEach((d, i) => {
    const pattern = defs.append("pattern")
      .attr("id", `pattern-proj-${i}`)
      .attr("patternUnits", "objectBoundingBox") 
      // --- THE FIX IS THIS LINE BELOW ---
      .attr("patternContentUnits", "objectBoundingBox") 
      .attr("width", 1)
      .attr("height", 1);

    // Background rect (optional, helps if image is transparent)
    pattern.append("rect")
        .attr("width", 1) // Fix: changed from 100 to 1 (since we are using 0-1 scale now)
        .attr("height", 1)
        .attr("fill", "#f3f4f6");

    pattern.append("image")
      .attr("href", d.image)
      .attr("xlink:href", d.image) // Safety for Safari/older browsers
      .attr("width", 1)   // Now "1" means 100% because of patternContentUnits
      .attr("height", 1)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .on("error", function() { 
          console.log("Failed to load:", d.image); // Debug log
          d3.select(this).attr("href", "https://placehold.co/100"); 
      });
  });

  // 4. SCALES & PHYSICS (Elastic Configuration)
  const xScale = d3.scaleLinear()
    .domain([0, projectNodes.length - 1])
    .range([80, width - 80]); // Adjusted range for narrower width

  const simulation = d3.forceSimulation(projectNodes)
    // Elastic Forces: Weak strengths allow bounce
    .force("x", d3.forceX((d, i) => xScale(i)).strength(0.1)) // Very soft pull to horizontal position
    .force("y", d3.forceY(height / 2).strength(0.05))      // Very soft pull to center line
    .force("charge", d3.forceManyBody().strength(-300))    // Stronger repulsion for bounce
    .force("link", d3.forceLink(projectLinks).id(d => d.id).strength(0.01).distance(120)) // Weak links act like soft springs
    .force("collision", d3.forceCollide(nodeRadius + 15).iterations(4)); // Prevent overlap

  // 5. DRAW ELEMENTS
  // Links (Dashed, subtle)
  const link = svg.append("g")
    .selectAll("line")
    .data(projectLinks)
    .enter().append("line")
    .attr("stroke", "#9ca3af")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4,6")
    .attr("opacity", 0.5);

  // Nodes
  const node = svg.append("g")
    .selectAll(".node")
    .data(projectNodes)
    .enter().append("g")
    .attr("class", "node")
    .style("cursor", "grab")
    .call(d3.drag()
      .on("start", dragStart)
      .on("drag", dragged)
      .on("end", dragEnd)
    );

  // A. The Ripple Circle (CSS Animated)
  node.append("circle")
    .attr("class", "ripple-circle")
    .attr("r", nodeRadius)
    .attr("cx", 0).attr("cy", 0);

  // B. Main Image Circle
  node.append("circle")
    .attr("r", nodeRadius)
    .attr("fill", (d, i) => `url(#pattern-proj-${i})`)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(0 4px 8px rgba(37, 99, 235, 0.2))"); // Slight blue shadow

  // C. Labels
  node.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -nodeRadius - 10)
    .text(d => d.year)
    .style("font-size", "10px")
    .style("fill", "#6b7280")
    .style("font-weight", "600");

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("y", nodeRadius + 18)
    .text(d => d.id)
    .style("font-size", "11px")
    .style("fill", "#111827")
    .style("font-weight", "600")
    .call(wrap, 110);

  // 6. TOOLTIP (Same as before)
  const tooltip = d3.select("body").append("div")
    .attr("class", "network-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.98)")
    .style("padding", "12px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 10px 20px -5px rgba(0,0,0,0.15)")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "12px")
    .style("max-width", "260px")
    .style("z-index", "1000")
    .style("border", "1px solid #e5e7eb");

  // 7. INTERACTION
  node
    .on("mouseover", (event, d) => {
      // Slight enlarge on hover
      d3.select(event.currentTarget).select("circle:nth-child(2)")
        .transition().duration(300).ease(d3.easeBackOut)
        .attr("transform", "scale(1.15)");

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <div style="margin-bottom:4px; font-weight:700; color:#111;">${d.id}</div>
        <div style="margin-bottom:6px; color:#2563eb; font-size:10px; font-weight:600;">${d.tech}</div>
        <div style="color:#4b5563; line-height:1.5;">${d.desc}</div>
      `)
      .style("left", (event.pageX + 20) + "px")
      .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget).select("circle:nth-child(2)")
        .transition().duration(300)
        .attr("transform", "scale(1)");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // 8. SIMULATION TICK
  simulation.on("tick", () => {
    // Add a slight "dampening" effect to keep them bounded vertically
    projectNodes.forEach(d => { d.y = Math.max(nodeRadius+10, Math.min(height - nodeRadius-10, d.y)); });

    link
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // 9. DRAG FUNCTIONS (Crucial for elastic feel)
  function dragStart(event, d) {
    if (!event.active) simulation.alphaTarget(0.2).restart(); // Low alpha for gentle restart
    d.fx = d.x;
    d.fy = d.y;
    d3.select(this).style("cursor", "grabbing");
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragEnd(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    // Crucial: Release fx/fy so the weak physics pull them back elastically
    d.fx = null; 
    d.fy = null;
    d3.select(this).style("cursor", "grab");
  }

  // Helper for wrapping text
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this), words = text.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.1, y = text.attr("y"), dy = parseFloat(text.attr("dy") || 0), tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop(); tspan.text(line.join(" ")); line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

});