from flask import Flask,request,jsonify,send_file
from flask_cors import CORS
import pandas as pd
import logging
import json
from pathlib import Path
import mysql.connector
import csv
import os
import time

d = os.getcwd() + "/DataAnalysis"
os.chdir(d)

config = {
    'host' : "localhost",
    'port' : "3306",
    'user' : "root",
    'password' : "password"
}


#mydb = mysql.connector.connect(**config)
#cursor = mydb.cursor()


#Read all json
arr = os.listdir("./JSONFiles")

result = ""


for j in arr:
    
    print(j)

    file = "./JSONFiles/" + j
    input = json.load(open(file)) 

    input = json.dumps(input).replace("'",'"')

    m_id = j.replace("network", "")
    m_id = m_id.replace(".json", "")
    if m_id == "aluminium":
        m_id = 0 
    

    # Scearios
    t = "INSERT INTO db.network (material_id, json_file, basis, scenario_id, scenario_name) VALUES ("+str(m_id) + ", '" + str(input) + "', 0,0, 'S0') "
    result = result + t + "; "
    query = (t)

    logging.info(query)
    #cursor.execute(query)


    t = "INSERT INTO db.network (material_id, json_file, basis, scenario_id, scenario_name) VALUES ("+str(m_id) + ", '" + str(input) + "', 0,1, 'S1') "
    result = result + t + "; "
    query = (t)

    logging.info(query)


    t = "INSERT INTO db.network (material_id, json_file, basis, scenario_id, scenario_name) VALUES ("+str(m_id) + ", '" + str(input) + "', 0,2, 'S2') "
    result = result + t + "; "
    query = (t)

    logging.info(query)


    #BASE
    t1= "INSERT INTO db.network (material_id, json_file, basis,  scenario_id, scenario_name) VALUES ("+str(m_id) + ", '" + str(input) + "', 1,0, 'S0') "
    query = (t1)
    result = result + t1+ "; "
    #cursor.execute(query)

    #mydb.commit()



with open("JSONQueries.txt", "w") as text_file:
    text_file.write(result)



