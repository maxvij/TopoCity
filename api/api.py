import time
from flask import Flask, request, jsonify, make_response
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
import sys

# Initialize flask aapp
app = Flask(__name__)
CORS(app)

# Database - DO NOT DELETE!!!
app.config['SECRET_KEY'] = 'julius-jeroen'
mysql = MySQL()
# MySQL configurations - DO NOT DELETE!!!
app.config['MYSQL_DATABASE_USER'] = 'PX8ZmX8fDh'
app.config['MYSQL_DATABASE_PASSWORD'] = 'TdOTitmjAw'
app.config['MYSQL_DATABASE_DB'] = 'PX8ZmX8fDh'
app.config['MYSQL_DATABASE_HOST'] = 'remotemysql.com'
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
user_id = 0
session_id = 0
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
        global session_id
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
            session_id = learning_session_id
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
    global province, duration, user_id
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
        #return 'Province: ' + province
        cities = cities.loc[(cities['Provincie'] == province)]
        # create new dataframe
        cities.drop(['Provincie', 'Landsdeel', 'Gemeente', 'Coordinates'], axis=1, inplace=True)
        # get initial alphas of user
        connection = mysql.connect()
        #db = pd.read_sql("SELECT * FROM initial_alphas WHERE user_id = (user_id)", connection)    
        for index, row in cities.iterrows():
            city_name = row['Woonplaatsen']
            #return str(city_name)
            #return 'Db City: ' + str(db['city']) + ' Woonplaats: '+ str(row['Woonplaatsen'])
            #return row.to_json(orient='records')
            #initial_alpha = db.loc[db['city'] == row['Woonplaatsen']]
            condition = 0
            print(user_id)
            if int(user_id) % 2 == 0:
                condition = 1
                initial_alpha = 0.3
            else:
                condition = 0
                inalpha = pd.read_sql("SELECT * FROM initial_alphas WHERE user_id = %s AND city = %s", connection, params=[user_id, city_name])
                initial_alpha = inalpha['initial_alpha'][0]
            #return 'Initial Alpha: ' + str(inalpha['initial_alpha'][0])
            combinedLongLat = str(row['Longitude']) + "-" + str(row['Latitude'])
            model.add_fact(Fact(index, combinedLongLat, row['Woonplaatsen'],initial_alpha))
            # add inalpha to add_fact module
        connection.close()
    #print(len(model.facts), ' facts added to the model')
    return {
        'facts': model.facts
        }

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
    global user_id
    if len(model.facts) == 0:
        init()
    return {
        'user_id': user_id,
        'facts': model.facts
        }

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
        print('f LOG MAX: ')
        print(f)
        fact = []
        fact.append(f.fact_id)
        fact.append(f.question)
        fact.append(f.answer)
        fact.append(str(model.calculate_activation(time_in_ms() - starttime, f)))
        result.append(fact)
    return jsonify(result)

@app.route('/insertactivations')
def insertActivations():
    global user_id
    global session_id
    try:    
        connection = mysql.connect()
        cursor = connection.cursor()
        for f in model.facts:
            city = str(f.answer)
            activation = str(model.calculate_activation(time_in_ms() - starttime, f))
            alpha = str(model.get_rate_of_forgetting(time_in_ms() - starttime, f))
            query = """INSERT INTO outcomes
                            (user_id, session_id, city, alpha, activation)
                            VALUES (%s,%s,%s,%s,%s)"""
            data = (user_id, session_id, city, alpha, activation)
            cursor.execute(query, data) 
        connection.commit()    
        return jsonify('Responses have been logged'), 200
    except Exception as error:
            return jsonify(str(error)), 400
    finally:
        cursor.close()
        connection.close()

@app.route('/insertresponse', methods=['POST'])
def insertResponse(user_id, city, start_time, reaction_time, correct):
    connection = mysql.connect()
    cursor = connection.cursor()
    query = """INSERT INTO responses
                        (user_id, city, start_time, reaction_time, correct)
                        VALUES (%s,%s,%s,%s,%s)"""
    data = (user_id, city, start_time, reaction_time, correct)
    cursor.execute(query, data) 
    connection.commit() 
    return str(connection.insert_id())
    

@app.route('/logresponse', methods=['POST'])
def log_response():
    global next_fact
    global new
    global response_time
    global question_presented_time
    global user_id
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
        print('RESPONSE LOG MAX: ')
        print(resp)
        model.register_response(resp)
        city = resp[0][2]
        start_time = str(resp[1])
        reaction_time = str(resp[2])
        correct = 0
        if correctAnswer == True:
            correct = 1
        print(city)
        print(start_time)
        print(reaction_time)
        insertResponse(user_id, city, start_time, reaction_time, correct)
    return {
        'city': city,
        'start_time': start_time,
        'reaction_time': reaction_time,
        'correct': correct,
        'responses': model.responses}

@app.route('/citynames')
def city_names():
    # read city names
    cities = pd.read_csv('cities_10k.csv')
    city_names = cities['Woonplaatsen'].unique()
    json = pd.Series(city_names).to_json(orient='records')
    return json

@app.route('/provinces')
def provinces():
    # read city names
    cities = pd.read_csv('cities_10k.csv')
    provinces = cities['Provincie'].unique()
    json = pd.Series(provinces).to_json(orient='records')
    return json

@app.route('/users')
def users():
    connection = mysql.connect()
    profiles = pd.read_sql("SELECT * FROM users", connection)
    connection.close()
    return profiles.to_json(orient='records')

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
        # globals
        global user_id
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
        # Connect to the database
        connection = mysql.connect()
        # prepare query and data
        try:
            # update book title
            cursor = connection.cursor()
            mean_alpha = df["initial_alpha"].mean()
            count = 1
            for index, row in df.iterrows():
                query = """INSERT INTO initial_alphas
                        (user_id, city, percentile_population, min_distance, initial_alpha)
                        VALUES (%s,%s,%s,%s,%s)"""
                data = (user_id, row['City'], row['percentile_popularity'], row['min_distance'], row['initial_alpha'])
                cursor.execute(query, data)
                count += 1
            # accept the changes
            connection.commit()
            data = {
                'initial_alphas_added': count,
                'mean_alpha': mean_alpha
            }
            return jsonify(data), 200
        except Exception as error:
            return jsonify(str(error)), 400
        finally:
            cursor.close()
            connection.close()
        #return df.to_json(orient="records")

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

if __name__ == "__main__":
     app.debug = False
     port = int(os.environ.get('PORT', 33507))
     waitress.serve(app, port=port)