document.addEventListener("DOMContentLoaded", function() {
  const width = 1000;
  const height = 600;

  const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 背景海洋
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#a6cee3"); // 柔和浅蓝

  const projection = d3.geoNaturalEarth1()
    .scale(180)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath(projection);

  // 颜色
  const colorVisited = "#a8db51ff"; // 红色
  const colorStudied = "#8045c4ff"; // 蓝色

  // 数据
  const visitedPlaces = [
    { name: "Shanghai", coords: [121.4737, 31.2304] },
    { name: "Xiamen", coords: [118.0894, 24.4798] },
    { name: "Xinjiang", coords: [87.6177, 43.7928] },
    { name: "Xizang", coords: [91.1172, 29.6469] },
    { name: "Shenzhen", coords: [114.0579, 22.5431] },
    { name: "Sanya", coords: [109.5121, 18.2528] },
    { name: "Paris", coords: [2.3522, 48.8566] },
    { name: "Milano", coords: [9.19, 45.4642] },
    { name: "Luzern", coords: [8.3059, 47.0502] },
    { name: "Lugano", coords: [8.9511, 46.0037] },
    { name: "Barcelona", coords: [2.1734, 41.3851] },
    { name: "Malaga", coords: [-4.4214, 36.7213] },
    { name: "Greece", coords: [23.7275, 37.9838] }
  ];

  const studiedPlaces = [
    { name: "Dalian", coords: [121.6147, 38.914] },
    { name: "Hong Kong", coords: [114.1694, 22.3193] },
    { name: "London", coords: [-0.1276, 51.5072] },
    { name: "Zurich", coords: [8.5417, 47.3769] },
    { name: "Seoul", coords: [126.978, 37.5665] }
  ];

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(255,255,255,0.9)")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "12px")
    .style("font-weight", "bold");

  function showTooltip(event, d) {
    tooltip.style("opacity", 1)
      .html(d.name)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }

  // 加载地图
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(world => {
      // 绘制陆地
      svg.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#f7f1e1") // 温暖米色陆地
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);

      // 绘制Visited点
      svg.selectAll(".visited")
        .data(visitedPlaces)
        .enter()
        .append("circle")
        .attr("class", "visited")
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1])
        .attr("r", 6)
        .attr("fill", colorVisited)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.2)
        .attr("opacity", 0.9)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

      // 绘制Studied点
      svg.selectAll(".studied")
        .data(studiedPlaces)
        .enter()
        .append("circle")
        .attr("class", "studied")
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1])
        .attr("r", 6)
        .attr("fill", colorStudied)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.9)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

      // 图例
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 200}, 40)`);

      legend.append("circle").attr("r", 7).attr("fill", colorVisited);
      legend.append("text").attr("x", 15).attr("y", 5).text("Visited Cities").style("font-size","12px").style("font-weight","bold");

      legend.append("circle").attr("r", 7).attr("fill", colorStudied).attr("cy", 25);
      legend.append("text").attr("x", 15).attr("y", 30).text("Studied Cities").style("font-size","12px").style("font-weight","bold");
    })
    .catch(err => console.error("Error loading GeoJSON:", err));

});
