import tklogo from "./Media/tksvg.svg";
import "./App.css";

import {
  Navbar,
  Container,
  Form,
  Row,
  Col,
  Image,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";

import MyGraph from "./Components/MyGraph";
import AppFooter from "./Components/AppFooter";
import { useState, useEffect } from "react";

import axios from "axios";
import configData from "./web.config.json";
import { fontSize } from "@mui/system";

const SERVER_URL = configData.BACKEND_URL;

let IS_CHROME = navigator.userAgent.indexOf("Chrome") > -1;
let IS_SAFARI = navigator.userAgent.indexOf("Safari") > -1;

// Discard Safari since it also matches Chrome
if (IS_CHROME && IS_SAFARI) IS_SAFARI = false;

function App() {
  const [scenario, setScenario] = useState("0");
  const [scenarioName, setScenarioName] = useState(null);
  const [scenarioList, setScenarioList] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await axios.get(SERVER_URL + "/get_scenarios");
      setScenarioList(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  function handleChange(event) {
    setScenario(String(event.target.value));
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    var dataObject = {
      s_name: scenarioName,
    };

    axios.post(SERVER_URL + "/create_scenario", dataObject).then((res) => {
      setScenarioList(res.data);
    });
  };

  if (!scenarioList) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header>
        <Navbar variant="dark" style={{ backgroundColor: "#0094d8" }}>
          <Container>
            <Navbar.Brand href="#home">
              <Image src={tklogo} style={{ height: "80px" }} responsive></Image>
              <a
                style={{
                  marginLeft: "-280px",

                  color: "white",
                }}
              >
                {" "}
                Risk Analysis Tool
              </a>
            </Navbar.Brand>
            <Navbar.Brand href="#home"></Navbar.Brand>
            <Navbar.Toggle />

            {console.log("Safari?: ", IS_SAFARI)}
            {IS_SAFARI ? (
              <>
                <Navbar.Collapse>
                  <div style={{ minWidth: "11vw" }}></div>
                  <Navbar.Text>
                    <FormControl injectFirst sx={{ m: 1, minWidth: 120 }}>
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
                        Scenario
                      </InputLabel>
                      <Select
                        defaultValue=""
                        id="grouped-select"
                        label="scenario"
                        onChange={handleChange}
                        value={scenario}
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
                        <ListSubheader>Scenarios</ListSubheader>

                        {Object.entries(scenarioList.scenario_name).map(
                          (value, key) => (
                            /**/ <MenuItem value={String(value).split(",")[0]}>
                              {String(value).split(",")[1]}
                            </MenuItem>
                          )
                        )}
                        <ListSubheader>Add Scenario</ListSubheader>
                        <div id="add-filed">
                          <Form.Group
                            as={Row}
                            controlId="formPlaintextPassword"
                            style={{
                              padding: "6px 16px",
                              marginBottom: -16,
                              width: 200,
                            }}
                          >
                            <Col xs={10}>
                              <Form.Control
                                type="text"
                                // value={expChange}
                                style={{
                                  marginTop: "0px",
                                  fontSize: "16px",
                                }}
                                onChange={(e) => {
                                  e.preventDefault();
                                  setScenarioName(String(e.target.value));
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                              />
                            </Col>
                            <Col xs={2}>
                              {scenarioName ? (
                                <Button
                                  id="add"
                                  type="submit"
                                  onClick={handleSubmit}
                                >
                                  <AddIcon id="plus" />
                                </Button>
                              ) : (
                                <Button
                                  disabled
                                  id="add"
                                  type="submit"
                                  style={{ backgroundColor: "#77868c" }}
                                  onClick={handleSubmit}
                                >
                                  <AddIcon id="plus" />
                                </Button>
                              )}
                            </Col>
                          </Form.Group>
                        </div>
                        <br />
                      </Select>
                    </FormControl>
                  </Navbar.Text>
                </Navbar.Collapse>
              </>
            ) : (
              <>
                <Navbar.Collapse style={{ justifyContent: "right" }}>
                  <Navbar.Text>
                    <Row>
                      <Col
                        xs={8}
                        style={{
                          marginTop: "23px",
                          marginLeft: "-85px",
                          marginRight: "0px",
                          color: "white",
                          textAlign: "right",
                        }}
                      >
                        Select Scenario:
                      </Col>
                      <Col xs={4}>
                        <FormControl injectFirst sx={{ m: 1, minWidth: 120 }}>
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
                            Scenario
                          </InputLabel>
                          <Select
                            defaultValue=""
                            id="grouped-select"
                            label="scenario"
                            onChange={handleChange}
                            value={scenario}
                            sx={{
                              color: "white",
                              ".MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(228, 219, 233, 0.55)",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
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
                            <ListSubheader>Scenarios</ListSubheader>

                            {Object.entries(scenarioList.scenario_name).map(
                              (value, key) => (
                                /**/ <MenuItem
                                  value={String(value).split(",")[0]}
                                >
                                  {String(value).split(",")[1]}
                                </MenuItem>
                              )
                            )}
                            <ListSubheader>Add Scenario</ListSubheader>
                            <div id="add-filed">
                              <Form.Group
                                as={Row}
                                controlId="formPlaintextPassword"
                                style={{
                                  padding: "6px 16px",
                                  marginBottom: -16,
                                  width: 200,
                                }}
                              >
                                <Col xs={10}>
                                  <Form.Control
                                    type="text"
                                    // value={expChange}
                                    style={{
                                      marginTop: "0px",
                                      fontSize: "16px",
                                    }}
                                    onChange={(e) => {
                                      e.preventDefault();
                                      setScenarioName(String(e.target.value));
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </Col>
                                <Col xs={2}>
                                  {scenarioName ? (
                                    <Button
                                      id="add"
                                      type="submit"
                                      onClick={handleSubmit}
                                    >
                                      <AddIcon id="plus" />
                                    </Button>
                                  ) : (
                                    <Button
                                      disabled
                                      id="add"
                                      type="submit"
                                      style={{ backgroundColor: "#77868c" }}
                                      onClick={handleSubmit}
                                    >
                                      <AddIcon id="plus" />
                                    </Button>
                                  )}
                                </Col>
                              </Form.Group>
                            </div>
                            <br />
                          </Select>
                        </FormControl>
                      </Col>
                    </Row>
                  </Navbar.Text>
                </Navbar.Collapse>
              </>
            )}
          </Container>
        </Navbar>
        <Container
          id="body"
          fluid
          style={{ marginLeft: "-12px", width: "105vw" }}
        >
          {scenario && <MyGraph scenario={scenario}></MyGraph>}
        </Container>
        <AppFooter></AppFooter>
      </header>
    </div>
  );
}

export default App;
