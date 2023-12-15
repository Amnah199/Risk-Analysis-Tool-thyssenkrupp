import pandas as pd
from matplotlib import pyplot
import numpy as np
import logging
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import pmdarima as pm





# SARIMA Forecasting class
class  SarimaForecast():

    def makeForecast(self, df, steps):
        
        # Logging: start
        logging.info("Starting SARIMA forecast ...")
        logging.info("Forecasting Steps: " + str(steps))

        df = df.rename(columns={df.columns[0]: 'DATE'})


        # evaluate difference and seasonal difference
        ndf = df.set_index(['DATE'])
        d = pm.arima.ndiffs(ndf, max_d=3)
        #D = pm.arima.nsdiffs(ndf, max_D=3, m=12)

        # Fit the model
        model = pm.arima.auto_arima(
            ndf
        )

        results = model.predict_in_sample().round() # get modeled values

        forecast = model.predict(steps) # predict n steps
        resultDF = pd.DataFrame(data=forecast)
        #resultDF.columns = ['DATE','SALES']
        logging.info(resultDF)

        return resultDF








class DataFrequency():

    # Detect Datafrequency and add forecasted dates to df
    @staticmethod
    def detectDataFrequency(self, timeinformation_df):

        timeinformation_df['DATE']=pd.to_datetime(timeinformation_df['DATE'])
        timeinformation_df['DIFF'] = pd.to_datetime(timeinformation_df['DATE'].astype(str)).diff(-1).dt.total_seconds().div(60)
        avg_diff = timeinformation_df['DIFF'].mean()

        #MONTHS
        if(avg_diff >= -45000 and avg_diff <= -40000):      
            return "months", timeinformation_df
        
        #WEEKS
        if(avg_diff <= -6000 and avg_diff >= -8000):    
            return "weeks", timeinformation_df

        #DAYS
        if(avg_diff <= -1600 and avg_diff >= -2000):     
            return "days", timeinformation_df

        #YEARS
        if(avg_diff <= -15000000 and avg_diff >= -17000000):            
            return "years", timeinformation_df
    

    @staticmethod
    def addForecastedTimedata(self, frequency, timeinformation_df, steps):
        
        if(frequency=="months"):
            for i in range(steps):
                newdate = timeinformation_df['DATE'].iloc[-1] + relativedelta(months=+1)
                timeinformation_df = timeinformation_df.append({'DATE': newdate},  ignore_index=True)

        if(frequency=="weeks"):
            for i in range(steps):
                newdate = timeinformation_df['DATE'].iloc[-1] + relativedelta(weeks=+1)
                timeinformation_df = timeinformation_df.append({'DATE': newdate},  ignore_index=True)
        
        if(frequency=="days"):
            for i in range(steps):
                newdate = timeinformation_df['DATE'].iloc[-1] + relativedelta(days=+1)
                timeinformation_df = timeinformation_df.append({'DATE': newdate},  ignore_index=True)
        
        if(frequency=="years"):
            for i in range(steps):
                newdate = timeinformation_df['DATE'].iloc[-1] + relativedelta(years=+1)
                timeinformation_df = timeinformation_df.append({'DATE': newdate},  ignore_index=True)

        print(timeinformation_df)
        return timeinformation_df['DATE']


