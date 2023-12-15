import pandas as pd
import requests
import logging
from logging import log, INFO, ERROR, WARN, DEBUG
import json
from matplotlib import pyplot as plt
import io
import os

d = os.getcwd() + "/DataAnalysis"
os.chdir(d)

match = {
    #Children
    'Oil Price': 'Oil',
    'Gas Price': 'Natural Gas',
    'Chinese Production': 'China (Estimated)',
    'African Production': 'Africa',
    'Asian (ex China) Production': 'Asia (ex China)',
    'Gulf Production': 'Gulf Cooperation Council',
    'Russia and Eastern European Production': 'Russia & Eastern Europe',
    'West & Central European Production': 'Western & Central Europe',
    'North American Production': 'North America',
    'South American Production': 'South America',
    'Oceania Production': 'Oceania',
    'Global GDP':'GDP',
    'CAD - USD Index': 'Open_usd_cad',
    'CNY - USD Index':'Open_usd_yuan',
    'RUB - USD Index': 'Open_usd_ruble',
    'Estimated Unreported to IAI': 'Estimated Unreported to IAI',
    'INR - USD Index': 'Open_usd_rupee',
    'USD Index': 'Open_usd_index',
    'Global Energy Price Index': 'Energy_index',
    'Global Production': 'Production_total',
    'Global Nickel Price Index':'Nickel',
    'Global Zinc Price Index':'Zinc',
    '5600 Price': '5600 price'
}

def getNodeIDFromName(name):

    file = "./JSONFiles/network5600.json"
    input = json.load(open(file)) 


    if(match[input['name']] == name):
        return input['attributes']['node_id']

    for child in input['children']:

        if(match[child['name']] == name):
            return child['attributes']['node_id']

        if child['children'] is not None:
            for c in child['children']:

                if(match[c['name']] == name):
                    return c['attributes']['node_id']





class restcall():
    steps = 0
    training = False

    def forecast(steps, df):
        logging.basicConfig(level=INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        logging.info("Number of chosen forecast steps: " + str(steps))

        # Parameters
        algorithm = 'getProphetForecast'
        url = 'http://localhost:8061/' + algorithm

        logging.info("Read data ...")
        logging.info("POST request startet ...")

        # Prepare POST request
        jsn = {
            "steps": steps,
            "data": df.to_json(orient='records')
        }
        response = json.dumps(jsn)
        logging.info("Ready for POST ...")

        # Send POST and retrieve response
        req = requests.post(url,response).content
        logging.info(req)
        output = pd.read_json(io.StringIO(req.decode('utf-8')))

        return output

# Prepare the Dataset
df_historic = pd.read_csv("./ProcessedData/factors.csv")
#df_historic = df_historic.drop('Unnamed: 0', axis=1)
df_historic['Date'] = pd.to_datetime(df_historic.Date)
df_historic['Date'] = df_historic['Date'].dt.strftime('%m/%d/%Y')
# add indicator for historic and forecasted values
df_historic['historic'] = 1
#df_historic.set_index('Date', inplace=True)




final_df = pd.DataFrame(columns=['NodeName','NodeID','Date','Value','Historic'])



# Iterate over all columns and create tuples of date and feature
for column in df_historic:
    # Skip for Date and Index columns
    if column != 'Date' and column != 'historic':
        
        # ...
        hist = pd.DataFrame(columns=['NodeName','NodeID','Date','Value','Historic'])
        
        hist['Date'] = df_historic['Date']
        hist['Value'] = df_historic[column]
        hist.rename({column: "Value"}, inplace=True)
        hist['NodeName'] = column
        hist['NodeID'] = getNodeIDFromName(column)
        hist['Historic'] = 1

        #Add
        final_df = final_df.append(hist, ignore_index=True)

        # Prepare the tuple that is sent to the API
        df_prophet = df_historic[['Date', column]]
        # Retrieve forecasts
        forecasts = restcall.forecast(365, df_prophet)
        forecasts['DATE'] = pd.to_datetime(forecasts.DATE)
        forecasts['DATE'] = forecasts['DATE'].dt.strftime('%m/%d/%Y')
        forecasts = forecasts.rename(columns={'DATE':'Date'})
        forecasts = forecasts.rename(columns={'Y': column})
        
        # If first iteration (column 'Price'), add forecast dates to our final dataset
        fc = pd.DataFrame(columns=['NodeName','NodeID','Date','Value','Historic'])
        
        fc['Date'] = forecasts['Date']
        fc['Value'] = forecasts[ column]
        fc['NodeName'] = column
        fc['NodeID'] = getNodeIDFromName(column)

        #fc.rename({column: "Value"}, inplace=True)
        fc['Historic'] = 0
        
        # Inner join the forecasts on date
        final_df = final_df.append(fc, ignore_index=True)






final_df.to_csv('./hist_forecast.csv', index=False)
final_df.to_csv('./hist_forecast_withindex.csv', index=True)