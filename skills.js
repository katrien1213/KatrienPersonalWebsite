document.addEventListener("DOMContentLoaded", function() {
  const width = 800;
  const height = 800;

  const svg = d3.select("#vis-skills")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

  // --- Data structure ---
  const data = {
    nodes: [
      { id: "Skills", group: "root" },
      { id: "Software", group: "category" },
      { id: "Programming Languages", group: "category" },
      { id: "Machine Learning Frameworks", group: "category" },
      { id: "Languages", group: "category" },
      { id: "Sport", group: "category" },

      // Software
      { id: "Unity", group: "software" },
      { id: "UE5", group: "software" },
      { id: "Blender", group: "software" },
      { id: "SubstancePainter", group: "software" },
      { id: "Nomad", group: "software" },
      { id: "P5.js", group: "software" },
      { id: "Processing", group: "software" },
      { id: "Spyder", group: "software" },
      { id: "Visual Studio Code", group: "software" },
      { id: "AfterEffect", group: "software" },
      { id: "Adobe XD", group: "software" },
      { id: "Photoshop", group: "software" },
      { id: "Procreate", group: "software" },
      { id: "Figma", group: "software" },

      // Programming
      { id: "C#", group: "programming" },
      { id: "C++", group: "programming" },
      { id: "HTML", group: "programming" },
      { id: "Java", group: "programming" },
      { id: "Python", group: "programming" },

      // ML Frameworks
      { id: "Scikit-learn", group: "ml" },
      { id: "PyTorch", group: "ml" },
      { id: "TensorFlow", group: "ml" },

      // Languages
      { id: "English (IELTS 7.0)", group: "language" },
      { id: "Mandarin (Native)", group: "language" },
      { id: "German (A1)", group: "language" },
      { id: "Cantonese (Basic)", group: "language" },

      // Sport
      { id: "Tennis (USFHK Champion)", group: "sport" },
      { id: "Golf (Handicap 10)", group: "sport" }
    ],
    links: [
      { source: "Skills", target: "Software" },
      { source: "Skills", target: "Programming Languages" },
      { source: "Skills", target: "Machine Learning Frameworks" },
      { source: "Skills", target: "Languages" },
      { source: "Skills", target: "Sport" },

      // Software links
      ...["Unity","UE5","Blender","SubstancePainter","Nomad","P5.js","Processing","Spyder","Visual Studio Code","AfterEffect","Adobe XD","Photoshop","Procreate","Figma"].map(s => ({ source: "Software", target: s })),

      // Programming links
      ...["C#","C++","HTML","Java","Python"].map(s => ({ source: "Programming Languages", target: s })),

      // ML links
      ...["Scikit-learn","PyTorch","TensorFlow"].map(s => ({ source: "Machine Learning Frameworks", target: s })),

      // Languages links
      ...["English (IELTS 7.0)","Mandarin (Native)","German (A1)","Cantonese (Basic)"].map(s => ({ source: "Languages", target: s })),

      // Sport links
      ...["Tennis (USFHK Champion)","Golf (Handicap 10)"].map(s => ({ source: "Sport", target: s }))
    ]
  };

  // --- Color palette ---
  const color = d3.scaleOrdinal()
    .domain(["root","category","software","programming","ml","language","sport"])
    .range(["#1f77b4","#ff7f0e","#6baed6","#9ecae1","#74c476","#fdae6b","#e377c2"]);

  // --- Force simulation ---
  const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(40));

  // --- Draw links ---
  const link = svg.append("g")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 1.5);

  // --- Draw nodes ---
  const node = svg.append("g")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", d => d.group === "root" ? 14 : d.group === "category" ? 10 : 6)
    .attr("fill", d => color(d.group))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // --- Labels ---
  const label = svg.append("g")
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
    .text(d => d.id)
    .attr("font-size", "10px")
    .attr("dx", 10)
    .attr("dy", 3)
    .attr("fill", "#333");

  // --- Update positions ---
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });

  // --- Drag behavior ---
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

});
