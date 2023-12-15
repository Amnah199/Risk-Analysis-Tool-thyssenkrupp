import pandas as pd
import requests
import logging
from logging import log, INFO, ERROR, WARN, DEBUG
import json
from matplotlib import pyplot as plt
import io

class restcall():
    steps = 0
    training = False
    def forecast(steps,df):
        logging.basicConfig(level=INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        logging.info("Number of chosen forecast steps: "  + str(steps))

        ### Parameters ###
        # REST URL
        algorithm = 'getProphetForecast'

        url = 'http://localhost:8061/' + algorithm

        # read time series from xlsx to pandas data frame
        logging.info("Read data ...")

        # post request
        logging.info("POST request startet ...")

        jsn = {
            "steps": steps,
            "data": df.to_json(orient='records')
        }
        response = json.dumps(jsn)
        logging.info("Ready for POST ...")

        req = requests.post(url,response).content
        logging.info(req)
        # read output from request to data frame
        output = pd.read_json(io.StringIO(req.decode('utf-8')))

        return output

