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

import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function MaterialOverview(props) {
  const [groups, setGroups] = useState(props.attributes);

  useEffect(() => {
    setGroups(props.attributes);
  }, [props]);

  return (
    <>
      <ListGroup.Item
        style={{
          backgroundColor: "transparent",
          color: "white",
        }}
      >
        <Row>
          <Col>Group Name</Col>
          <Col>Price</Col>
        </Row>
        {groups.map((group) => (
          <Row>
            <Col>{group.id}</Col>
            <Col>{group.value}</Col>
          </Row>
        ))}
      </ListGroup.Item>
    </>
  );
}
