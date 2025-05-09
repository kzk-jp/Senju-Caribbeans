fetch("data.json")
  .then(response => response.json())
  .then(jsonData => {
    const dx = 110;
    const dy = 140;
    const treeLayout = d3.tree().nodeSize([dy, dx]);

    const groupedData = d3.group(jsonData, d => d.introduction_reason || "未分類");
    const svg = d3.select("#tree-svg");
    const svgWidth = 2000;
    let totalHeight = 0;

    svg.attr("width", svgWidth);
    const g = svg.append("g");

    groupedData.forEach((group) => {
      group.forEach((rootData) => {
        const root = d3.hierarchy(rootData);
        treeLayout(root);

        let x0 = Infinity, x1 = -Infinity;
        root.each(d => {
          if (d.x < x0) x0 = d.x;
          if (d.x > x1) x1 = d.x;
        });

        const subtreeHeight = (root.height + 1) * dx + 80;
        const offsetX = (svgWidth / 2) - ((x1 + x0) / 2);
        const offsetY = totalHeight + 40;

        const subtreeG = g.append("g")
          .attr("transform", `translate(${offsetX}, ${offsetY})`);

        subtreeG.append("g")
          .selectAll("path")
          .data(root.links())
          .join("path")
          .attr("class", "link")
          .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
          );

        const node = subtreeG.append("g")
          .selectAll("g")
          .data(root.descendants())
          .join("g")
          .attr("transform", d => `translate(${d.x},${d.y})`);

        const nodeCard = node.append("foreignObject")
          .attr("x", -50)
          .attr("y", -40)
          .attr("width", 100)
          .attr("height", 100)
          .append("xhtml:div")
          .attr("class", "node-card");

        nodeCard.append("img")
          .attr("class", "node-image")
          .attr("src", d => d.data.image || "")
          .attr("alt", "photo");

        nodeCard.append("a")
          .attr("href", d => d.data.page_url || "#")
          .attr("target", "_blank")
          .append("div")
          .attr("class", "node-name")
          .text(d => d.data.name);

        totalHeight += subtreeHeight;
      });
    });

    svg.attr("height", totalHeight + 60);
  })
  .catch(err => {
    document.getElementById("chart-container").textContent = "読み込みエラー: " + err;
  });
