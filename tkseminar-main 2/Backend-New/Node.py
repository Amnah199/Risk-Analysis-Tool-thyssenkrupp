import logging
from scipy.optimize import fsolve
from math import exp


class Node:
    # constructor method
    def __init__(self, node_id, name, new_expected_value, 
                initial_regression_value, expected_change, 
                coefficient,intercept,level, children, unit):
        self.node_id = node_id
        self.name = name
        self.initial_regression_value = initial_regression_value    # originally set value
        self.new_expected_value = new_expected_value #
        self.expected_change = expected_change
        self.coefficient = coefficient      # correlation coefficient
        self.children = children
        self.intercept = intercept          # added to the final val
        self.level = level
        self.unit = unit



    def set_expected_change(self, new_value):
        self.expected_change = 0 #(prev: new_value)
        self.new_expected_value = round(self.new_expected_value + new_value, 2)




    # add children to this node
    def add_child(self, obj):
        self.children.append(obj)


    # return children node object
    def get_children(self):
        return self.children


    def cal_new_expected_value(self):
        logging.info("Update regression value for " + self.name)
        v = 0
        if self.children:
            for node in self.children:
                v = v + node.new_expected_value * node.coefficient
            self.new_expected_value = round(v + self.intercept, 2)
            logging.info("For " + self.name + " " + str(self.new_expected_value))
        return self.new_expected_value




    # Create json
    def to_json(self):

        res = {
            "name": self.name,
            "unit": self.unit,
            "attributes": {
                "node_id": self.node_id,
                "intercept": self.intercept,
                "new_expected_value": self.new_expected_value,
                "initial_regression_value": self.initial_regression_value,
                "expected_change": self.expected_change,
                "coefficient": self.coefficient,
                "lvl": self.level
            },
            "children":None
        }
        children = []
        if self.children:
            for i in self.children:
                
                c = i.to_json()
                children.append(c)

        res["children"] = children
        return res
