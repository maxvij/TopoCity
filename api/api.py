import time
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from SpacingModel import SpacingModel, Fact, Response
from collections import namedtuple
import pandas as pd
import json
import numpy
import requests
from statistics import mean
from scipy import stats
from flaskext.mysql import MySQL
from datetime import datetime
import sys

# Initialize flask aapp
app = Flask(__name__)
CORS(app)

Session = namedtuple("Session", "session_id, user_id, model, created_at, status, start_time, init_time, question_presented_time, response_time, next_fact, new")

sessions = []

# Database - DO NOT DELETE!!!
app.config['SECRET_KEY'] = 'julius-jeroen'
mysql = MySQL()
# MySQL configurations - DO NOT DELETE!!!
app.config['MYSQL_DATABASE_USER'] = 'PX8ZmX8fDh'
app.config['MYSQL_DATABASE_PASSWORD'] = 'TdOTitmjAw'
app.config['MYSQL_DATABASE_DB'] = 'PX8ZmX8fDh'
app.config['MYSQL_DATABASE_HOST'] = 'remotemysql.com'
mysql.init_app(app)

# Timing function
time_in_ms = lambda: int(time.time() * 1000)

# Initialize timing variables
# init_time = time_in_ms()
# starttime = 0
# question_presented_time = 0
# response_time = 0
# province = ''
# duration = 10
# user_id = 0
# session_id = 0
# Next facts
next_fact = Fact(fact_id=0, question='', answer='', inalpha=0.3)
new = True

# Initialize model
model = SpacingModel()

@app.route('/time')
def get_current_time():
    return {'time': time_in_ms()}

@app.route('/initsession', methods=['POST'])
def initSession():
    if request.method == 'POST':
        global sessions
        model = SpacingModel()
        province = request.args.get('province')
        duration = request.args.get('duration')       
        user_id = request.args.get('user_id')        
        datetime_now = datetime.now()
        datetime_now = datetime_now.strftime('%Y-%m-%d %H:%M:%S')
        # insert into db
        connection = mysql.connect()
        query = """ INSERT INTO learning_session
                    (user_id, duration, start, province)
                    VALUES (%s,%s,%s,%s)"""
        data = (user_id, duration, datetime_now, "Groningen,Friesland")
        try:
            # update book title
            cursor = connection.cursor()
            cursor.execute(query, data)
            # get new user id
            learning_session_id = connection.insert_id()
            session_id = learning_session_id
            print('Creating new session: ')
            new_session = Session(session_id, user_id, model, datetime_now, 'active', 0, time_in_ms(), 0, 0, Fact(fact_id=0, question='', answer='', inalpha=0.3), True)
            print(new_session)
            sessions.append(new_session)
            print(sessions)
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
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        print('Initializing model...')
        print('Length of model.facts: ', len(active_session.model.facts))
        print('Resetting log file starttimes.txt')
        with open("starttimes.txt", "w") as text_file:
            text_file.flush()
        if len(active_session.model.facts) == 0:
            cities = pd.read_csv('cities_10k.csv')
            # remove empty locations
            cities = cities.loc[(cities['Latitude'] != 'No info') & (cities['Longitude'] != 'No info')]
            # filter instances in the province
            Groningen = cities.loc[cities['Provincie'] == 'Groningen']
            Friesland = cities.loc[cities['Provincie'] == 'Friesland']
            cities = pd.concat([Groningen, Friesland], axis=0)
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
                    print(inalpha)
                    initial_alpha = inalpha['initial_alpha'][0]
                #return 'Initial Alpha: ' + str(inalpha['initial_alpha'][0])
                combinedLongLat = str(row['Longitude']) + "-" + str(row['Latitude'])
                active_session.model.add_fact(Fact(index, combinedLongLat, row['Woonplaatsen'],initial_alpha))
                # add inalpha to add_fact module
            connection.close()
    #print(len(model.facts), ' facts added to the model')
    return {
        'facts': model.facts
        }

@app.route('/start')
def start():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        print('Checking every session for session_id')
        print(session_id)
        if session.session_id == session_id:
            print('Found acive session!')
            print('Setting active session')
            active_session = session
    if active_session:
        # Initialize timing variables
        active_session.starttime = time_in_ms() - active_session.init_time
        active_session.question_presented_time = active_session.starttime
        active_session.response_time = active_session.starttime
        print('Started model session with start time: ')
        print(active_session.starttime)
        return {'start_time': active_session.starttime}
    return {'start_time':0}

@app.route('/facts')
def facts():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        print('Checking every session for session_id')
        print(session_id)
        if session.session_id == session_id:
            print('Found active session!')
            print('Setting active session')
            active_session = session
    if active_session:
        return {
            'user_id': active_session.user_id,
            'facts': active_session.model.facts
            }
    return {
        'user_id': 0,
        'facts': []
    }

@app.route('/responses')
def responses():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        return {'responses': active_session.model.responses}
    return {'responses' : []}

@app.route('/getnextfact')
def get_next_fact():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        active_session.question_presented_time = time_in_ms() - active_session.starttime
        active_session.next_fact, active_session.new = active_session.model.get_next_fact(active_session.question_presented_time)
        return {'next_fact': active_session.next_fact,
                'new': active_session.new}
    return {'next_fact': [],
            'new':[]}

@app.route('/getactivationlevel')
def getactivationlevel():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        activationLevel = active_session.model.calculate_activation(time_in_ms() - active_session.starttime, active_session.next_fact)
        if numpy.isinf(activationLevel):
            activationLevel = "-Inf"
        return {'activation':activationLevel}
    return{'activation':0}

@app.route('/activationLog')
def log_activations():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        result = []
        for f in active_session.model.facts:
            fact = []
            fact.append(f.fact_id)
            fact.append(f.question)
            fact.append(f.answer)
            fact.append(str(active_session.model.calculate_activation(time_in_ms() - active_session.starttime, f)))
            result.append(fact)
        return jsonify(result)
    return{'activations' : []}

@app.route('/insertactivations')
def insertActivations():
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        try:
            connection = mysql.connect()
            cursor = connection.cursor()
            for f in active_session.model.facts:
                city = str(f.answer)
                activation = str(active_session.model.calculate_activation(time_in_ms() - active_session.starttime, f))
                alpha = str(active_session.model.get_rate_of_forgetting(time_in_ms() - active_session.starttime, f))
                query = """INSERT INTO outcomes
                                (user_id, session_id, city, alpha, activation)
                                VALUES (%s,%s,%s,%s,%s)"""
                data = (active_session.user_id, active_session.session_id, city, alpha, activation)
                cursor.execute(query, data)
            connection.commit()
            return jsonify('Responses have been logged'), 200
        except Exception as error:
                return jsonify(str(error)), 400
        finally:
            cursor.close()
            connection.close()
    return jsonify('No session id given', 200)

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
    global sessions
    session_id = request.args.get('session_id')
    active_session = []
    for session in sessions:
        if session.session_id == session_id:
            active_session = session
    if active_session:
        if request.method == 'POST':
            with open("starttimes.txt", "a") as text_file:
                print("Start times: {}".format(active_session.question_presented_time), file=text_file)
            print('Response logged')
            print(request.json)
            correctAnswer = False
            if request.json['correct'] == 'true':
                correctAnswer = True
            active_session.response_time = time_in_ms()
            resp = Response(fact=active_session.next_fact, start_time=active_session.question_presented_time,
                            rt=active_session.response_time - active_session.question_presented_time,
                            correct=correctAnswer)
            print('RESPONSE LOG MAX: ')
            print(resp)
            active_session.model.register_response(resp)
            city = resp[0][2]
            start_time = str(resp[1])
            reaction_time = str(resp[2])
            correct = 0
            if correctAnswer == True:
                correct = 1
            print(city)
            print(start_time)
            print(reaction_time)
            user_id = request.json['user_id']
            insertResponse(user_id, city, start_time, reaction_time, correct)
        return {
            'city': city,
            'start_time': start_time,
            'reaction_time': reaction_time,
            'correct': correct,
            'responses': model.responses}
    return jsonify('No session id given', 200)

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

@app.route('/initializeuser', methods=['POST'])
def initializeUser():
    user_id = request.args.get('user_id')
    if user_id:
        if request.method == 'POST':
            # put home cities into an array
            homes = request.args.get('cities')
            homes = [x.strip() for x in homes.split(',')]
            # read city matrix
            cities = pd.read_csv('city_matrix_new.csv')
            provinceCities = pd.read_csv('groningen.csv')
            columns = ['City', 'Popularity']
            for index, city in enumerate(homes):
                columns.append(homes[index])
            columns.append("min_distance")
            columns.append('percentile_popularity')
            columns.append("initial_alpha")
            popularities = []
            distances = []
            # Changed to provinceCities to prevent timeout issues online
            for city in provinceCities['City']:
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
    return jsonify('No user id given', 200)

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