document.addEventListener("DOMContentLoaded", function() {

  // --- Setup SVG dimensions ---
  const margin = { top: 40, right: 150, bottom: 40, left: 10 };
  const width = 800 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  // --- Append SVG inside #vis-tree ---
  const svgTree = d3.select("#vis-tree")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- Hierarchical data ---
  const dataTree = {
    name: "Projects",
    children: [
      {
        name: "Experimental Animation “Feminine” (2024.06)",
        children: [
          {
            name: "Technical",
            children: [
              {
                name: "Tools",
                children: [
                  { name: "Unity" },
                  { name: "Nomad" },
                  { name: "Procreate" },
                  { name: "AfterEffect" }
                ]
              },
              {
                name: "Skills",
                children: [
                  { name: "2D–3D Hybrid Animation" },
                  { name: "Optical Illusion & Sound Design" },
                  { name: "Visual Metaphor Construction" }
                ]
              },
              {
                name: "Context",
                children: [
                  { name: "Digital Aesthetics Exploration" },
                  { name: "International Screenings (Montreal, Switzerland)" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Machine Learning Buddha Heritage Animation (2024.01)",
        children: [
          {
            name: "Technical",
            children: [
              {
                name: "Tools",
                children: [
                  { name: "Python" },
                  { name: "PyTorch" },
                  { name: "NumPy" },
                  { name: "Scikit-learn" }
                ]
              },
              {
                name: "Skills",
                children: [
                  { name: "KNN Model Training" },
                  { name: "Generative Restoration" },
                  { name: "Flow-Machine Regeneration" }
                ]
              },
              {
                name: "Context",
                children: [
                  { name: "Cultural Heritage Preservation" },
                  { name: "AI & Spiritual Reconstruction" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Physical Computing Integrative Sculpture (2024.12)",
        children: [
          {
            name: "Technical",
            children: [
              {
                name: "Tools",
                children: [
                  { name: "Blender" },
                  { name: "Arduino" },
                  { name: "3D Printing" }
                ]
              },
              {
                name: "Skills",
                children: [
                  { name: "Interactive Sculpture Design" },
                  { name: "Sensor & Air Pump Integration" },
                  { name: "Physical Computing" }
                ]
              },
              {
                name: "Context",
                children: [
                  { name: "Art–Technology Intersection" },
                  { name: "Physiological Aesthetic Exploration" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Realtime Generative Calligraphy Artwork (2023.08)",
        children: [
          {
            name: "Technical",
            children: [
              {
                name: "Tools",
                children: [
                  { name: "P5.js" },
                  { name: "Machine Learning (Object Detection)" }
                ]
              },
              {
                name: "Skills",
                children: [
                  { name: "Gesture Interaction Design" },
                  { name: "Generative Visual Composition" }
                ]
              },
              {
                name: "Context",
                children: [
                  { name: "Bridging Traditional Calligraphy & Computation" },
                  { name: "Realtime Interactive Aesthetic" }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  // --- Create tree layout ---
  const root = d3.hierarchy(dataTree);
  const treeLayout = d3.tree().size([height, width]);
  treeLayout(root);

  // --- Links ---
  svgTree.selectAll("path.link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5)
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

  // --- Nodes ---
  const nodes = svgTree.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  // --- Node circles ---
  nodes.append("circle")
    .attr("r", 5)
    .attr("fill", d => d.children ? "#4682B4" : "#87CEEB");

  // --- Node labels ---
  nodes.append("text")
    .attr("dy", d => d.children ? "1.5em" : "0.35em") // below for parent nodes, center for leaves
    .attr("x", d => d.children ? 0 : 10) // for leaf nodes, text goes right of circle
    .attr("text-anchor", d => d.children ? "middle" : "start") // center for parents, start for leaves
    .style("font-size", "11px")
    .style("fill", "#333")
    .text(d => d.data.name);
    
});

