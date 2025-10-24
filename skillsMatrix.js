document.addEventListener("DOMContentLoaded", function() {
  const width = 1000;
  const height = 1000;
  const margin = { top: 200, right: 50, bottom: 50, left: 200 };
  const cellSize = 25;

  const svg = d3.select("#skills-matrix")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // --- 数据 ---
  const categories = [
    { name: "Software", nodes: ["Unity","UE5","Blender","SubstancePainter","Nomad","P5js","Processing","Spyder","VSCode","AE","XD","Photoshop","Procreate","Figma"], color:"#6baed6" },
    { name: "Programming", nodes: ["C#","C++","HTML","Java","Python"], color:"#9ecae1" },
    { name: "ML Frameworks", nodes: ["Scikit-learn","PyTorch","TensorFlow"], color:"#74c476" },
    { name: "Languages", nodes: ["ENG7","CN","DE","CANT"], color:"#fdae6b" },
    { name: "Sport", nodes: ["Tennis","Golf"], color:"#e377c2" }
  ];

  // --- 展平节点列表并记录索引 ---
  let nodes = [];
  let nodeCategory = {};
  categories.forEach(cat => {
    cat.nodes.forEach(n => {
      nodes.push(n);
      nodeCategory[n] = cat.name;
    });
  });

  const nodeIndex = {};
  nodes.forEach((d,i)=>nodeIndex[d]=i);

  // --- 构建邻接矩阵 ---
  const matrix = Array.from({length:nodes.length},()=>Array(nodes.length).fill(0));

  // root节点和类别节点连接
  categories.forEach(cat => {
    cat.nodes.forEach(n => {
      const i = nodeIndex[n];
      const j = nodeIndex[cat.name] = -1; // 类别节点不放在矩阵里
      matrix[i][i] = 0; // 自己对自己可设为0
    });
  });

  // 类别间或软件等子节点之间的可视化边：可用1填充
  categories.forEach(cat=>{
    const catNodes = cat.nodes;
    for(let i=0;i<catNodes.length;i++){
      for(let j=i+1;j<catNodes.length;j++){
        matrix[nodeIndex[catNodes[i]]][nodeIndex[catNodes[j]]] = 1;
        matrix[nodeIndex[catNodes[j]]][nodeIndex[catNodes[i]]] = 1;
      }
    }
  });

  // --- 绘制矩阵 ---
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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
    .attr("class","cell")
    .attr("x",(d,i)=>i*cellSize)
    .attr("width",cellSize-1)
    .attr("height",cellSize-1)
    .attr("fill",(d,i,j)=> d===1 ? categories.find(c=>c.nodes.includes(nodes[i])).color : "#f0f0f0")
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

});
