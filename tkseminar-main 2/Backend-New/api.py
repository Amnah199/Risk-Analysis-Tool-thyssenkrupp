from flask import Flask,request,jsonify,send_file, Response
from flask_cors import CORS
import pandas as pd
import logging
from Node import Node
import json
from pathlib import Path
import mysql.connector
import csv
import os
import time

time.sleep(30)

config_sql = {
    'host' : "db",
    'port' : "3306",
    'user' : "root",
    'password' : "password"
}

config_sql_tom = {
    'host' : "localhost",
    'port' : "3306",
    'user' : "root",
    'password' : "password"
}

config = {}

try:
    mydb = mysql.connector.connect(**config_sql)
    config = config_sql
except Exception:
    mydb = mysql.connector.connect(**config_sql_tom)
    config = config_sql_tom

# Abbreviations for queries
# m_id -> material_id
# network -> network_id

class CustomEncoder(json.JSONEncoder):
    def default(self, o):
            return o.__dict__

app = Flask(__name__)
cors = CORS(app)
logging.basicConfig(format='%(asctime)s,%(msecs)d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO)


def create_network_objects(content):



    # First Level
    root_node = Node(content['attributes']['node_id'], content['name'],
                          content['attributes']['new_expected_value'],
                          content['attributes']['initial_regression_value'], content['attributes']['expected_change'],
                          content['attributes']['coefficient'], content['attributes']['intercept'],
                          content['attributes']['lvl'], [], content['unit'])

    # Second Level
    nodes = content['children']
    for i in nodes:

        # Third Level
        if "children" in i:

            new_node = Node(i['attributes']['node_id'], i['name'], i['attributes']['new_expected_value'],
                            i['attributes']['initial_regression_value'], i['attributes']['expected_change'],
                            i['attributes']['coefficient'], i['attributes']['intercept'], i['attributes']['lvl'], [], i['unit'])
            for j in i['children']:
                cnode = Node(j['attributes']['node_id'], j['name'], j['attributes']['new_expected_value'],
                             j['attributes']['initial_regression_value'], j['attributes']['expected_change'],
                             j['attributes']['coefficient'], j['attributes']['intercept'], j['attributes']['lvl'], [], i['unit'])
                new_node.add_child(cnode)
            root_node.add_child(new_node)

        else:
            new_node = Node(i['attributes']['node_id'], i['name'], i['attributes']['new_expected_value'],
                            i['attributes']['initial_regression_value'], i['attributes']['expected_change'],
                            i['attributes']['coefficient'], i['attributes']['intercept'], i['attributes']['lvl'], [], i['unit'])

            root_node.add_child(new_node)

    return root_node

#
#
def get_parent(root, node):

    for child in root.children:
        if(node.node_id == child.node_id):
            return root
        else:

            for rc in root.children:

                for c in rc.children:

                    if (node.node_id == c.node_id):
                        return rc




def update_networknode(root,node_id,value):
    changed_node = get_node_byID(root,node_id)
    changed_node.set_expected_change(value)
    logging.info(changed_node.name + " set to " + str(changed_node.new_expected_value))

    parent = get_parent(root,changed_node)

    if parent.node_id == 0:
        new_parent_value = parent.cal_new_expected_value()

    else:
        update_networknode_regressions(root,parent.node_id)



#
## Method updates the regression values of the whole network recursively given an initially changed node
# root: Final Node
# node_id: the ID of the node that just got changed
#
def update_networknode_regressions(root,node_id):

    changed_node = get_node_byID(root,node_id)
    changed_node.cal_new_expected_value()
    logging.info(changed_node.name + " regression value set to " + str(changed_node.new_expected_value))

    parent = get_parent(root,changed_node)

    if(parent.node_id == 0):
        new_parent_value = parent.cal_new_expected_value()

    else:
        update_networknode_regressions(root,parent.node_id)


def get_node_byID(root,id):

    if root.node_id == id:
        return root
    else:
        root = root.get_children()

        for i in root:

            if i.node_id == id:
                return i
            else:
                if i.children:

                    for j in i.children:

                        if j.node_id == id:
                            return j

    return None



def read_network(m_id, s_id):
    mydb = mysql.connector.connect(**config)
    cursor = mydb.cursor()

    query = ("SELECT * FROM db.network WHERE material_id = " + str(m_id) + " and scenario_id = " + str(s_id)  + " and basis = 0")
    logging.info(query)
    cursor.execute(query)

    for(network_id, m_id, json_data, basis, scenario_id, scenario_name) in cursor:
        network = json.loads(json_data)

    return network



@app.route('/get_scenarios', methods=['GET'])
def get_scenarios():
    mydb = mysql.connector.connect(**config)
    cursor = mydb.cursor()

    query = ("SELECT scenario_id, scenario_name FROM db.network WHERE basis = 0")
    logging.info(query)
    cursor.execute(query)


    df = pd.DataFrame(cursor.fetchall())
    df.columns = [ x[0] for x in cursor.description ]

    df = df.drop_duplicates()
    df.set_index('scenario_id', inplace=True)
    #res = {}
    #res = {"scenario_id": df['scenario_id'].unique().tolist(),
    #        "scenario_name": df['scenario_name'].unique().tolist()}

    return df.to_json()



@app.route('/change_network', methods=['POST'])
def change_network():

    logging.info("Changing network ...")
    content = request.json
    nodeid = content['id']
    expChange = content['expChange']
    m_id = content['m_id']

    if m_id == 0:

        #Aluminium
        s_id = 0
        final_json = ''
        mydb = mysql.connector.connect(**config)
        cursor = mydb.cursor()


        current_network = read_network(0, 0)
        root = create_network_objects(current_network)
        update_networknode(root, nodeid, expChange)
        json_data = root.to_json()
        query = ("UPDATE db.network SET json_file = '" + str(json_data).replace("'", '"').replace(" None", " null") + "' WHERE material_id = 0 and basis = 0 and scenario_id = " + str(s_id))
        cursor.execute(query)
        mydb.commit()
        return jsonify(json_data) 

    else:
        s_id = content['s_id']
        final_json = ''
        mydb = mysql.connector.connect(**config)
        cursor = mydb.cursor()

        for x in [5600, 5610, 5620, 5640, 5650,5670,5680,5800,5810,5820,5850]:
            current_network = read_network(x, s_id)
            root = create_network_objects(current_network)
            update_networknode(root, nodeid, expChange)
            json_data = root.to_json()

            #query = ("UPDATE db.network SET json_file = NULL WHERE network_id = " + str(net_id))
            query = ("UPDATE db.network SET json_file = '" + str(json_data).replace("'", '"').replace(" None", " null") + "' WHERE material_id = "
                    + str(x) + " and basis = 0 and scenario_id = " + str(s_id))
            cursor.execute(query)
            mydb.commit()
            if int(m_id) == x:
                final_json = json_data

        return jsonify(final_json)

@app.route('/create_scenario', methods=['POST'])
def create_scenario():
    logging.info("Creating new scenario...")
    content = request.json
    logging.info(content)
    s_name = content['s_name']
    final_json = ''
    mydb = mysql.connector.connect(**config)
    cursor = mydb.cursor()

    #GET highest scenarioID
    query = ("SELECT MAX(scenario_id) AS max_id FROM db.network ")
    cursor.execute(query)


    result_max_id = cursor.fetchall()[0][0]
    result_max_id = result_max_id + 1


    for x in [5600, 5610, 5620, 5640, 5650,5670,5680,5800,5810,5820,5850]:
        current_network = read_network(x, 0)
        root = create_network_objects(current_network)
        json_data = root.to_json()
        query = ("INSERT INTO db.network (material_id, json_file, basis,scenario_id, scenario_name) VALUES ( " + str(
                x) + " , '" + str(json_data).replace("'", '"').replace(" None", " null")
                     + "', 0, " + str(result_max_id) + ", '" + str(s_name) + "')")
        cursor.execute(query)
        mydb.commit()
    
    return get_scenarios()




@app.route('/reset_network', methods=['GET'])
def reset_network():

    logging.info("CALLED")
    m_id = request.args.get('m_id')
    s_id = request.args.get('s_id')
    mydb = mysql.connector.connect(**config)
    cursor = mydb.cursor()


    if m_id == 0:

        #Aluminium
        query = ("SELECT * FROM db.network WHERE material_id = 0 and basis = 1")
        logging.info(query)
        cursor.execute(query)

        for(network_id, m_id, json_data, basis, scenario_id, scenario_name) in cursor:
            update_network = json.loads(json_data)

        query = ("UPDATE db.network SET json_file = '" + str(update_network).replace("'", '"').replace(" None", " null")
                + "' WHERE material_id = 0 and scenario_id = 0 and basis = 0" )
        cursor.execute(query)

        mydb.commit()
        base_network = read_network(m_id, s_id)

        return base_network

    else:    


        for x in [5600, 5610, 5620, 5640, 5650,5670,5680,5800,5810,5820,5850]:

            query = ("SELECT * FROM db.network WHERE material_id = " + str(x) + " and basis = 1")
            logging.info(query)
            cursor.execute(query)

            for(network_id, nodeid, json_data, basis, scenario_id, scenario_name) in cursor:
                update_network = json.loads(json_data)


            query = ("UPDATE db.network SET json_file = '" + str(update_network).replace("'", '"').replace(" None", " null")
                    + "' WHERE basis = 0 and material_id = " + str(x) + " and scenario_id = " + str(s_id))
            cursor.execute(query)
        

        mydb.commit()
        base_network = read_network(m_id, s_id)
        logging.info(m_id)
        return base_network

@app.route('/get_network', methods=['GET'])
def get_network():
    m_id = request.args.get('m_id')
    s_id = request.args.get('s_id')

    return read_network(m_id,s_id)




@app.route('/getData', methods=['GET'])
def getData():

    mydb = mysql.connector.connect(**config)
    cursor = mydb.cursor()
    query = ("SELECT * FROM db.data")
    cursor.execute(query)





@app.route('/get_node_graph', methods=['GET'])
def get_node_graph():

    node = request.args.get('node')


    mydb = mysql.connector.connect(**config)
    cursor = mydb.cursor()
    query = ("SELECT * FROM db.data WHERE NodeID = " + str(node))
    cursor.execute(query)


    df = pd.DataFrame(cursor.fetchall())
    df.columns = [ x[0] for x in cursor.description ]

    df = df.drop('NodeName', axis=1)
    # df = df.drop('Historic', axis=1)
    df = df.drop('NodeID', axis=1)

    df.rename(columns={"Date":"date"}, inplace=True)
    df.rename(columns={"Historic":"historic"}, inplace=True)
    #df.rename(columns={"Historic":"historic"}, inplace=True)
    df.rename(columns={"Value":"value"}, inplace=True)
    df['date']= pd.to_datetime(df['date'])
    df['date'] = pd.to_datetime(df["date"].dt.strftime('%Y-%m-%d'))

    if node == "1":
        df['value'] = df['value']/pow(10,12)
    
    return Response(
       df.to_csv(index=False ),
       mimetype="text/csv",
       headers={"Content-disposition":
       "attachment; filename=filename.csv"})


    # return send_file("../init/hist_forecast.csv", mimetype='text/csv', as_attachment=True, attachment_filename="hist_forecast.csv")
    ##return send_file('../Forecast/split_feature_data/'+str(node)+'.csv',
    #    mimetype='text/csv',
    #    download_name=str(node)+'.csv',
    #    as_attachment=True)


@app.route('/get_group_overview_graph',methods=['GET'])
def get_group_overview_graph():
    value = request.args.get('value')
    new_csv = get_filtered_csv_from_MG(value)

    return Response(
        new_csv,
        mimetype="text/csv",
        headers={"Content-disposition":
       "attachment; filename=filename.csv"}
    )

def get_filtered_csv_from_MG(value):

    __location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

    filePath = os.path.join(__location__, 'MG_factors.csv')
    df = pd.read_csv(filePath)
    df = df[['date',value]]
    df = df.rename(columns={value:"value"})
    df['date'] = df['date'] + "-01"
    return df.to_csv(index=False)




if __name__ == '__main__':


    app.run(host='0.0.0.0',port=8080)



