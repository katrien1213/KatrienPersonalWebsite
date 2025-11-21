document.addEventListener("DOMContentLoaded", function() {

    // 1. DATA DEFINITION
    const dataTree = {
        name: "Academic & Projects",
        children: [
            {
                name: "Eye Tracking PDF Reader",
                children: [
                    { name: "Tools", children: [{name: "Python (NLP)"}, {name: "Tobii SDK"}, {name: "PyQt"}] },
                    { name: "Skills", children: [{name: "Gaze Interaction"}, {name: "Cognitive Load Analysis"}] },
                    { name: "Context", children: [{name: "Accessibility Design"}] }
                ]
            },
            {
                name: "VR Motion Trace",
                children: [
                    { name: "Tools", children: [{name: "Unity 3D"}, {name: "Meta Quest SDK"}, {name: "C#"}] },
                    { name: "Skills", children: [{name: "Spatial Mapping"}, {name: "Immersive Analytics"}] },
                    { name: "Context", children: [{name: "Digital Performance"}] }
                ]
            },
            {
                name: "Feminine Animation",
                children: [
                    { name: "Tools", children: [{name: "Unity"}, {name: "Nomad Sculpt"}, {name: "AfterEffects"}] },
                    { name: "Skills", children: [{name: "Visual Metaphor"}, {name: "2D-3D Hybrid"}] }
                ]
            },
            {
                name: "Buddha Restoration",
                children: [
                    { name: "Tools", children: [{name: "PyTorch"}, {name: "KNN Algorithms"}, {name: "NumPy"}] },
                    { name: "Context", children: [{name: "Cultural Heritage"}, {name: "AI Reconstruction"}] }
                ]
            },
            {
                name: "Generative Calligraphy",
                children: [
                    { name: "Tools", children: [{name: "P5.js"}, {name: "ML5.js (Object Detect)"}] },
                    { name: "Skills", children: [{name: "Gesture Interaction"}, {name: "Generative Art"}] }
                ]
            },
            {
                name: "Integrative Sculpture",
                children: [
                    { name: "Tools", children: [{name: "Arduino"}, {name: "Blender (3D Print)"}, {name: "Pneumatics"}] },
                    { name: "Context", children: [{name: "Physical Computing"}] }
                ]
            }
        ]
    };

    // 2. SETUP DIMENSIONS & ZOOM
    const container = document.getElementById("vis-tree");
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#vis-tree").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))
        .append("g")
        .attr("transform", "translate(100,0)"); // Initial offset

    const g = svg.append("g");

    // 3. TREE LAYOUT CONFIG
    // Switch rows/cols if you want vertical vs horizontal
    const tree = d3.tree().nodeSize([40, 180]); // [Vertical Spacing, Horizontal Spacing]
    let root = d3.hierarchy(dataTree, d => d.children);
    
    // Collapse all children after depth 1 initially (Optional)
    // root.children.forEach(collapse); 

    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    // 4. THE UPDATE FUNCTION (Handles Animation)
    function update(source) {
        const duration = 500; // Animation speed
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        tree(root);

        // Normalize for fixed-depth.
        nodes.forEach(d => { d.y = d.depth * 220; }); // Horizontal distance between levels

        // --- NODES ---
        const node = g.selectAll("g.node")
            .data(nodes, d => d.id || (d.id = ++i));

        // Enter new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .on("click", click);

        // Add Circle
        nodeEnter.append("circle")
            .attr("class", "node")
            .attr("r", 1e-6)
            .style("fill", d => d._children ? "#c10df3dd" : "#fff") // Blue if collapsed, White if leaf
            .style("stroke", d => d.depth === 0 ? "#111" : "#c10df3dd"); // Root black, others blue

        // Add Text
        nodeEnter.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children || d._children ? -13 : 13)
            .attr("text-anchor", d => d.children || d._children ? "end" : "start")
            .text(d => d.data.name)
            .style("fill-opacity", 1e-6);

        // UPDATE transition
        const nodeUpdate = node.merge(nodeEnter).transition().duration(duration)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        nodeUpdate.select("circle")
            .attr("r", 8) // Circle Size
            .style("fill", d => d._children ? "#c10df3dd" : "#fff")
            .attr("cursor", "pointer");

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // EXIT transition
        const nodeExit = node.exit().transition().duration(duration)
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .remove();

        nodeExit.select("circle").attr("r", 1e-6);
        nodeExit.select("text").style("fill-opacity", 1e-6);

        // --- LINKS ---
        const link = g.selectAll("path.link")
            .data(links, d => d.target.id);

        // Enter links
        const linkEnter = link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", d => {
                const o = {x: source.x0, y: source.y0};
                return diagonal(o, o);
            });

        // Update links
        const linkUpdate = link.merge(linkEnter).transition().duration(duration)
            .attr("d", d => diagonal(d.source, d.target));

        // Exit links
        link.exit().transition().duration(duration)
            .attr("d", d => {
                const o = {x: source.x, y: source.y};
                return diagonal(o, o);
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Center the view on first load
        if(source === root && !window.centered) {
            window.centered = true;
            // Initial center logic roughly puts root on left
            const initialTransform = d3.zoomIdentity.translate(100, height/2);
            svg.call(d3.zoom().transform, initialTransform);
        }
    }

    // Helper: Curved Path Generator
    function diagonal(s, d) {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
    }

    // Helper: Collapse function
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    // Helper: Click handler
    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    let i = 0;
});