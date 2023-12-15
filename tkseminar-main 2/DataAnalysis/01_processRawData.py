import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.linear_model import LinearRegression
import dateutil.relativedelta
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib

import os
import pdb


d = os.getcwd() + "/DataAnalysis"
os.chdir(d)


def generate_factors_table(gdp, usd_index, alu_production, energy_index, usd_cad, usd_rupee, usd_ruble, usd_yuan, gas, oil, zinc, nickel):
    """
    Function:   Generates Dataframe that contains the historical data of the considered risk factors
    Parameters:
        gdp(pandas.DataFrame):              Gross Domestic Product
        usd_index(pandas.DataFrame):        Index of US Dollar
        alu_production(pandas.DataFrame):   Aluminium Production Rates
        energy_index(pandas.DataFrame):     Energy Price Index
        usd_cad(pandas.DataFrame):          Exchange Rate US Dollar to Canadian Dollar
        usd_rupee(pandas.DataFrame):        Exchange Rate US Dollar to Indian Rupee
        usd_ruble(pandas.DataFrame):        Exchange Rate US Dollar to Russian Ruble
        usd_yuan(pandas.DataFrame):         Exchange Rate US Dollar to Chinese Yuan
        gas(pandas.DataFrame):              Gas Price Index
        oil(pandas.DataFrame):              Oil Price Index
    """
    ### copper prices are still missing
    
    alu_production = alu_production[["Date", "Africa", "North America", "South America", "Asia (ex China)", "Western & Central Europe", "Russia & Eastern Europe", "Oceania", "Gulf Cooperation Council", "China (Estimated)", "Estimated Unreported to IAI"]]
    alu_production["Total"] = alu_production.sum(axis="columns", numeric_only=True)
    alu_production["Date"] = pd.to_datetime(alu_production["Date"], format="%d/%m/%Y")
    alu_production.rename(columns={"Total":"Production_total"}, inplace=True)
    energy_index["DATE"] = pd.to_datetime(energy_index["DATE"], format="%Y-%m-%d")
    energy_index.rename(columns={"DATE":"Date", "PNRGINDEXM":"Energy_index"}, inplace=True)
    zinc.rename(columns={"DATE":"Date", "Price":"Zinc"}, inplace=True)
    zinc["Date"] = pd.to_datetime(zinc["Date"], format="%m/%d/%Y")
    zinc['Zinc'] = zinc['Zinc'].str.replace(',','').astype('float')
    nickel.rename(columns={"DATE":"Date", "Price":"Nickel"}, inplace=True)
    nickel["Date"] = pd.to_datetime(nickel["Date"], format="%m/%d/%Y")
    nickel['Nickel'] = nickel['Nickel'].str.replace(',','').astype('float')
    usd_rupee["Date"] = pd.to_datetime(usd_rupee["Date"], format="%Y-%m-%d")
    usd_cad["Date"] = pd.to_datetime(usd_cad["Date"], format="%d/%m/%Y")
    usd_ruble["Date"] = pd.to_datetime(usd_ruble["Date"], format="%Y-%m-%d")
    usd_yuan["Date"] = pd.to_datetime(usd_yuan["Date"], format="%Y-%m-%d")
    usd_rupee.rename(columns={"Open":"Open_usd_rupee"}, inplace=True)
    usd_ruble.rename(columns={"Open":"Open_usd_ruble"}, inplace=True)
    usd_yuan.rename(columns={"Open":"Open_usd_yuan"}, inplace=True)
    usd_cad.rename(columns={"Open":"Open_usd_cad"}, inplace=True)
    usd_index.rename(columns={"Open":"Open_usd_index"}, inplace=True)
    oil["Date"] = pd.to_datetime(oil["Date"])
    oil.rename(columns={"DATE":"Date", "Price":"Oil"}, inplace=True)
    gas["DATE"] = pd.to_datetime(gas["DATE"])
    gas.rename(columns={"DATE":"Date", "PNGASEUUSDM":"Natural Gas"}, inplace=True)
    gdp.rename(columns={"DATE":"Date", "NYGDPMKTPCDWLD":"GDP"}, inplace=True)
    gdp["Date"] = pd.to_datetime(gdp["Date"])
    usd_index["Date"] = pd.to_datetime(usd_index["Date"], format="%m/%d/%Y")
    

    
    # Merge all data sets together
    factors_df = pd.merge(left=gdp, right=usd_index[["Date", "Open_usd_index"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=alu_production, on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=energy_index, on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=usd_ruble[["Date", "Open_usd_ruble"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=usd_rupee[["Date", "Open_usd_rupee"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=usd_cad[["Date", "Open_usd_cad"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=usd_yuan[["Date", "Open_usd_yuan"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=nickel[["Date", "Nickel"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=zinc[["Date","Zinc"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=oil[["Date", "Oil"]], on="Date", how="outer")
    factors_df = pd.merge(left=factors_df, right=gas, on="Date", how="outer")
    
    factors_df = factors_df.sort_values("Date")
    factors_df = factors_df.fillna(method="ffill")
    factors_df.dropna(inplace=True)

    factors_df.to_csv("./ProcessedData/factors.csv", index=False)

    return factors_df



def generate_mg_factors(MG_kg_eur_df, factors_df, output_path):
    """"
    Function:   Generates csv file, that contains all factors on a monthly basis as well as
                the prices per kg for all considered material groups
    Parameters:
        MG_kg_eur_df(pandas.DataFrame): Dataframe that contains the columns warengruppe, Periode, KG, EUR
        factors_df(pandas.DataFrame):   Dataframe that contains the considered risk factors on a daily basis
        output_path(str):               Path where csv file will be stored
    """
    
    MG_kg_eur_df[['waren', 'group']] = MG_kg_eur_df['Warengruppe'].str.split('/', 1, expand=True)
    MG_kg_eur_df = MG_kg_eur_df.drop(['Warengruppe','waren'], axis=1)

    MG_kg_eur_df['EUR'] = MG_kg_eur_df['EUR'].str.replace(',','')
    MG_kg_eur_df['KG'] = MG_kg_eur_df['KG'].str.replace(',','')

    MG_kg_eur_df['EUR'] = MG_kg_eur_df['EUR'].astype(float)
    MG_kg_eur_df['KG'] = MG_kg_eur_df['KG'].astype(float)

    MG_kg_eur_df['price'] = MG_kg_eur_df['EUR']/MG_kg_eur_df['KG']

    MG_kg_eur_df = MG_kg_eur_df.drop(['KG','EUR'], axis=1)

    MG_kg_eur_df['Periode'] = MG_kg_eur_df['Periode'].astype(str)
    MG_kg_eur_df[['w', 'y']] = MG_kg_eur_df['Periode'].str.split('.', 1, expand=True)

    for i in range(0,MG_kg_eur_df.shape[0]):

        if MG_kg_eur_df['y'].iloc[i] == '202':
            MG_kg_eur_df.at[i,'y'] = 2020

    MG_kg_eur_df['w'] = MG_kg_eur_df['w'].astype(str)
    MG_kg_eur_df['y'] = MG_kg_eur_df['y'].astype(str)

    MG_kg_eur_df['date'] = MG_kg_eur_df['y'] + '.' + MG_kg_eur_df['w']

    MG_kg_eur_df['date'] = pd.to_datetime(MG_kg_eur_df['date'],format='%Y.%m')


    MG_kg_eur_df = MG_kg_eur_df.drop(['Periode','w','y'], axis=1)

    MG_kg_eur_df = pd.pivot_table(MG_kg_eur_df, values='price', index=['date'], columns=['group'], aggfunc=np.sum).reset_index()
    MG_kg_eur_df.columns.name = None
    

    # Subtracting 3 Months from the date because fiscal year begins in October
    MG_kg_eur_df["date"] = MG_kg_eur_df["date"].apply(lambda x: x - dateutil.relativedelta.relativedelta(months=3))


    factors_df["Date"] = pd.to_datetime(factors_df["Date"])
    factors_df.set_index("Date", inplace=True)
    factors_df = factors_df.groupby(pd.Grouper(freq='M')).mean()
    factors_df.reset_index(inplace=True)

    factors_df["Date"] = factors_df["Date"].apply(lambda x: x.strftime('%Y-%m'))
    MG_kg_eur_df["date"] = MG_kg_eur_df['date'].apply(lambda x: x.strftime('%Y-%m'))

    entire_df = pd.merge(left=MG_kg_eur_df, right=factors_df, left_on="date", right_on="Date", how="inner")


    entire_df.to_csv(output_path + "/MG_factors.csv", index=False)

    return entire_df

def generate_aluminium_factors(aluminium_prices, factors_df, output_path):
    """
    Function:
    Parameters:
        aluminium_prices(pandas.DataFrame): Dataframe that contains a Date as well as a Price column 
        factors_df(pandas.DataFrame):       Dataframe that contains the considered risk factors on a daily basis
        output_df(str):                     Path, where aluminium_factors.csv will be stored
    """
    # Preprocessing steps of raw aluminium prices file
    aluminium_prices = aluminium_prices[["Date", "Price"]]
    aluminium_prices["Price"] = aluminium_prices["Price"].str.replace(",","").astype("float")
    aluminium_prices["Date"] = pd.to_datetime(aluminium_prices["Date"], format="%m/%d/%Y")

    # Merge both datasets
    aluminium_factors = pd.merge(left=aluminium_prices, right=factors_df, left_on="Date", right_on="Date")

    # Sort data
    aluminium_factors = aluminium_factors.sort_values("Date")

    # Save file
    aluminium_factors.to_csv(output_path + "/aluminium_factors.csv", index=False)

    return aluminium_factors



def generate_regressionvalues_mg(mg_factors_df, output_path):
    """
    Function:   Generates csv file that contains the coefficients of the respective models that were trained
                to predict the material group prices.
    Parameters:
        mg_factors_df(pandas.DataFrame):    Dataframe that contains all factors on a monthly basis as well as
                                            the prices per kg for all considered material groups
        output_path(str):                   Path where csv file will be stored
    """

    mg_factors_df.set_index("date", inplace=True)
    #mg_factors_df =mg_factors_df[:'2022-11-01']

    weights  = pd.DataFrame(columns=["r2","mse","mean_deviation", 'material group','GDP', 'Open_usd_index','Production_total', 'Energy_index',
        'Open_usd_ruble', 'Open_usd_rupee', 'Open_usd_cad', 'Open_usd_yuan',
        'Nickel', 'Zinc', 'intercept'])



    for i in ['5600', '5610', '5620', '5630', '5640', '5650', '5660', '5670', '5680',
        '5800', '5810', '5820', '5830', '5850']:

            x_values = mg_factors_df[['GDP', 'Open_usd_index','Production_total', 'Energy_index',
            'Open_usd_ruble', 'Open_usd_rupee', 'Open_usd_cad', 'Open_usd_yuan',
            'Nickel', 'Zinc']].values
            y_values = mg_factors_df[i].values

            regression_model = LinearRegression()
            regression_model.fit(x_values, y_values)

            y_pred = regression_model.predict(x_values)

            group = {

                    "r2": [r2_score(y_values ,y_pred )],
                    "mse": [mean_squared_error(y_values ,y_pred )],
                    "mean_deviation":[mean_absolute_error(y_values, y_pred) / y_values.mean()],
                    'material group': [i],
                    'GDP': [regression_model.coef_[0]],
                    'Open_usd_index': [regression_model.coef_[1]], 
                    'Production_total': [regression_model.coef_[2]],
                    'Energy_index': [regression_model.coef_[3]], 
                    'Open_usd_ruble' : [regression_model.coef_[4]], 
                    'Open_usd_rupee': [regression_model.coef_[5]],
                    'Open_usd_cad': [regression_model.coef_[6]],
                    'Open_usd_yuan': [regression_model.coef_[7]], 
                    'Nickel': [regression_model.coef_[8]],
                    'Zinc': [regression_model.coef_[9]], 
                    'intercept': [regression_model.intercept_]

                    }

            group = pd.DataFrame(group)
            weights= weights.append(group)

            sns.set_theme(style="darkgrid")

            fig, ax1 = plt.subplots()
            #plt.plot(y_pred, label="Predictions of Regression")
            plt.plot(mg_factors.index, y_pred, label="Predictions of Regression")
            
            #plt.plot(mg_factors[i], label = f"Historical MG {i} Price")
            plt.plot(mg_factors.index, mg_factors[i].values, label = f"Historical MG {i} Price")
            ax1.set_xlabel("Time")
            ax1.set_ylabel(f"MG {i} Price in € per KG")
            
            ax1.set_xticks(ax1.get_xticks()[::8])
            plt.legend()
            ax1.set_title(f"Comparison of Historical MG {i} Prices and the Predictions of the Regression")
            plt.ylim([0, 10])
            plt.savefig(f"mg_{i}_plot.png")
            


    weights= weights.reset_index().drop('index',  axis=1)

    weights.to_csv(output_path + "/regression_values_mg.csv", index=False)

    return weights



def generate_regressionvalues_aluminium(aluminium_factors_df, output_path):
    """
    Function:   Generates csv file that contains the coefficients of the respective models that were trained
                to predict the material group prices.
    Parameters:
        aluminium_factors_df(pandas.DataFrame):     Dataframe that contains all factors on a monthly basis as well as
                                                    the aluminium prices
        output_path(str):                           Path where csv file will be stored
    """

    aluminium_factors_df.set_index("Date", inplace=True)
    #aluminium_factors_df =aluminium_factors_df[:'2022-11-01']

    weights  = pd.DataFrame(columns=["r2","mse", "mean_deviation", 'GDP', 'Open_usd_index','Production_total', 'Energy_index',
        'Open_usd_ruble', 'Open_usd_rupee', 'Open_usd_cad', 'Open_usd_yuan',
        'Nickel', 'Zinc', 'intercept'])

    x_values = aluminium_factors_df[['GDP', 'Open_usd_index','Production_total', 'Energy_index',
            'Open_usd_ruble', 'Open_usd_rupee', 'Open_usd_cad', 'Open_usd_yuan',
            'Nickel', 'Zinc']].values
    y_values = aluminium_factors_df["Price"].values

    regression_model = LinearRegression()
    regression_model.fit(x_values, y_values)

    y_pred = regression_model.predict(x_values)
    
    group = {

            "r2": [r2_score(y_values, y_pred)],
            "mse":[mean_squared_error(y_values, y_pred)],
            "mean_deviation":[mean_absolute_error(y_values, y_pred) / y_values.mean()],
            'GDP': [regression_model.coef_[0]],
            'Open_usd_index': [regression_model.coef_[1]], 
            'Production_total': [regression_model.coef_[2]],
            'Energy_index': [regression_model.coef_[3]], 
            'Open_usd_ruble' : [regression_model.coef_[4]], 
            'Open_usd_rupee': [regression_model.coef_[5]],
            'Open_usd_cad': [regression_model.coef_[6]],
            'Open_usd_yuan': [regression_model.coef_[7]], 
            'Nickel': [regression_model.coef_[8]],
            'Zinc': [regression_model.coef_[9]], 
            'intercept': [regression_model.intercept_]

            }

    group = pd.DataFrame(group)
    weights= weights.append(group)

    weights= weights.reset_index().drop('index',  axis=1)

    weights.to_csv(output_path + "/regression_values_aluminium.csv", index=False)

    fig, ax1 = plt.subplots()
    plt.plot(aluminium_factors.index, y_pred, label="Predictions of Regression")
    
    plt.plot(aluminium_factors.index, aluminium_factors["Price"].values, label = "Historical Aluminium Price")
    ax1.set_xlabel("Time")
    ax1.set_ylabel("Aluminium Price in USD")
    
    ax1.set_xticks(ax1.get_xticks()[::2])
    plt.legend()
    ax1.set_title("Comparison of Historical Aluminium Prices and the Predictions of the Regression")
    plt.ylim([0, 4000])
    plt.savefig("aluminium_plot.png")

    return weights

# Wo ist datei für usd index
#Read in .csv
energy = pd.read_csv("./RawData/EnergyIndex.csv")
gdp = pd.read_csv("./RawData/world_gdp_monthly.csv")
gas = pd.read_csv("./RawData/NaturalGas.csv")
nickel = pd.read_csv("./RawData/NickelPrice.csv")
oil = pd.read_csv("./RawData/BrentOil.csv")
usdcad = pd.read_csv("./RawData/Raw_Usd_Cad.csv")
usd = pd.read_csv("./RawData/usdollarindex.csv")
usdrub = pd.read_csv("./RawData/Raw_Usd_Rub.csv")
usdinr = pd.read_csv("./RawData/Raw_Usd_Inr.csv")
usdyuan = pd.read_csv("./RawData/Raw_Usd_Yuan.csv")
prod_all = pd.read_csv("./RawData/Aluminium_Production_All.csv")
zinc = pd.read_csv("./RawData/ZincPrice.csv" )
mg_prices = pd.read_csv('./RawData/MG_kg_eur.csv')
aluminium_price = pd.read_csv("./RawData/AluminiumPrice.csv")


#Calculate Aluminium Factors
factors_df = generate_factors_table(gdp,usd,prod_all,energy, usdcad, usdinr, usdrub, usdyuan, gas, oil, zinc, nickel)




#Material Groups Factors
mg_factors = generate_mg_factors(mg_prices,factors_df,"./ProcessedData")
aluminium_factors = generate_aluminium_factors(aluminium_price, factors_df, "./ProcessedData")


#Get RegressionValues for MaterialGroups
regression_mg = generate_regressionvalues_mg(mg_factors, "./ProcessedData")
regression_aluminium = generate_regressionvalues_aluminium(aluminium_factors, "./ProcessedData")
