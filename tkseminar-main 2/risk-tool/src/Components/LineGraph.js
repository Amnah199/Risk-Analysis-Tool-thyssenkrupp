import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as d3 from "d3";

import "./LineGraph.css";

//Bootstrap
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import configData from "../web.config.json";

const SERVER_URL = configData.BACKEND_URL;

export default function LineGraph(props) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgContainer = useRef(null); // The PARENT of the SVG

  var url = new URL(SERVER_URL + "/get_node_graph");

  url.searchParams.set("node", props.node);

  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  const [today, setToday] = useState(new Date("21 November 2022 00:00"));
  const [forecast, setForecast] = useState(new Date("21 November 2022 00:00"));

  const [data, setData] = useState(null);
  const [expectedValue, setExpectedValue] = useState(0);
  const [selected, setSelected] = useState(false);

  const getSvgContainerSize = () => {
    const newWidth = svgContainer.current.clientWidth;
    setWidth(newWidth);

    const newHeight = svgContainer.current.clientHeight;
    setHeight(newHeight);
  };

  useEffect(() => {
    fetchData();
    // detect 'width' and 'height' on render
    getSvgContainerSize();
    // listen for resize changes, and detect dimensions again when they change
    window.addEventListener("resize", getSvgContainerSize);
    // cleanup event listener
    return () => window.removeEventListener("resize", getSvgContainerSize);
  }, []);

  useEffect(() => {
    if (data) {
      drawGraph();
    }
  }, [svgRef.current, width, height, forecast, expectedValue]); // redraw chart if data changes

  const fetchData = async () => {
    let dataset = await d3.csv(url);
    setData(dataset);

    const lastHistoricDay = new Date(
      dataset.findLast((elem) => elem.historic === "1").date
    );

    setToday(lastHistoricDay);
    setForecast(lastHistoricDay);
  };

  const drawGraph = () => {
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
    const yMinValue = d3.min(data, yAccessor),
      yMaxValue = d3.max(data, yAccessor);

    // Scales
    const yScale = d3
      .scaleLinear()
      .domain([yMinValue - 1, yMaxValue + 2])
      .range([dimensions.containerHeight, 0]);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, xAccessor))
      .range([0, dimensions.containerWidth]);

    container
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -75)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .attr("fill", "#666666")
      .text("in " + props.unit);

    // Line Generator
    const areaGenerator = d3
      .area()
      .x((d) => xScale(xAccessor(d)))
      .y0(yScale(0 + yMinValue - 1))
      .y1((d) => yScale(yAccessor(d)));

    // Draw Line Past
    container
      .append("path")
      .datum(
        data.filter(function (d) {
          return xAccessor(d) <= today;
        })
      )
      .attr("fill", "#336E96")
      .attr("stroke", "#014b7c")
      .attr("stroke-width", 1.6)
      .attr("d", areaGenerator);

    // Draw Line Selected
    container
      .append("path")
      .datum(
        data.filter(function (d) {
          return xAccessor(d) >= today && xAccessor(d) <= forecast;
        })
      )
      .attr("d", areaGenerator)
      .attr("fill", " #5E9AA9")
      .attr("stroke", "#378194")
      .attr("stroke-width", 1.6);

    // Draw Line Future
    container
      .append("path")
      .datum(
        data.filter(function (d) {
          return xAccessor(d) >= forecast;
        })
      )
      .attr("d", areaGenerator)
      .attr("fill", "#84BFBA")
      .attr("stroke", "#66B0A9")
      .attr("stroke-width", 1.6);

    const cx = 30;
    const cy = -20;

    // Legend
    container
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 6)
      .style("fill", "#014b7c");
    container
      .append("circle")
      .attr("cx", cx + 140)
      .attr("cy", cy)
      .attr("r", 6)
      .style("fill", "#378194");
    container
      .append("circle")
      .attr("cx", cx + 285)
      .attr("cy", cy)
      .attr("r", 6)
      .style("fill", "#66B0A9");
    container
      .append("text")
      .attr("x", cx + 20)
      .attr("y", cy + 5)
      .text("Historic Data")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    container
      .append("text")
      .attr("x", cx + 140 + 20)
      .attr("y", cy + 5)
      .text("Selected Data")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    container
      .append("text")
      .attr("x", cx + 285 + 20)
      .attr("y", cy + 5)
      .text("Forecasted Data")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    // Axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}`);

    container.append("g").classed("yAxis", true).call(yAxis);

    const xAxis = d3.axisBottom(xScale);

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

        const bisectionIndex = dateBisector(data, date);

        // math.max prevents negative index reference error
        const hoveredIndexData = data[Math.max(0, bisectionIndex)];

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
          .text(props.name + `: ${yAccessor(hoveredIndexData).toFixed(2)}`);

        const dateFormatter = d3.timeFormat("%B %-d, %Y");

        tooltip
          .select(".date")
          .text(`${dateFormatter(xAccessor(hoveredIndexData))}`);
      })
      .on("mouseleave", function () {
        tooltipDot.style("opacity", 0);
        tooltip.style("display", "none");
      });
  };

  const handleChange = (e) => {
    e.persist();
    const newDay = new Date(String(e.target.value));
    setForecast(newDay);

    var result = data.filter((obj) => {
      return (
        obj.date ===
        newDay.getFullYear() +
          "-" +
          ("0" + (newDay.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + newDay.getDate()).slice(-2)
      );
    });
    const val = +result[0].value;
    setExpectedValue(Number(val).toFixed(2));
    setSelected(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    var expVal = expectedValue;
    if (props.node === 1) {
      expVal = expectedValue * Math.pow(10, 12);
    }

    var dataObject = {
      id: props.node,
      expChange: parseFloat(expVal - Number(props.currValue)),
      m_id: null,
      s_id: null,
    };

    props.parentCallback(dataObject);
    props.onHide();
  };

  function addWeeks(weeks, date = new Date()) {
    date.setDate(date.getDate() + weeks * 7);

    return date;
  }

  function addMonths(months, date = new Date()) {
    date.setMonth(date.getMonth() + months);

    return date;
  }

  function addYears(years, date = new Date()) {
    date.setFullYear(date.getFullYear() + years);

    return date;
  }

  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={svgContainer} id="chart" className="line-chart">
          <div ref={tooltipRef} class="lc-tooltip">
            <div className="data"></div>
            <div className="date"></div>
          </div>
          <svg ref={svgRef}></svg>
        </div>
        <Form className="text-center">
          {["radio"].map((type) => (
            <div>
              <Row>
                <Col
                  xs={3}
                  style={{
                    textAlign: "right",
                  }}
                >
                  Select Time Horizon:{" "}
                </Col>
                <Col xs={7}>
                  <Form.Check
                    inline
                    value={today}
                    label="current"
                    name="group1"
                    type={type}
                    onChange={handleChange}
                    id={`inline-${type}-0`}
                  />
                  <Form.Check
                    inline
                    value={addWeeks(1, new Date(today))}
                    label="1 week"
                    name="group1"
                    type={type}
                    onChange={handleChange}
                    id={`inline-${type}-1`}
                  />
                  <Form.Check
                    inline
                    value={addMonths(1, new Date(today))}
                    label="1 month"
                    name="group1"
                    type={type}
                    onChange={handleChange}
                    id={`inline-${type}-2`}
                  />
                  <Form.Check
                    inline
                    value={addMonths(3, new Date(today))}
                    label="3 month"
                    name="group1"
                    type={type}
                    onChange={handleChange}
                    id={`inline-${type}-3`}
                  />
                  <Form.Check
                    inline
                    value={addMonths(6, new Date(today))}
                    label="6 month"
                    name="group1"
                    type={type}
                    onChange={handleChange}
                    id={`inline-${type}-4`}
                  />
                  <Form.Check
                    inline
                    value={addYears(1, new Date(today))}
                    label="1 year"
                    name="group1"
                    type={type}
                    onChange={handleChange}
                    id={`inline-${type}-5`}
                  />
                </Col>
                <Col xs={2}></Col>
              </Row>
              <br></br>
              <Row>
                <Col xs={2}></Col>
                <Col
                  xs={3}
                  style={{
                    marginTop: "6px",
                    textAlign: "right",
                  }}
                >
                  <Form.Label> Expected Value</Form.Label>
                </Col>
                <Col xs={2} style={{ marginTop: 7 }}>
                  {expectedValue}
                </Col>
                <Col xs={3}>
                  <Form.Control
                    plaintext
                    readOnly
                    type="text"
                    value={"in " + props.unit}
                  />
                </Col>
                <Col xs={2}></Col>
              </Row>
              <br></br>
              {selected ? (
                <Button
                  onClick={handleSubmit}
                  style={{
                    backgroundColor: "#0094d8",
                    borderColor: "transparent",
                  }}
                >
                  Submit Forecast
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  style={{
                    backgroundColor: "#0094d8",
                    borderColor: "transparent",
                  }}
                  disabled
                >
                  Submit Forecast
                </Button>
              )}
            </div>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={props.onHide}
          style={{ backgroundColor: "#0094d8", borderColor: "transparent" }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
