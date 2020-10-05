import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from SpacingModel import SpacingModel
from collections import namedtuple
import pandas as pd
import json
from pytrends.request import TrendReq
import requests
from statistics import mean
from scipy import stats

pytrend = TrendReq()
#pytrend = TrendReq(hl='en-GB', tz=360)
starttime = 0
app = Flask(__name__)
CORS(app)
model = SpacingModel()

Fact = namedtuple("Fact", "fact_id, question, answer")
Response = namedtuple("Response", "fact, start_time, rt, correct")
Encounter = namedtuple("Encounter", "activation, time, reaction_time, decay")

@app.route('/time')
def get_current_time():
    return {'time': time.time()}


@app.route('/init')
def init():
    if len(model.facts) == 0:
        # Woonplaatsen,Provincie,Landsdeel,Gemeente,Lattitude,Longitude,Population,Coordinates
        # 12,Assen,Drenthe,Noord-Nederland          ,Assen                              ,52.983333333333334,6.55,68798,"52° 59′ NB, 6° 33′ OL"
        # read city names
        cities = pd.read_csv('cities_10k.csv')
        # remove empty locations
        cities = cities.loc[(cities['Latitude'] != 'No info') & (cities['Longitude'] != 'No info')]
        # create new dataframe
        cities.drop(['Provincie', 'Landsdeel', 'Gemeente', 'Coordinates'], axis=1, inplace=True)

        for index, row in cities.iterrows():
            combinedLongLat = str(row['Longitude']) + "-" + str(row['Latitude'])
            model.add_fact(Fact(index, combinedLongLat, row['Woonplaatsen']))
    return {'facts': model.facts}

@app.route('/start')
def start():
    global starttime
    starttime = time.time()
    print('Started model with start time: ')
    print(starttime)
    return {'start_time': starttime}

@app.route('/facts')
def facts():
    if len(model.facts) == 0:
        init()
    return {'facts': model.facts}


@app.route('/responses')
def responses():
    if len(model.facts) == 0:
        init()
    return {'responses': model.responses}


@app.route('/encounters')
def encounters():
    response = {}
    if model.encounters is None:
        response = {}
    else:
        response = model.encounters
    return {'encounters': response}

@app.route('/getnextfact')
def get_next_fact():
    if len(model.facts) == 0:
        init()
    global starttime
    next_fact, new = model.get_next_fact(time.time() - starttime)
    return {'next_fact': next_fact,
            'new': new}


@app.route('/activationLog')
def log_activations():
    if len(model.facts) == 0:
        init()
    result = []
    for f in model.facts:
        fact = []
        fact.append(f.fact_id)
        fact.append(f.question)
        fact.append(f.answer)
        fact.append(str(model.calculate_activation(time.time() - starttime, f)))
        result.append(fact)
    return jsonify(result)


@app.route('/logresponse', methods=['POST'])
def log_response():
    if len(model.facts) == 0:
        init()
    global starttime
    if request.method == 'POST':
        print('Response log received')
        correctAnswer = False
        if request.json['correct'] == 'true':
            correctAnswer = True
        print('--------')
        print('Start Time: ')
        print(request.json['startTime'])
        print('--------')
        print('--------')
        print('Response Time: ')
        print(request.json['responseTime'] - request.json['startTime'])
        print('--------')
        next_fact, new = model.get_next_fact(time.time() - starttime)
        resp = Response(fact=next_fact, start_time=request.json['startTime'],
                        rt=request.json['responseTime'] - request.json['startTime'],
                        correct=correctAnswer)
        model.register_response(resp)
    return {'responses': model.responses}


@app.route('/citynames')
def city_names():
    if len(model.facts) == 0:
        init()
    # read city names
    cities = pd.read_csv('cities_10k.csv')
    city_names = cities['Woonplaatsen'].unique()
    json = pd.Series(city_names).to_json(orient='records')
    return json
    
@app.route('/initialalphas', methods=['POST'])
def getInitialAlphas():
     if request.method == 'POST':
        cities = request.args.get('cities')
        cleanup = [x.strip() for x in cities.split(',')]
        # read city names
        cities = pd.read_csv('City_info.csv')
        # remove empty locations
        cities = cities.loc[(cities['Latitude'] != 'No info') & (cities['Longtitude'] != 'No info')]
        # create new dataframe
        #cities_len = len(cities)
        columns = ['City', 'Popularity']
        for index, city in enumerate(cleanup):
            columns.append(cleanup[index]) 
        distances = []
        sample = cities['Woonplaats'][:30]
        for city in sample:
            row = []
            row.append(city)
            kw_list = [city]
            popularity = pytrend.build_payload(kw_list, cat=0, timeframe='today 5-y', geo='', gprop='')
            interest_df = pytrend.interest_over_time()
            interest = mean(interest_df[city])
            row.append(int(round(interest)))
            for index, home in enumerate(cleanup):
                uri = "https://www.distance24.org/route.json?stops=" + str(city).strip() + '|' + str(home).strip()
                url = uri.strip()
                try:
                    uResponse = requests.get(url)
                except requests.ConnectionError:
                    return "Connection Error"  
                Jresponse = uResponse.text
                data = json.loads(Jresponse)
                distance = data['distance']
                row.append(distance)
            distances.append(row) 
        df = pd.DataFrame(distances, columns = columns)         
        return df.to_json(orient='records')
        #return pd.Series(cities['Woonplaats']).to_json(orient='records')

@app.route('/initializeuser', methods=['POST'])
def initializeUser():
    if request.method == 'POST':
        # put home cities into an array
        homes = request.args.get('cities')
        homes = [x.strip() for x in homes.split(',')]
        # read city matrix
        cities = pd.read_csv('city_matrix_new.csv')
        columns = ['City', 'Popularity']
        for index, city in enumerate(homes):
            columns.append(homes[index]) 
        columns.append("min_distance")
        columns.append('percentile_popularity')
        columns.append("initial_alpha")
        popularities = []
        distances = []
        for city in cities['City']:
            row = []
            # city col
            row.append(city)
            # popularity col
            popularity = cities.loc[cities['City'] == city, 'Popularity']
            popularities.append(float(popularity))
            row.append(float(popularity))
            # distances of city to homes
            dists = []
            for index, home in enumerate(homes):
                distance = cities.loc[cities['City'] == city, home]
                dists.append(float(distance))
                row.append(float(distance))
            min_dist = min(dists)
            row.append(min_dist)
            pops = cities['Popularity'] 
            pop_score = stats.percentileofscore(pops, float(popularity))
            row.append(pop_score)
            reduction_popularity = 0.075 * (pop_score/100)
            reduction_distance = 0 
            if min_dist < 100 and min_dist > 1:
                reduction_distance = 0.075 * (1/min_dist)
            elif min_dist <= 1:
                reduction_distance = 0.075
            total_reduction = reduction_popularity + reduction_distance
            initial_alpha = .4 - total_reduction
            row.append(initial_alpha)
            distances.append(row)
        df = pd.DataFrame(distances, columns = columns)
        #df['popularity_score'] = 0
        #df.drop(df.columns.difference(['City','initial_alpha']), 1, inplace=True)    
        return df.to_json(orient="records")


@app.route('/popularity', methods=['POST'])
def popularity():
    if request.method == 'POST':
        cities = request.args.get('cities')
        cleanup = [x.strip() for x in cities.split(',')]
        # read city names
        cities = pd.read_csv('City_info.csv')
        # remove empty locations
        cities = cities.loc[(cities['Latitude'] != 'No info') & (cities['Longtitude'] != 'No info')]
        # create new dataframe
        #cities_len = len(cities)
        columns = ['City', 'Popularity']
        for index, city in enumerate(cleanup):
            columns.append(cleanup[index]) 
        distances = []
        sample = cities['Woonplaats'][:30]
        for city in sample:
            kw_list = [city]
            popularity = pytrend.build_payload(kw_list, cat=0, timeframe='today 5-y', geo='', gprop='')
            interest_df = pytrend.interest_over_time()
            interest = mean(interest_df[city])
            #return interest_df.to_json(orient="records")
            distances.append(interest)
        return pd.Series(distances).to_json(orient='values')

        #return pd.Series(cities['Woonplaats']).to_json(orient='records')
