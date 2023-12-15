import { useCallback, useState } from "react";

import axios from "axios";

export const useCenteredTree = () => {
  const [translate, setTranslate] = useState({ x: 300, y: 500 });
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 2 });
    }
  }, []);
  return [translate, containerRef];
};

const url = `http://localhost:8080`;

export async function getGraph() {
  try {
    const response = await axios.get(url + "/build_network");

    return response.data;
  } catch (err) {
    console.log(err);
  }
}
