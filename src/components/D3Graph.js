import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMyContext } from '../contexts/Context';
import Legend from './Legend'; 
import "./D3Graph.css"


const D3Graph = ({ data }) => {
  const d3Container = useRef(null);
  const { graphData, graphFilter } = useMyContext();
  const [filterText, setFilterText] = useState(graphFilter); // Add this line


 
  const legendItems = [
    { color: "#9a7bc9", label: "Atomic Idea" },
    { color: "#ce772f", label: "Concept" },
    { color: "#44c14e", label: "Focused" }
  ];

  function createGraphFromData(graphData, filterText = null) {
    const nodes = [];
    const links = [];
    const conceptIndexMap = new Map();
  
    if (graphData == null) {
      return {nodes, links};
    }
  
    graphData.None.documents.forEach((doc, index) => {
      // Apply filter if filterText is provided and matches the document
      if (filterText === null || doc ===filterText) {
        if (!conceptIndexMap.has(doc)) {
          conceptIndexMap.set(doc, nodes.length); // Map concept to its node index
          nodes.push({ id: `Concept ${nodes.length + 1}`, type: "concept", content: doc });
        }
  
        // Create nodes for each note and links to associated concepts
        const metadata = graphData.None.metadatas[index];
        const noteId = `Note ${index + 1}`;
        nodes.push({ id: noteId, type: "note", content: metadata.note, date: metadata.date });
  
        // Link the note to its associated concept
        const conceptDoc = doc; // Already filtered by the if condition
        if (conceptIndexMap.has(conceptDoc)) {
          const conceptNodeId = nodes[conceptIndexMap.get(conceptDoc)].id;
          links.push({ source: noteId, target: conceptNodeId, value: 1 });
        }
      }
    });
  
    return { nodes, links };
  }



  useEffect(() => {

    const { nodes, links } = createGraphFromData(data, graphFilter);


    if (nodes.length && links.length && d3Container.current) {
      const svg = d3.select(d3Container.current);
      
      svg.selectAll("*").remove(); // Clear svg content before adding new elements

      const width = +svg.attr("width");
      const height = +svg.attr("height");

      // Define zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([1 / 4, 5]) // Example scale extent: min zoom = 0.5x, max zoom = 4x
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      // Apply the zoom behavior to the SVG
      svg.call(zoom);

      // Create a container group for all graph elements
      const g = svg.append("g");

      svg.call(zoom)
        .call(zoom.transform, d3.zoomIdentity.scale(0.4).translate(700, 600));

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

      // Append graph elements to the container group `g` instead of directly to `svg`
      const link = g.append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke-width", d => Math.sqrt(d.value));

      const node = g.append("g")
          .attr("stroke", "#9a7bc9")
          .attr("stroke-width", 1.5)
          .selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("r", 5)
          .attr("fill", color)
          .call(drag(simulation));

      node.append("title")
          .text(d => d.content);

      node.style("fill", d => d.type === "concept" ? "#ce772f" : "#9a7bc9");
      // Highlight connected nodes
      node.on("mouseover", (event, clickedNode) => {
        const isConnected = (node) => links.some(link => (link.source.id === clickedNode.id && link.target.id === node.id) || (link.target.id === clickedNode.id && link.source.id === node.id));
          
        // Reset all nodes to default color first, if needed
        node.style("fill", color);

        node.style("fill", d => isConnected(d) ? d.type === "concept" ? "#d99965" : "#c3a0da" : color());

        d3.select(event.currentTarget).style("fill", "#44c14e");

        link.style("stroke", d => d.source.id === clickedNode.id || d.target.id === clickedNode.id ? "#c3a0da" : "#999");
    
    });
  


    node.on("mouseleave", (event, clickedNode) => {
        
      node.style("fill", d => d.type === "concept" ? "#ce772f" : "#9a7bc9");
        // Reset all nodes to default color first, if needed
        link.style("stroke", "#999");
  });

      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
      });

      function color() {
        return "#666";
      }

      function drag(simulation) {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      }
    }
  }, [graphData, graphFilter]); // Redraw graph when nodes or links change

  return (
    <div className="graph-container">
      <Legend items={legendItems} />
    <svg
      key={filterText}
      className="d3-component"
      width={870}
      height={900}
      ref={d3Container}
    />
    </div>
  );
};

export default D3Graph;