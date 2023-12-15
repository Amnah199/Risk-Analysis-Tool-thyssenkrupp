import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import "./nodeInput.css";

//Bootstrap
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Collapse from "react-bootstrap/Collapse";

//Icons
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InfoIcon from "@mui/icons-material/Info";

export default function NodeInput(props) {
  const [open, setOpen] = useState(false);
  const [expChange, setExpChange] = useState(
    props.attributes.nodeDatum.attributes.expected_change
  );

  const [expValue, setExpValue] = useState(
    props.attributes.nodeDatum.attributes.new_expected_value
  );

  const [baseValue, setBaseValue] = useState(
    props.attributes.nodeDatum.attributes.initial_regression_value
  );

  useEffect(() => {
    setExpChange(props.attributes.nodeDatum.attributes.expected_change);
    setExpValue(props.attributes.nodeDatum.attributes.new_expected_value);
    setBaseValue(
      props.attributes.nodeDatum.attributes.initial_regression_value
    );
  }, [props]);

  const handleChange = (event) => {
    console.log(event.target.value);
    setExpChange(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    var dataObject = {
      id: props.attributes.nodeDatum.attributes.node_id,
      expChange: parseFloat(expChange),
      m_id: null,
      s_id: null,
    };

    props.parentCallback(dataObject);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <ListGroup.Item style={{ backgroundColor: "transparent" }}>
        <Form.Group
          as={Row}
          className="mb-3"
          controlId="formPlaintextEmail"
          style={{
            color: "white",
          }}
        >
          <Row>
            <Form.Label column sm="4">
              Expected Value
            </Form.Label>
            <Col
              sm="3"
              style={{
                textAlign: "right",
              }}
            >
              <Form.Control
                style={{
                  marginTop: "12px",
                  color: "white",
                  textAlign: "right",
                }}
                plaintext
                readOnly
                type="number"
                value={expValue.toFixed(2)}
              />
            </Col>
            <Col sm="4">
              <Form.Control
                style={{ marginTop: "12px", color: "white" }}
                plaintext
                readOnly
                type="text"
                value={props.attributes.nodeDatum.unit}
              />
            </Col>
            <Col sm="1">
              {props.attributes.nodeDatum.attributes.lvl !== 0 && (
                <Button
                  id="edit"
                  onClick={() => setOpen(!open)}
                  aria-controls="example-collapse-text"
                  aria-expanded={open}
                >
                  <EditIcon style={{ marginRight: "0px" }} id="pencil" />
                </Button>
              )}
            </Col>
          </Row>
          {props.attributes.nodeDatum.attributes.lvl === 0 && (
            <Row>
              <Form.Label column sm="4">
                Base Value
              </Form.Label>
              <Col sm="3">
                <Form.Control
                  style={{
                    marginTop: "12px",
                    color: "white",
                    textAlign: "right",
                  }}
                  plaintext
                  readOnly
                  type="number"
                  value={Number(baseValue).toFixed(2)}
                />
              </Col>
              <Col sm="4">
                <Form.Control
                  style={{ marginTop: "12px", color: "white" }}
                  plaintext
                  readOnly
                  type="text"
                  value={props.attributes.nodeDatum.unit}
                />
              </Col>
            </Row>
          )}
        </Form.Group>
      </ListGroup.Item>
      <Collapse in={open}>
        <div id="example-collapse-text">
          <form onSubmit={handleSubmit}>
            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formPlaintextPassword"
            >
              <Form.Label column sm="4">
                Expected Change
              </Form.Label>
              <Col sm="6">
                <Form.Control
                  type="number"
                  value={expChange}
                  style={{ marginTop: "16px" }}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
              </Col>
              <Col sm="2">
                <Button id="submit" type="submit">
                  <ArrowForwardIosIcon id="pencil" />
                </Button>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="4">
                Base Value
              </Form.Label>
              <Col sm="3">
                <Form.Control
                  style={{
                    color: "white",
                    textAlign: "right",
                    marginLeft: "-12px",
                  }}
                  plaintext
                  readOnly
                  type="number"
                  value={Number(baseValue).toFixed(2)}
                />
              </Col>
              <Col sm="4">
                <Form.Control
                  style={{
                    marginLeft: "-16px",
                    marginTop: "0px",
                    color: "white",
                  }}
                  plaintext
                  readOnly
                  type="text"
                  value={props.attributes.nodeDatum.unit}
                />
              </Col>
              <Col sm="1"></Col>
            </Form.Group>
          </form>
        </div>
      </Collapse>
    </>
  );
}
