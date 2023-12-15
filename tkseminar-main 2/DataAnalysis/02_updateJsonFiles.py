import csv
import pandas as pd
import json
import os



d = os.getcwd() + "/DataAnalysis"
os.chdir(d)



regressionvalues = {
  #### deleted due to privacy 
  "5850": 4.71,
  "Energy_index": 253.93
}



energy_children = [
        {
          "name": "Oil Price",
          "unit": "USD",
          "attributes": {
            "node_id": 25,
            "intercept": None,
            "new_expected_value": 125,
            "initial_regression_value": 125,
            "expected_change": 0,
            "coefficient": 1.72,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "Gas Price",
          "unit": "USD",
          "attributes": {
            "node_id": 26,
            "intercept": None,
            "new_expected_value": 32.9,
            "initial_regression_value": 32.9,
            "expected_change": 0,
            "coefficient": 2.91,
            "lvl": 2
          },
          "children": []
        }
      ]


prod_children = [
        {
          "name": "Chinese Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 15,
            "intercept": None,
            "new_expected_value": 3475,
            "initial_regression_value": 3475,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "African Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 16,
            "intercept": None,
            "new_expected_value": 144,
            "initial_regression_value": 144,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "Asian (ex China) Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 17,
            "intercept": None,
            "new_expected_value": 394,
            "initial_regression_value": 394,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "Gulf Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 18,
            "intercept": None,
            "new_expected_value": 508,
            "initial_regression_value": 508,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "Russia and Eastern European Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 19,
            "intercept": None,
            "new_expected_value": 344,
            "initial_regression_value": 344,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "West & Central European Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 20,
            "intercept": None,
            "new_expected_value": 236,
            "initial_regression_value": 236,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "North American Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 21,
            "intercept": None,
            "new_expected_value": 313,
            "initial_regression_value": 313,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "South American Production",
          "unit": "1000 tons",
          "attributes": {
            "node_id": 22,
            "intercept": None,
            "new_expected_value": 120,
            "initial_regression_value": 120,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "Oceania Production",
          "attributes": {
            "node_id": 23,
            "intercept": None,
            "new_expected_value": 159,
            "initial_regression_value": 159,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        },
        {
          "name": "Estimated Unreported to IAI",
          "attributes": {
            "node_id": 24,
            "intercept": None,
            "new_expected_value": 160,
            "initial_regression_value": 160,
            "expected_change": 0,
            "coefficient": 1,
            "lvl": 2
          },
          "children": []
        }
      ]


units = {
    'materialgroup': 'USD',
    'Zinc': 'USD',
    'Nickel': 'USD',
    'Energy_index': 'USD',
    'Open_usd_index': 'points',
    'Production_total': '1000 tons',
    'Open_usd_yuan': 'CNY=USD',
    'Open_usd_ruble': 'RUB=USD',
    'Open_usd_cad': 'CAD=USD',
    'Open_usd_rupee': 'INR=USD',
    'GDP': 'trillion USD'
}

node_names = {
    'Zinc': "Global Zinc Price Index",
    'Nickel': "Global Nickel Price Index",
    'Energy_index': "Global Energy Price Index",
    'Open_usd_index': 'USD Index',
    'Production_total': 'Global Production', #Global production (1000 tons)
    'Open_usd_yuan': 'CNY - USD Index',
    'Open_usd_ruble': 'RUB - USD Index',
    'Open_usd_cad': 'CAD - USD Index',
    'Open_usd_rupee': 'INR - USD Index',
    'GDP': 'Global GDP'
}




# Create json
def to_json(material_name, intercept, coefficient, initial_value, child,node_id):

    res = {
        "name": node_names[material_name],
        "unit": units[material_name],
        "attributes": {
            "node_id": node_id,
            "intercept": intercept,
            "new_expected_value": initial_value,
            "initial_regression_value": initial_value,
            "expected_change": 0,
            "coefficient": coefficient,
            "lvl": 1
        },
        "children":child
    }

    return res




mg_regressionvalues = pd.read_csv("ProcessedData/regression_values_mg.csv")
mg_regressionvalues= mg_regressionvalues.drop(['r2','mse','mean_deviation'], axis = 1)
mg_regressionvalues.set_index('material group', inplace=True)

aluminium_regressionvalues = pd.read_csv("ProcessedData/regression_values_aluminium.csv")
aluminium_regressionvalues= aluminium_regressionvalues.drop(['r2','mse','mean_deviation'], axis = 1)



mg_factors = pd.read_csv("./ProcessedData/MG_factors.csv")
aluminium_factors = pd.read_csv("./ProcessedData/aluminium_factors.csv")


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
    'GDP':'GDP',
    'Open_usd_cad': 'Open_usd_cad',
    'Open_usd_yuan':'Open_usd_yuan',
    'Open_usd_ruble': 'Open_usd_ruble',
    'Estimated Unreported to IAI': 'Estimated Unreported to IAI',
    'Open_usd_rupee': 'Open_usd_rupee',
    'Open_usd_index': 'Open_usd_index',
    'Energy_index': 'Energy_index',
    'Production_total': 'Production_total',
    'Nickel':'Nickel',
    'Zinc':'Zinc',
    '5600': 'sd'
}


def get_most_recent_value(column):

  if column == 'Energy_index':
      return regressionvalues['Energy_index']
  else:
    try:
      last_value = mg_factors[match[column]].iloc[-1]
    except:
      last_value = mg_factors[str(column)].iloc[-1]
    return last_value



def get_most_recent_alumium_price():

    last_value = aluminium_factors['Price'].iloc[0]

    return last_value



#
def update_initialchildren_values():

    #Energy
    for index,node in enumerate(energy_children):
        
        last_value = mg_factors[match[node['name']]].iloc[-1]
        energy_children[index]['attributes']['new_expected_value'] = last_value
        energy_children[index]['attributes']['initial_regression_value'] = last_value




    #Production
    for index,node in enumerate(prod_children):
        
        last_value = mg_factors[match[node['name']]].iloc[-1]
        prod_children[index]['attributes']['new_expected_value'] = last_value
        prod_children[index]['attributes']['initial_regression_value'] = last_value
      



update_initialchildren_values()


def updatemg_jsons():
  node_id = 0

  for index, row in mg_regressionvalues.iterrows():

      node_id = 0

      res = {
          "name": str(index) + " Price",
          "unit": units["materialgroup"],
          "attributes": {
              "node_id": node_id,
              "intercept": row[10],
              "new_expected_value": regressionvalues[str(index)],
              "initial_regression_value": regressionvalues[str(index)],
              "expected_change": 0,
              "coefficient": None,
              "lvl": 0
          },
          "children": None
      }

      node_id = node_id + 1




      #Add children
      children = []


      for column in mg_regressionvalues:
          if column != "intercept":

              coefficient = mg_regressionvalues.loc[int(index)][column]

              intercept = None
              child = []
              if column == "Energy_index":
                  intercept =  13.48
                  child = energy_children
              if column == "Production_total":
                  intercept =  0
                  child = prod_children

              child_json = to_json(column, intercept,coefficient,get_most_recent_value(column), child,node_id )



          children.append(child_json)
          node_id = node_id + 1



      res["children"] = children



      #Export json
      filename = "./JSONFiles/network" + str(index) + ".json"
      with open(filename, 'w') as f:
          json.dump(res, f)


def update_jsons():
  node_id = 0


  res = {
      "name": "Aluminium Price",
      "unit": units["materialgroup"],
      "attributes": {
          "node_id": node_id,
          "intercept": aluminium_regressionvalues['intercept'].iloc[0],
          "new_expected_value": get_most_recent_alumium_price(),
          "initial_regression_value": get_most_recent_alumium_price(),
          "expected_change": 0,
          "coefficient": None,
          "lvl": 0
      },
      "children":None
  }

  node_id = node_id + 1




  #Add children
  children = []


  for column in aluminium_regressionvalues:
      if column != "intercept":

          coefficient = aluminium_factors.loc[0][column]

          intercept = None
          child = []
          if column == "Energy_index":
              intercept =  13.48
              child = energy_children
          if column == "Production_total":
              intercept =  0
              child = prod_children

          child_json = to_json(column, intercept,coefficient,get_most_recent_value(column), child,node_id )



      children.append(child_json)
      node_id = node_id + 1



  res["children"] = children



  #Export json
  filename = "./JSONFiles/networkaluminium.json"
  with open(filename, 'w') as f:
      json.dump(res, f)





#Create json files for material groups
updatemg_jsons()


#Aluminium
update_jsons()


pass
