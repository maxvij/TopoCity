import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from SpacingModel import SpacingModel, Fact, Response
from collections import namedtuple
import pandas as pd
import json
import numpy
from pytrends.request import TrendReq
import requests
from statistics import mean
from scipy import stats
from flaskext.mysql import MySQL
from datetime import datetime

# Initialize flask aapp
app = Flask(__name__)
CORS(app)

# Database - DO NOT DELETE!!!
app.config['SECRET_KEY'] = 'julius-jeroen'
mysql = MySQL()
# MySQL configurations - DO NOT DELETE!!!
app.config['MYSQL_DATABASE_USER'] = 'sql7369271'
app.config['MYSQL_DATABASE_PASSWORD'] = 'eHNg15Fujm'
app.config['MYSQL_DATABASE_DB'] = 'sql7369271'
app.config['MYSQL_DATABASE_HOST'] = 'sql7.freesqldatabase.com'
mysql.init_app(app)

# Initialize PyTrend
pytrend = TrendReq()
#pytrend = TrendReq(hl='en-GB', tz=360)

# Timing function
time_in_ms = lambda: int(time.time() * 1000)

# Initialize timing variables
init_time = time_in_ms()
starttime = 0
question_presented_time = 0
response_time = 0
province = ''
duration = 10

# Next facts
next_fact = 0
new = True

# Initialize model
model = SpacingModel()


@app.route('/time')
def get_current_time():
    return {'time': time_in_ms()}

@app.route('/initsession', methods=['POST'])
def initSession():
    if request.method == 'POST':
        global province
        global duration
        global user_id
        province = request.args.get('province')
        duration = request.args.get('duration')
        user_id = request.args.get('user_id')
        datetime_now = datetime.now()
        datetime_now= datetime_now.strftime('%Y-%m-%d %H:%M:%S')
        # insert into db
        connection = mysql.connect()
        query = """ INSERT INTO learning_session
                    (user_id, duration, start, province)
                    VALUES (%s,%s,%s,%s)"""
        data = (user_id, duration, datetime_now, province)
        try:
            # update book title
            cursor = connection.cursor()
            cursor.execute(query, data)
            # get new user id
            learning_session_id = connection.insert_id()
            # accept the changes
            connection.commit()
            data = {
                'learning_session_id': learning_session_id,
                'province': province,
                'duration': duration
                }
            return jsonify(data), 200
        except Exception as error:
            return jsonify(str(error)), 400
        finally:
            cursor.close()
            connection.close()

@app.route('/init')
def init():
    global province
    global duration
    print('Initializing model...')
    print('Length of model.facts: ', len(model.facts))
    print('Resetting log file starttimes.txt')
    with open("starttimes.txt", "w") as text_file:
        text_file.flush()
    if len(model.facts) == 0:
        # Woonplaatsen,Provincie,Landsdeel,Gemeente,Lattitude,Longitude,Population,Coordinates
        # 12,Assen,Drenthe,Noord-Nederland          ,Assen                              ,52.983333333333334,6.55,68798,"52° 59′ NB, 6° 33′ OL"
        # read city names
        cities = pd.read_csv('cities_10k.csv')
        # remove empty locations
        cities = cities.loc[(cities['Latitude'] != 'No info') & (cities['Longitude'] != 'No info')]
        # filter instances in the province
        cities = cities.loc[(cities['Provincie'] == province)]
        # create new dataframe
        cities.drop(['Provincie', 'Landsdeel', 'Gemeente', 'Coordinates'], axis=1, inplace=True)
        

        for index, row in cities.iterrows():
            combinedLongLat = str(row['Longitude']) + "-" + str(row['Latitude'])
            model.add_fact(Fact(index, combinedLongLat, row['Woonplaatsen']))
            # add inalpha to add_fact module
    print(len(model.facts), ' facts added to the model')
    return {'facts': model.facts}

@app.route('/start')
def start():
    global init_time
    global starttime
    global question_presented_time
    global response_time
    # Initialize timing variables
    starttime = time_in_ms() - init_time
    question_presented_time = starttime
    response_time = starttime
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
    global question_presented_time
    global next_fact
    global new
    question_presented_time = time_in_ms() - starttime
    next_fact, new = model.get_next_fact(question_presented_time)
    return {'next_fact': next_fact,
            'new': new}

@app.route('/getactivationlevel')
def getactivationlevel():
    global starttime
    global next_fact
    activationLevel = model.calculate_activation(time_in_ms() - starttime, next_fact)
    if numpy.isinf(activationLevel):
        activationLevel = "-Inf"
    return {'activation':activationLevel}

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
        fact.append(str(model.calculate_activation(time_in_ms() - starttime, f)))
        result.append(fact)
    return jsonify(result)

@app.route('/logresponse', methods=['POST'])
def log_response():
    global next_fact
    global new
    global response_time
    global question_presented_time
    if len(model.facts) == 0:
        init()
    if request.method == 'POST':
        with open("starttimes.txt", "a") as text_file:
            print("Start times: {}".format(question_presented_time), file=text_file)
        print('Response logged')
        print(request.json)
        correctAnswer = False
        if request.json['correct'] == 'true':
            correctAnswer = True
        response_time = time_in_ms()
        resp = Response(fact=next_fact, start_time=question_presented_time,
                        rt=response_time - question_presented_time,
                        correct=correctAnswer)
        print(resp[1])
        print(resp[2])
        print(resp[3])
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

@app.route('/provinces')
def provinces():
    if len(model.facts) == 0:
        init()
    # read city names
    cities = pd.read_csv('cities_10k.csv')
    provinces = cities['Provincie'].unique()
    json = pd.Series(provinces).to_json(orient='records')
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

@app.route('/createuser', methods=['POST'])
def createUser():
    if request.method == 'POST':
        # Connect to the database
        connection = mysql.connect()
        # prepare query and data
        name = request.args.get('name')
        homes = request.args.get('origin')
        query = """ INSERT INTO users
                    (name, homes)
                    VALUES (%s,%s)"""
        data = (name, homes)
        try:
            # update book title
            cursor = connection.cursor()
            cursor.execute(query, data)
            # get new user id
            user_id = connection.insert_id()
            # accept the changes
            connection.commit()
            data = {'user_id': user_id}
            return jsonify(data), 200
            return 'User created sucessfully.'
        except Exception as error:
            return jsonify(str(error)), 400
        finally:
            cursor.close()
            connection.close()