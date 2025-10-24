// =========================
// Project Node-Link Diagram
// =========================

document.addEventListener("DOMContentLoaded", function() {

  // --- Data ---
  const projectNodes = [
    {
      id: "Feminine Animation",
      year: "2024.06",
      tech: "Unity, Nomad, Procreate, AfterEffect",
      desc: "An experimental animation blending 2D hand drawings and 3D abstraction. Screened internationally at Cinémathèque Québécoise and Lugano Animation Days.",
      image: "fem.JPG"
    },
    {
      id: "Buddha Heritage Restoration",
      year: "2024.01",
      tech: "Python, PyTorch, NumPy, Scikit-learn",
      desc: "A machine-learning-based restoration of Buddhist sculptures using KNN for reconstructing incomplete statues, combining technology and cultural preservation.",
      image: "Buddha.JPG"
    },
    {
      id: "Integrative Sculpture",
      year: "2024.12",
      tech: "Blender, Arduino, 3D Printing",
      desc: "An interactive sculpture using Arduino sensors and air pumps, exploring fertilization through kinetic and sculptural abstraction.",
      image: "sculpture.JPG"
    },
    {
      id: "Generative Calligraphy",
      year: "2023.08",
      tech: "P5.js, ML in Object Detection",
      desc: "Interactive calligraphy artwork interpreting user gestures via ML classification, merging traditional brush aesthetics with generative computation.",
      image: "calligraphy.JPG"
    }
  ];

  const projectLinks = [
    { source: "Generative Calligraphy", target: "Feminine Animation" },
    { source: "Feminine Animation", target: "Buddha Heritage Restoration" },
    { source: "Buddha Heritage Restoration", target: "Integrative Sculpture" }
  ];

  // --- SVG Setup ---
  const width = 1100;
  const height = 650;

  const svg = d3.select("#project-network")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    

  // --- Define patterns for each image ---
  const defs = svg.append("defs");

  projectNodes.forEach((d, i) => {
    const pattern = defs.append("pattern")
      .attr("id", `pattern-${i}`)
      .attr("patternUnits", "objectBoundingBox")
      .attr("width", 1)
      .attr("height", 1);

    pattern.append("image")
      .attr("href", d.image)
      .attr("width", 100)
      .attr("height", 100)
      .attr("preserveAspectRatio", "xMidYMid slice");
  });

  // --- Force Simulation ---
  const simulation = d3.forceSimulation(projectNodes)
    .force("link", d3.forceLink(projectLinks).id(d => d.id).distance(280).strength(0.6))
    .force("charge", d3.forceManyBody().strength(-250))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide(90));

  // --- Links ---
  const link = svg.selectAll(".link")
    .data(projectLinks)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 2)
    .attr("opacity", 0.8);

  // --- Nodes ---
  const node = svg.selectAll(".node")
    .data(projectNodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragStart)
      .on("drag", dragged)
      .on("end", dragEnd)
    );

  node.append("circle")
    .attr("r", 50)
    .attr("fill", (d, i) => `url(#pattern-${i})`)
    .attr("stroke", "#444")
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .style("filter", "drop-shadow(0px 3px 6px rgba(0,0,0,0.15))");

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 75)
    .attr("fill", "#222")
    .attr("font-size", "13px")
    .attr("font-weight", "600")
    .text(d => d.id);

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 92)
    .attr("fill", "#666")
    .attr("font-size", "11px")
    .text(d => d.year);

  // --- Tooltip ---
  const tooltip = d3.select("#project-network")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(255,255,255,0.95)")
    .style("padding", "10px 12px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 3px 10px rgba(0,0,0,0.1)")
    .style("font-size", "12px")
    .style("max-width", "280px")
    .style("line-height", "1.4em")
    .style("color", "#333")
    .style("opacity", 0)
    .style("pointer-events", "none");

  node
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.id}</strong><br><em>${d.tech}</em><br>${d.desc}`);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

  // --- Simulation tick ---
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // --- Drag handlers ---
  function dragStart(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragEnd(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});
