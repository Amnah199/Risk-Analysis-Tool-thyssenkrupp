FROM python:3.7


RUN pip3 install --upgrade pip
RUN pip3 install  --no-cache-dir pandas
RUN pip3 install  --no-cache-dir flask
RUN pip3 install  --no-cache-dir flask-cors
RUN pip3 install  --no-cache-dir scipy
RUN pip3 install  --no-cache-dir mysql-connector-python


COPY Node.py Node.py
COPY api.py api.py


CMD ["python", "api.py"]







