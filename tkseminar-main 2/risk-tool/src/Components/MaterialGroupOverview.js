import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./LineGraph.css";
import "./MaterialGroupOverview.css";

import configData from "../web.config.json";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
const SERVER_URL = configData.BACKEND_URL;

const MaterialGroupOverview = ({ id, onHide, show, name, unit }) => {
  const [dataSet, setDataSet] = useState(undefined);
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [today, setToday] = useState(new Date("21 November 2022 00:00"));
  const [forecast, setForecast] = useState(new Date("21 November 2022 00:00"));
  const [scenarios, setScenarios] = useState([]);
  const svgContainer = useRef(null); // The PARENT of the SVG
  const groupUrl = new URL(SERVER_URL + "/get_group_overview_graph");
  groupUrl.searchParams.set("value", id);
  const scenariosUrl = new URL(SERVER_URL + "/get_scenarios");
  const networkUrl = new URL(SERVER_URL + "/get_network");
  const getSvgContainerSize = () => {
    const newWidth = svgContainer.current.clientWidth;
    setWidth(newWidth);
    const newHeight = svgContainer.current.clientHeight;
    setHeight(newHeight);
  };

  useEffect(() => {
    // detect 'width' and 'height' on render
    getSvgContainerSize();
    // listen for resize changes, and detect dimensions again when they change
    window.addEventListener("resize", getSvgContainerSize);
    // cleanup event listener
    return () => window.removeEventListener("resize", getSvgContainerSize);
  }, []);

  async function fetchData() {
    let newDataSet = await d3.csv(groupUrl);
    if (newDataSet) setDataSet(newDataSet);
  }
  useEffect(() => {
    fetchData();

    fetch(scenariosUrl)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        let networksPromises = [];
        const scenarios_name = [];
        for (const key in json["scenario_name"]) {
          if (Object.hasOwnProperty.call(json["scenario_name"], key)) {
            const element = json["scenario_name"][key];
            scenarios_name.push(element);
            networkUrl.searchParams.set("m_id", id);
            networkUrl.searchParams.set("s_id", key);
            networksPromises.push(fetch(networkUrl));
          }
        }
        Promise.all(networksPromises)
          .then(async (res) => {
            return await Promise.all(res.map((res) => res.json()));
          })
          .then((res) => {
            setScenarios(
              res.map((res, index) => {
                return {
                  key: scenarios_name[index],
                  value: res.attributes.new_expected_value,
                };
              })
            );
          });
        // console.log(networksPromises);
      });
  }, []);

  useEffect(() => {
    if (!dataSet) return;

    drawGraph();
  }, [svgRef.current, width, height, forecast, dataSet]);

  function drawGraph() {
    // Accessors
    const parseDate = d3.timeParse("%Y-%m-%d");
    let xAccessor;
    let yAccessor;
    // variable accessor depending on datatype

    xAccessor = (d) => parseDate(d.date);
    yAccessor = (d) => +d.value;

    // Dimensions
    let dimensions = {
      width: width, // width from state
      height: 550, // height from state
      margins: 75,
    };

    dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

    // SELECTIONS
    const svg = d3
      .select(svgRef.current)
      .classed("line-chart", true)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // clear all previous content on refresh
    const everything = svg.selectAll("*");
    everything.remove();

    const container = svg
      .append("g")
      .classed("container", true)
      .attr(
        "transform",
        `translate(${dimensions.margins}, ${dimensions.margins})`
      );

    const tooltip = d3.select(tooltipRef.current);

    const tooltipDot = container
      .append("circle")
      .classed("tool-tip-dot", true)
      .attr("r", 5)
      .attr("fill", "#212529")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .style("pointer-events", "none");

    // Set Min Max
    const yMinValue = d3.min(dataSet, yAccessor),
      yMaxValue = d3.max(dataSet, yAccessor);

    // Scales
    const yScale = d3
      .scaleLinear()
      .domain([yMinValue - 1, yMaxValue + 2])
      .range([dimensions.containerHeight, 0]);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataSet, xAccessor))
      .range([0, dimensions.containerWidth]);

    container
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -75)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .attr("fill", "#666666")
      .text("in " + unit);

    // Line Generator
    const areaGenerator = d3
      .area()
      .x((d) => xScale(xAccessor(d)))
      .y0(yScale(0 + yMinValue - 1))
      .y1((d) => yScale(yAccessor(d)));

    // Draw Line Past
    container
      .append("path")
      .datum(dataSet)
      .attr("fill", "#336E96")
      .attr("stroke", "#014b7c")
      .attr("stroke-width", 1.6)
      .attr("d", areaGenerator);

    // Draw Line Selected
    // container
    //   .append("path")
    //   .datum(
    //     dataSet.filter(function (d) {
    //       return xAccessor(d) >= today && xAccessor(d) <= forecast;
    //     })
    //   )
    //   .attr("d", areaGenerator)
    //   .attr("fill", " #5E9AA9")
    //   .attr("stroke", "#378194")
    //   .attr("stroke-width", 1.6);

    // Draw Line Future
    // container
    //   .append("path")
    //   .datum(
    //     dataSet.filter(function (d) {
    //       return xAccessor(d) >= forecast;
    //     })
    //   )
    //   .attr("d", areaGenerator)
    //   .attr("fill", "#84BFBA")
    //   .attr("stroke", "#66B0A9")
    //   .attr("stroke-width", 1.6);

    const cx = 30;
    const cy = -20;

    // Legend
    container
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 6)
      .style("fill", "#014b7c");
    // container
    //   .append("circle")
    //   .attr("cx", cx + 140)
    //   .attr("cy", cy)
    //   .attr("r", 6)
    //   .style("fill", "#378194");
    // container
    //   .append("circle")
    //   .attr("cx", cx + 285)
    //   .attr("cy", cy)
    //   .attr("r", 6)
    //   .style("fill", "#66B0A9");
    container
      .append("text")
      .attr("x", cx + 20)
      .attr("y", cy + 5)
      .text("Historic Data")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    // container
    //   .append("text")
    //   .attr("x", cx + 140 + 20)
    //   .attr("y", cy + 5)
    //   .text("Selected Data")
    //   .style("font-size", "15px")
    //   .attr("alignment-baseline", "middle");
    // container
    //   .append("text")
    //   .attr("x", cx + 285 + 20)
    //   .attr("y", cy + 5)
    //   .text("Forecasted Data")
    //   .style("font-size", "15px")
    //   .attr("alignment-baseline", "middle");

    // Axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}`);

    container.append("g").classed("yAxis", true).call(yAxis);

    const xAxis = d3.axisBottom(xScale);

    xAxis.tickValues([
      new Date("01 Januar 2020 00:00"),
      new Date("01 Januar 2021 00:00"),
      new Date("01 Januar 2022 00:00"),
      new Date("01 Januar 2023 00:00"),
    ]);

    container
      .append("g")
      .classed("xAxis", true)
      .style("transform", `translateY(${dimensions.containerHeight}px)`)
      .call(xAxis);

    // Tooltip
    container
      .append("rect")
      .classed("mouse-tracker", true)
      .attr("width", dimensions.containerWidth)
      .attr("height", dimensions.containerHeight)
      .style("opacity", 0)
      .on("touchmouse mousemove", function (event) {
        const mousePos = d3.pointer(event, this);

        // x coordinate stored in mousePos index 0
        const date = xScale.invert(mousePos[0]);

        // Custom Bisector - left, center, right
        const dateBisector = d3.bisector(xAccessor).center;

        const bisectionIndex = dateBisector(dataSet, date);

        // math.max prevents negative index reference error
        const hoveredIndexData = dataSet[Math.max(0, bisectionIndex)];

        // Update Image
        tooltipDot
          .style("opacity", 1)
          .attr("cx", xScale(xAccessor(hoveredIndexData)))
          .attr("cy", yScale(yAccessor(hoveredIndexData)))
          .raise();

        tooltip
          .style("display", "block")
          .style("position", "absolute")
          .style("background-color", "#212529")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "8px")
          .style("top", `${yScale(yAccessor(hoveredIndexData)) - 40}px`)
          .style("left", `${xScale(xAccessor(hoveredIndexData))}px`);

        tooltip
          .select(".data")
          .text(name + `: ${yAccessor(hoveredIndexData).toFixed(2)}`);

        const dateFormatter = d3.timeFormat("%B %-d, %Y");

        tooltip
          .select(".date")
          .text(`${dateFormatter(xAccessor(hoveredIndexData))}`);
      })
      .on("mouseleave", function () {
        tooltipDot.style("opacity", 0);
        tooltip.style("display", "none");
      });
  }

  return (
    <Modal
      show={show}
      id={id}
      onHide={onHide}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Material Group: {id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div ref={svgContainer} id="chart" className="line-chart">
            <div ref={tooltipRef} className="lc-tooltip">
              <div className="data"></div>
              <div className="date"></div>
            </div>
            <svg width={"100%"} ref={svgRef}></svg>
          </div>
          {/* <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Expected Change</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => {
                return (
                  <tr>
                    <td>{scenario["key"]}</td>
                    <td>{Number(scenario["value"]).toFixed("2")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table> */}
          <div className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scenario</TableCell>
                  <TableCell>Expected Value</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {scenarios.map((scenario) => {
                  return (
                    <TableRow>
                      <TableCell>{scenario["key"]}</TableCell>
                      <TableCell>
                        {Number(scenario["value"]).toFixed("2")} USD
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onHide}
          style={{ backgroundColor: "#0094d8", borderColor: "transparent" }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MaterialGroupOverview;
