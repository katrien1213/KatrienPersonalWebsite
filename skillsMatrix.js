document.addEventListener("DOMContentLoaded", function() {

  const width = 800;
  const height = 800;
  const margin = { top: 180, right: 50, bottom: 50, left: 180 };
  const cellSize = 25;

  const svg = d3.select("#skills-matrix")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // --- 分组信息 & 缩短标签 ---
  const groups = [
    { name: "Software", nodes: ["Unity","UE5","Blender","SubstancePainter","Nomad","P5js","Processing","Spyder","VSCode","AE","XD","PS","Procreate","Figma"], color: "#6baed6" },
    { name: "Programming", nodes: ["C#","C++","HTML","Java","Python"], color: "#9ecae1" },
    { name: "ML", nodes: ["Scikit-learn","PyTorch","TensorFlow"], color: "#74c476" },
    { name: "Languages", nodes: ["ENG7","CN","DE","CANT"], color: "#fdae6b" },
    { name: "Sport", nodes: ["Tennis","Golf"], color: "#e377c2" }
  ];

  // --- 构建节点数组（含分类信息） ---
  let nodes = ["Skills"];
  let nodeGroups = ["root"];
  groups.forEach(g => {
    nodes.push(g.name);
    nodeGroups.push("category");
    g.nodes.forEach(n => {
      nodes.push(n);
      nodeGroups.push(g.name);
    });
  });

  // --- 构建邻接矩阵 ---
  const nodeIndex = {};
  nodes.forEach((d,i)=> nodeIndex[d]=i);

  const matrix = Array.from({length: nodes.length}, () => Array(nodes.length).fill(0));

  // Skills 连接各类别
  groups.forEach(g => {
    matrix[nodeIndex["Skills"]][nodeIndex[g.name]] = 1;
    matrix[nodeIndex[g.name]][nodeIndex["Skills"]] = 1;
    // 类别连接子节点
    g.nodes.forEach(n => {
      matrix[nodeIndex[g.name]][nodeIndex[n]] = 1;
      matrix[nodeIndex[n]][nodeIndex[g.name]] = 1;
    });
  });

  // --- 绘制矩阵格子 ---
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const rows = g.selectAll(".row")
    .data(matrix)
    .enter()
    .append("g")
    .attr("class","row")
    .attr("transform",(d,i)=>`translate(0,${i*cellSize})`);

  rows.selectAll(".cell")
    .data(d=>d)
    .enter()
    .append("rect")
    .attr("x",(d,i)=>i*cellSize)
    .attr("width",cellSize-1)
    .attr("height",cellSize-1)
    .attr("fill",d => d===1 ? "#4682B4" : "#f0f0f0")
    .attr("stroke","#ccc");

  // --- 横向标签 ---
  const xLabels = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top-5})`);

  xLabels.selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("x",(d,i)=>i*cellSize + cellSize/2)
    .attr("y",0)
    .attr("text-anchor","start")
    .attr("transform",(d,i)=>`rotate(-90,${i*cellSize + cellSize/2},0)`)
    .attr("font-size","10px")
    .text(d=>d);

  // --- 纵向标签 ---
  const yLabels = svg.append("g")
    .attr("transform", `translate(${margin.left-5},${margin.top})`);

  yLabels.selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("x",0)
    .attr("y",(d,i)=>i*cellSize + cellSize/2)
    .attr("text-anchor","end")
    .attr("dominant-baseline","middle")
    .attr("font-size","10px")
    .text(d=>d);

  // --- 给类别节点上色 ---
  nodes.forEach((n,i)=>{
    let color = "#4682B4"; // 默认蓝色
    groups.forEach(g=>{
      if(n === g.name) color = g.color;
      if(g.nodes.includes(n)) color = g.color;
    });
    g.selectAll(".row").filter((d,ri)=>ri===i)
      .selectAll("rect")
      .attr("fill",(d,j)=> d===1 ? color : "#f0f0f0");
  });

});

