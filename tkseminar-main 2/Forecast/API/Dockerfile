FROM python:3.7

RUN pip3 install --upgrade pip
RUN pip3 install  --no-cache-dir pandas
RUN pip3 install  --no-cache-dir tornado
RUN pip3 install  --no-cache-dir requests
RUN pip3 install  --no-cache-dir statsmodels
RUN pip install -U torch==1.5
RUN pip3 install  --no-cache-dir datetime
RUN pip3 install  --no-cache-dir xlrd
RUN pip3 install  --no-cache-dir pystan==2.18.0.0
RUN pip3 install  --no-cache-dir fbprophet==0.6
# RUN pip3 install  --no-cache-dir sklearn
# Throws error - FIX:
RUN pip3 install --no-cache-dir scikit-learn
RUN pip3 install  --no-cache-dir hdbcli
RUN pip3 install  --no-cache-dir PyJWT
RUN pip3 install  --no-cache-dir pmdarima
RUN pip3 install --upgrade   --no-cache-dir numpy


WORKDIR /opt/itsc

COPY forecast_api.py /opt/itsc/
COPY ProphetForecast.py /opt/itsc/
COPY sarima.py /opt/itsc/


CMD ["python", "forecast_api.py"]


