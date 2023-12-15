import pandas as pd
from fbprophet import Prophet
from matplotlib import pyplot
import numpy as np
import tornado.web
import logging
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# Prophet forecasting class
class ProphetForecast():
    
    def makeForecast(self, prophet_df, steps):
        
        # Logging: start
        logging.info("Starting Prophet forecast ...")
        logging.info("Forecasting Steps: " + str(steps))
        
        # set column names for input df
        # Layout prophet_df -> (ds, y)
        prophet_df = prophet_df.rename(columns={prophet_df.columns[1]: 'y'})
        prophet_df = prophet_df.rename(columns={prophet_df.columns[0]: 'ds'})
        # Ensure that target variable is of dtype float
        prophet_df = prophet_df.astype({'y': float})

        prophet_df.columns = ['ds','y']
        
        
        logging.info("Forecasting Data: ")
        logging.info(prophet_df.tail(5))

        #try:
        # initialize prophet and build a model
        logging.info("Fitting prophet model ...")
        m = Prophet(changepoint_prior_scale = 0.8)
        m.fit(prophet_df)

        # predict n steps
        logging.info("Predicting next " + str(steps)+" steps ...")
        future = m.make_future_dataframe(periods=steps)
        forecast = m.predict(future)
        prophet_df_output = pd.DataFrame(forecast[['ds', 'yhat']])


        #logging.info(prophet_df_output)

        prophet_df_output.columns = ['DATE','Y']
        prophet_df_output['DATE'] = pd.to_datetime(prophet_df_output['DATE'], format='%y-%m-%d')
        prophet_df_output['DATE'].dt.strftime('%m/%d/%Y')
        
        prophet_df_output = prophet_df_output.tail(steps)

        logging.info(prophet_df_output.head(5))

        # respond to the client
        logging.info("Prediction completed")

        return prophet_df_output