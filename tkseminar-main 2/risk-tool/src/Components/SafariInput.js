import "./safariInput.css";

import React, { useState, useRef, useEffect } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function SafariInput(props) {
  const [expChange, setExpChange] = useState(
    props.attributes.nodeDatum.attributes.expected_change
  );

  const handleChange = (event) => {
    setExpChange(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    var change = expChange;
    if (props.attributes.nodeDatum.attributes.node_id === 1) {
      change = change * Math.pow(10, 12);
    }

    var dataObject = {
      id: props.attributes.nodeDatum.attributes.node_id,
      expChange: parseFloat(change),
      m_id: null,
      s_id: null,
    };

    props.parentCallback(dataObject);
  };

  return (
    <>
      {" "}
      <input
        type="number"
        id="fname"
        name="firstname"
        placeholder="Your value..."
        value={expChange}
        style={{ marginTop: "16px" }}
        onChange={handleChange}
      ></input>{" "}
      <button id="collapsable" style={{ marginRight: 4, marginLeft: 14 }}>
        <ArrowForwardIosIcon
          onClick={handleSubmit}
          style={{ marginLeft: -4 }}
          id="pencil"
        />
      </button>
    </>
  );
}
