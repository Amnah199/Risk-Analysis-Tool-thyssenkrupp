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

export default function InfoBox(props) {
  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Info Box</Modal.Title>
      </Modal.Header>
      <Modal.Body>Info about Accuracy and Functionality</Modal.Body>
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
