import React, { useState, useEffect, useRef } from "react";
import Tree from "react-d3-tree";

import axios from "axios";

import { useCenteredTree } from "./myGraphHelpers";
import "./myGraph.css";

import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import RemoveIcon from "@mui/icons-material/Remove";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import RefreshIcon from "@mui/icons-material/Refresh";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { styled } from "@mui/material/styles";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import NodeInput from "./NodeInput";
import MaterialOverview from "./MaterialOverview";
import LineGraph from "./LineGraph";

import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InfoBox from "./InfoBox";

import configData from "../web.config.json";
import { padding } from "@mui/system";
import SafariInput from "./SafariInput";

import MaterialGroupOverview from "./MaterialGroupOverview";

const SERVER_URL = configData.BACKEND_URL;
const IS_SAFARI =
  /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

const RenderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
  group,
  myGraphCallback,
  setModalShow,
  modalShow,
  setEditShow,
  editShow,
}) => {
  const handleCallback = (data) => {
    myGraphCallback(data);
  };

  var backgroundColor = "#0094D8";

  if (nodeDatum.attributes.lvl === 1) {
    backgroundColor = "#0AB1FF";
  }

  if (nodeDatum.attributes.lvl === 2) {
    backgroundColor = "#33BEFF";
  }

  const safariNodeFull = () => {
    return (
      <>
        <div
          class="grid-container"
          style={{ gridTemplateRows: "auto auto auto auto auto" }}
        >
          <div class="div1 grid-item">
            {" "}
            <button
              id="graph"
              style={{
                backgroundColor: "transparent",
                marginTop: 5,
              }}
            >
              {Number(
                Number(nodeDatum.attributes.initial_regression_value).toFixed(2)
              ) <
              Number(
                Number(nodeDatum.attributes.new_expected_value).toFixed(2)
              ) ? (
                <TrendingUpIcon
                  style={{
                    color: "#43fbbc",
                    fontSize: 35,
                  }}
                />
              ) : Number(
                  Number(nodeDatum.attributes.initial_regression_value).toFixed(
                    2
                  )
                ) >
                Number(
                  Number(nodeDatum.attributes.new_expected_value).toFixed(2)
                ) ? (
                <TrendingDownIcon
                  style={{
                    color: "#ffc6ed",
                    fontSize: 35,
                  }}
                />
              ) : (
                <TrendingFlatIcon style={{ fontSize: 35 }} />
              )}
            </button>
          </div>
          <div class="div2 grid-item">
            {" "}
            <h4>{nodeDatum.name}</h4>
          </div>
          <div class="div3 grid-item">
            {" "}
            <button
              id="graph"
              style={{
                marginLeft: 0,
                marginTop: 0,
                padding: 10,
              }}
              onClick={() => setModalShow(nodeDatum.name)}
            >
              <QueryStatsIcon id="graphIcon" />
            </button>
          </div>
          <div class="div4 grid-item"> Expected Value</div>
          <div class="div5 grid-item">
            {nodeDatum.name === "Global GDP"
              ? (
                  Number(nodeDatum.attributes.new_expected_value) /
                  Math.pow(10, 12)
                ).toFixed(2)
              : nodeDatum.attributes.new_expected_value.toFixed(2)}
          </div>
          <div class="div6 grid-item">{nodeDatum.unit}</div>
          <div class="div7 grid-item">
            {" "}
            {nodeDatum.attributes.lvl !== 0 && (
              <button
                id="collapsable"
                onClick={() => setEditShow(nodeDatum.name)}
                // aria-controsls="example-collapse-text"
                // aria-expanded={open}
              >
                <EditIcon style={{ marginLeft: -4 }} id="pencil" />
              </button>
            )}
          </div>
          <div class="div8 grid-item" style={{ marginTop: 14 }}>
            {" "}
            Expected Change
          </div>
          <div class="div9 grid-item">
            <SafariInput
              attributes={{ nodeDatum }}
              parentCallback={handleCallback}
            ></SafariInput>
          </div>
          <div class="div11 grid-item"> Base Value</div>
          <div class="div12 grid-item">
            {nodeDatum.name === "Global GDP"
              ? (
                  Number(nodeDatum.attributes.initial_regression_value) /
                  Math.pow(10, 12)
                ).toFixed(2)
              : nodeDatum.attributes.initial_regression_value.toFixed(2)}
          </div>
          <div class="div13 grid-item"> {nodeDatum.unit}</div>
          <div class="div14 grid-item"> </div>
          <div class="div15 grid-item">
            {" "}
            {nodeDatum.children === null || nodeDatum.children.length === 0 ? (
              <button
                style={{ backgroundColor: "#003c7d20" }}
                id="collapsable"
                onClick={toggleNode}
                disabled
              >
                {nodeDatum.__rd3t.collapsed ? (
                  <AddIcon style={{ marginLeft: -4 }} />
                ) : (
                  <RemoveIcon style={{ marginLeft: -4 }} />
                )}
              </button>
            ) : (
              <button id="collapsable" onClick={toggleNode}>
                {nodeDatum.__rd3t.collapsed ? (
                  <AddIcon style={{ marginLeft: -4 }} />
                ) : (
                  <RemoveIcon style={{ marginLeft: -4 }} />
                )}
              </button>
            )}
          </div>
        </div>
      </>
    );
  };

  const safariNodeMG = () => {
    return (
      <>
        <div
          class="grid-container"
          style={{ gridTemplateRows: "auto auto auto auto" }}
        >
          <div class="div31 grid-item">
            {" "}
            <button
              id="graph"
              style={{
                backgroundColor: "transparent",
                marginTop: 5,
              }}
            >
              {Number(
                Number(nodeDatum.attributes.initial_regression_value).toFixed(2)
              ) <
              Number(
                Number(nodeDatum.attributes.new_expected_value).toFixed(2)
              ) ? (
                <TrendingUpIcon
                  style={{
                    color: "#43fbbc",
                    fontSize: 35,
                  }}
                />
              ) : Number(
                  Number(nodeDatum.attributes.initial_regression_value).toFixed(
                    2
                  )
                ) >
                Number(
                  Number(nodeDatum.attributes.new_expected_value).toFixed(2)
                ) ? (
                <TrendingDownIcon
                  style={{
                    color: "#ffc6ed",
                    fontSize: 35,
                  }}
                />
              ) : (
                <TrendingFlatIcon style={{ fontSize: 35 }} />
              )}
            </button>
          </div>
          <div class="div32 grid-item">
            {" "}
            <h4>{nodeDatum.name}</h4>
          </div>
          <div class="div33 grid-item">
            {" "}
            <button
              id="graph"
              style={{
                marginLeft: 0,
                marginTop: 0,
                padding: 10,
              }}
              onClick={() => setModalShow(nodeDatum.name)}
            >
              <QueryStatsIcon id="graphIcon" />
            </button>
          </div>
          <div class="div34 grid-item"> Expected Value</div>
          <div class="div35 grid-item">
            {nodeDatum.attributes.new_expected_value.toFixed(2)}
          </div>
          <div class="div36 grid-item">{nodeDatum.unit}</div>
          <div class="div37 grid-item"></div>

          <div class="div38 grid-item"> Base Value</div>
          <div class="div39 grid-item">
            {" "}
            {nodeDatum.attributes.initial_regression_value.toFixed(2)}
          </div>
          <div class="div310 grid-item"> {nodeDatum.unit}</div>
          <div class="div311 grid-item"> </div>
          <div class="div312 grid-item">
            {" "}
            {nodeDatum.children === null || nodeDatum.children.length === 0 ? (
              <button
                style={{ backgroundColor: "#003c7d20" }}
                id="collapsable"
                onClick={toggleNode}
                disabled
              >
                {nodeDatum.__rd3t.collapsed ? (
                  <AddIcon style={{ marginLeft: -4 }} />
                ) : (
                  <RemoveIcon style={{ marginLeft: -4 }} />
                )}
              </button>
            ) : (
              <button id="collapsable" onClick={toggleNode}>
                {nodeDatum.__rd3t.collapsed ? (
                  <AddIcon style={{ marginLeft: -4 }} />
                ) : (
                  <RemoveIcon style={{ marginLeft: -4 }} />
                )}
              </button>
            )}
          </div>
        </div>
      </>
    );
  };

  const safariNode = () => {
    return (
      <>
        <div
          class="grid-container"
          style={{ gridTemplateRows: "repeat(3, auto)" }}
        >
          <div class="div21 grid-item">
            {" "}
            <button
              id="graph"
              style={{
                backgroundColor: "transparent",
                marginTop: 5,
              }}
            >
              {Number(
                Number(nodeDatum.attributes.initial_regression_value).toFixed(2)
              ) <
              Number(
                Number(nodeDatum.attributes.new_expected_value).toFixed(2)
              ) ? (
                <TrendingUpIcon
                  style={{
                    color: "#43fbbc",
                    fontSize: 35,
                  }}
                />
              ) : Number(
                  Number(nodeDatum.attributes.initial_regression_value).toFixed(
                    2
                  )
                ) >
                Number(
                  Number(nodeDatum.attributes.new_expected_value).toFixed(2)
                ) ? (
                <TrendingDownIcon
                  style={{
                    color: "#ffc6ed",
                    fontSize: 35,
                  }}
                />
              ) : (
                <TrendingFlatIcon style={{ fontSize: 35 }} />
              )}
            </button>
          </div>
          <div class="div22 grid-item">
            {" "}
            <h4>{nodeDatum.name}</h4>
          </div>
          <div class="div23 grid-item">
            {" "}
            <button
              id="graph"
              style={{
                marginLeft: 0,
                marginTop: 0,
                padding: 10,
              }}
              onClick={() => setModalShow(nodeDatum.name)}
            >
              <QueryStatsIcon id="graphIcon" />
            </button>
          </div>
          <div class="div24 grid-item"> Expected Value</div>
          <div class="div25 grid-item">
            {nodeDatum.name === "Global GDP"
              ? (
                  Number(nodeDatum.attributes.new_expected_value) /
                  Math.pow(10, 12)
                ).toFixed(2)
              : nodeDatum.attributes.new_expected_value.toFixed(2)}
          </div>
          <div class="div26 grid-item">{nodeDatum.unit}</div>
          <div class="div27 grid-item">
            {" "}
            {nodeDatum.attributes.lvl !== 0 && (
              <button
                id="collapsable"
                onClick={() => setEditShow(nodeDatum.name)}
                // aria-controsls="example-collapse-text"
                // aria-expanded={open}
              >
                <EditIcon style={{ marginLeft: -4 }} id="pencil" />
              </button>
            )}
          </div>
          <div class="div28 grid-item">
            {" "}
            {nodeDatum.children === null || nodeDatum.children.length === 0 ? (
              <button
                style={{ backgroundColor: "#003c7d20" }}
                id="collapsable"
                onClick={toggleNode}
                disabled
              >
                {nodeDatum.__rd3t.collapsed ? (
                  <AddIcon style={{ marginLeft: -4 }} />
                ) : (
                  <RemoveIcon style={{ marginLeft: -4 }} />
                )}
              </button>
            ) : (
              <button id="collapsable" onClick={toggleNode}>
                {nodeDatum.__rd3t.collapsed ? (
                  <AddIcon style={{ marginLeft: -4 }} />
                ) : (
                  <RemoveIcon style={{ marginLeft: -4 }} />
                )}
              </button>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <g>
      {/* `foreignObject` requires width & height to be explicitly set. */}
      <foreignObject {...foreignObjectProps} style={{ overflow: "visible" }}>
        {/* {IS_SAFARI ? (
          <> */}

        <div className="rect">
          {nodeDatum.attributes.lvl !== 0 &&
            (editShow === nodeDatum.name ? safariNodeFull() : safariNode())}
          {nodeDatum.attributes.lvl === 0 && safariNodeMG()}
        </div>
        {/* </>
        ) : (
          <g>
            <Card
              style={{
                width: "400px",
                borderRadius: "40px",
                backgroundColor: backgroundColor,
                color: "white",
                borderColor: "white",
              }}
            >
              <ListGroup variant="flush">
                <ListGroup.Item style={{ backgroundColor: "transparent" }}>
                  <Row>
                    <Col xs={2}>
                      <Button
                        id="graph"
                        style={{
                          backgroundColor: "transparent",
                          marginTop: 5,
                        }}
                      >
                        {Number(
                          nodeDatum.attributes.initial_regression_value
                        ).toFixed(2) <
                        Number(nodeDatum.attributes.new_expected_value).toFixed(
                          2
                        ) ? (
                          <TrendingUpIcon
                            style={{
                              transform: "scale(1.6)",
                              color: "#43fbbc",
                            }}
                          />
                        ) : Number(
                            nodeDatum.attributes.initial_regression_value
                          ).toFixed(2) >
                          Number(
                            nodeDatum.attributes.new_expected_value
                          ).toFixed(2) ? (
                          <TrendingDownIcon
                            style={{
                              transform: "scale(1.6)",
                              color: "#ffc6ed",
                            }}
                          />
                        ) : (
                          <TrendingFlatIcon
                            style={{ transform: "scale(1.6)" }}
                          />
                        )}
                      </Button>
                    </Col>
                    <Col xs={8}>
                      <h4>{nodeDatum.name}</h4>
                    </Col>
                    <Col xs={2}>
                      {nodeDatum.attributes.lvl === 0 ? (
                        <div></div>
                      ) : (
                        <Button
                          id="graph"
                          style={{
                            marginLeft: -20,
                            marginTop: 5,
                          }}
                          onClick={() => setModalShow(nodeDatum.name)}
                        >
                          <QueryStatsIcon id="graphIcon" />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <NodeInput
                  attributes={{ nodeDatum }}
                  parentCallback={handleCallback}
                />

                <ListGroup.Item style={{ backgroundColor: "transparent" }}>
                  {nodeDatum.children === null ||
                  nodeDatum.children.length === 0 ? (
                    <Button
                      style={{ backgroundColor: "#003c7d20" }}
                      id="collapsable"
                      onClick={toggleNode}
                      disabled
                    >
                      {nodeDatum.__rd3t.collapsed ? (
                        <AddIcon />
                      ) : (
                        <RemoveIcon />
                      )}
                    </Button>
                  ) : (
                    <Button id="collapsable" onClick={toggleNode}>
                      {nodeDatum.__rd3t.collapsed ? (
                        <AddIcon />
                      ) : (
                        <RemoveIcon />
                      )}
                    </Button>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </g>
        )} */}
      </foreignObject>

      {modalShow === nodeDatum.name ? (
        nodeDatum.attributes.lvl === 0 ? (
          <MaterialGroupOverview
            id={group}
            onHide={() => setModalShow("")}
            show={modalShow === nodeDatum.name}
            name={nodeDatum.name}
            unit={nodeDatum.unit}
          />
        ) : (
          <LineGraph
            show={modalShow === nodeDatum.name}
            onHide={() => setModalShow("")}
            name={nodeDatum.name}
            unit={nodeDatum.unit}
            group={group}
            node={nodeDatum.attributes.node_id}
            currValue={nodeDatum.attributes.new_expected_value}
            parentCallback={handleCallback}
          />
        )
      ) : (
        <></>
      )}
    </g>
  );
};

const MyGraph = (props) => {
  //Set variables
  const [translate, setTranslate] = useState({
    x: window.screen.width / 2,
    y: window.screen.height / 4,
  });
  const [graph, setGraph] = useState(null);
  const [scenario, setScenario] = useState(props.scenario);
  const [checked, setChecked] = React.useState(false);

  const [group, setGroup] = useState("5600");

  const nodeSize = { x: 550, y: 480 };
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -200,
    y: -100,
  };
  //Modal Show
  const [modalShow, setModalShow] = useState("");
  //Modal Show
  const [editShow, setEditShow] = useState("");
  //Modal Show
  const [modalShowInfo, setModalShowInfo] = useState(false);

  //Get Initial Newtork from API
  useEffect(() => {
    const getGraph = async () => {
      try {
        const response = await axios.get(SERVER_URL + "/get_network", {
          params: { m_id: group, s_id: props.scenario },
        });
        setGraph(response.data);
      } catch (e) {
        console.log(e);
      }
    };
    getGraph();
    if (IS_SAFARI) {
      setTranslate({
        x: window.screen.width / 1.5,
        y: window.screen.height / 6,
      });
    }
  }, [props, group, scenario]);

  //Loading screen
  if (!graph) {
    return <div>Loading...</div>;
  }

  //Value of Dropdown
  const handleChange = (event) => {
    setGroup(event.target.value);
  };
  //Switch Orientation
  const handleSwitch = (event) => {
    setChecked(event.target.checked);
  };

  const changeEditShow = (e) => {
    if (editShow === e) {
      setEditShow("");
    } else {
      setEditShow(e);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you wish to reset the network and all its values?"
      )
    )
      axios
        .get(SERVER_URL + "/reset_network", {
          params: { m_id: group, s_id: props.scenario },
        })
        .then((res) => {
          setGraph(res.data);
        });
    this.deleteItem(e);
  };

  //Update Network after changes
  function handleCallback(data) {
    data.m_id = group;
    data.s_id = props.scenario;
    axios.post(SERVER_URL + "/change_network", data).then((res) => {
      setGraph(res.data);
    });
  }

  //Style Switch
  const IOSSwitch = styled((props) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#0094d8",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#e9e9ea" : "#e9e9ea",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
          color: "#0094d8",
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#54b7e5",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color: "#0094d8",
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      color: "#0094d8",
      width: 22,
      height: 22,
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));

  //Display Tree
  return (
    <>
      <div className="additional-settings">
        <div className="container">
          <Row style={{ width: "100%" }}>
            <Col xs={3} style={{ marginTop: "23px" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>
                  <ScreenRotationIcon
                    style={{
                      width: "40px",
                      marginLeft: "0px",
                    }}
                  />
                </Typography>
                <Typography>Vertical</Typography>
                <IOSSwitch checked={checked} onChange={handleSwitch} />
                <Typography>Horizontal</Typography>
              </Stack>
            </Col>
            <Col
              style={{
                textAlign: "center",
              }}
              xs={3}
            >
              <Button
                style={{
                  marginRight: "-10px",
                  marginTop: "16px",
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                }}
                onClick={() => setModalShowInfo(true)}
              >
                <InfoOutlinedIcon
                  style={{
                    marginTop: "-2px",
                  }}
                />{" "}
                Additional Information
              </Button>
            </Col>
            <Col
              xs={3}
              style={{
                textAlign: "center",
              }}
            >
              <Button
                // onclick={window.location.reload(false)}
                style={{
                  marginTop: "16px",
                  backgroundColor: "#0094d8",
                  borderColor: "transparent",
                }}
                onClick={handleReset}
              >
                <RefreshIcon /> Reset Values
              </Button>
            </Col>
            <Col
              xs={2}
              style={{
                marginTop: "23px",
                textAlign: "right",
                color: "white",
                marginLeft: -40,
              }}
            >
              Material Group:
            </Col>
            <Col xs={1}>
              <FormControl injectFirst sx={{ m: 1 }} style={{ width: 120 }}>
                <InputLabel
                  sx={{
                    color: "white",
                    opacity: "80%",
                    "&.Mui-focused": {
                      color: "white",
                      opacity: "80%",
                    },
                  }}
                  htmlFor="grouped-select"
                >
                  Group by
                </InputLabel>
                <Select
                  defaultValue=""
                  id="grouped-select"
                  label="Group by"
                  onChange={handleChange}
                  value={group}
                  sx={{
                    color: "white",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(228, 219, 233, 0.55)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(228, 219, 233, 1)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(228, 219, 233, 0.75)",
                    },
                    ".MuiSvgIcon-root ": {
                      fill: "white !important",
                    },
                  }}
                >
                  <ListSubheader>Material Groups</ListSubheader>
                  <MenuItem value="5600">5600</MenuItem>
                  <MenuItem value="5610">5610</MenuItem>
                  <MenuItem value="5620">5620</MenuItem>
                  <MenuItem value="5640">5640</MenuItem>
                  <MenuItem value="5650">5650</MenuItem>
                  <MenuItem value="5670">5670</MenuItem>
                  <MenuItem value="5680">5680</MenuItem>
                  <MenuItem value="5800">5800</MenuItem>
                  <MenuItem value="5810">5810</MenuItem>
                  <MenuItem value="5820">5820</MenuItem>
                  <MenuItem value="5850">5850</MenuItem>
                  <ListSubheader>Commodities</ListSubheader>
                  <MenuItem value="User4" disabled>
                    Aluminium
                  </MenuItem>
                  <MenuItem value="User5" disabled>
                    Copper
                  </MenuItem>
                  <MenuItem value="User5" disabled>
                    Zinc
                  </MenuItem>
                </Select>
              </FormControl>
            </Col>
          </Row>
        </div>
      </div>
      <div className="text-center">
        <div id="treeWrapper">
          <Tree
            data={graph}
            translate={translate}
            nodeSize={nodeSize}
            renderCustomNodeElement={(rd3tProps) =>
              RenderForeignObjectNode({
                ...rd3tProps,
                foreignObjectProps,
                group,
                myGraphCallback: handleCallback,
                setModalShow,
                modalShow,
                setEditShow: changeEditShow,
                editShow,
              })
            }
            orientation={checked ? "horizontal" : "vertical"}
          />
        </div>
      </div>

      <InfoBox show={modalShowInfo} onHide={() => setModalShowInfo(false)} />
    </>
  );
};

export default React.memo(MyGraph);
