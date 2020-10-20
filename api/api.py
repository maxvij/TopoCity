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
from recordtype import recordtype

# Initialize flask aapp
app = Flask(__name__)
CORS(app)

Session = recordtype("Session", "session_id user_id model created_at status start_time init_time question_presented_time response_time next_fact new")

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

@app.route('/time')
def get_current_time():
    return {'time': time_in_ms()}

def initSession(user_id):
    model = SpacingModel()
    duration = 10
    province = "Groningen"
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
        learning_session_id = cursor.lastrowid
        session_id = learning_session_id
        print('Database id of the new sesh:')
        print(session_id)
        print('Creating new session: ')
        new_session = Session(session_id, user_id, model, datetime_now, 'active', 0, time_in_ms(), 0, 0, Fact(fact_id=0, question='', answer='', inalpha=0.3), True)
        print('The new session')
        print(new_session)
        global sessions
        sessions.append(new_session)
        print ('All sessions after append:')
        print(sessions)
        # accept the changes
        connection.commit()
        return learning_session_id
    except Exception as error:
        print('Error')
        print(Exception)
        return error
    finally:
        cursor.close()
        connection.close()

def init(session_id, user_id, session_variable):
    active_session = []
    print('Init session_id')
    print(session_id)
    print('Init user_id')
    print(user_id)
    print('Sessions:')
    print(session_variable)
    for session in session_variable:
        print('Checking each session from sessions list')
        if session.session_id == session_id:
            print('SESSION FOUND IN INIT')
            active_session = session
    print(active_session)
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
                print('User ID: ' + str(user_id))
                print('City name: '+ str(city_name))
                print('Session ID: ' + str(session_id))
                if int(user_id) % 2 == 0:
                    condition = 1
                    initial_alpha = 0.3
                else:
                    condition = 0
                    query_string = "SELECT * FROM initial_alphas WHERE session_id = %s AND city = %s LIMIT 1"
                    cursor = connection.cursor()
                    cursor.execute(query_string, (session_id, city_name))
                    records = cursor.fetchall()
                    print('PRINTING RECORDS')
                    print('--------')
                    print(records)
                    # inalpha = pd.read_sql("SELECT * FROM initial_alphas WHERE session_id = %s AND city = %s", connection, params=[int(session_id), city_name])
                    # print(inalpha)
                    if not records:
                        initial_alpha = 0.3
                    else:
                        print('setting initial alpha to')
                        print(records[0][-1])
                        initial_alpha = records[0][-1]
                        # initial_alpha = inalpha['initial_alpha'].tail(1).item()
                #return 'Initial Alpha: ' + str(inalpha['initial_alpha'][0])
                combinedLongLat = str(row['Longitude']) + "-" + str(row['Latitude'])
                active_session.model.add_fact(Fact(index, combinedLongLat, row['Woonplaatsen'],initial_alpha))
                # add inalpha to add_fact module
            connection.close()
        print(len(active_session.model.facts), ' facts added to the model')
        return active_session.model.facts

@app.route('/start')
def start():
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        print('Checking every session for session_id')
        print(session_id)
        if session.session_id == int(session_id):
            print('Setting active session')
            active_session = session
    if active_session:
        # Initialize timing variables
        active_session.start_time = time_in_ms() - active_session.init_time
        active_session.question_presented_time = active_session.start_time
        active_session.response_time = active_session.start_time
        print('Started model session with start time: ')
        print(active_session.start_time)
        return {'start_time': active_session.start_time}
    else:
        return {'start_time':0}

@app.route('/facts')
def facts():
    print('Fetching facts...')
    session_id = int(request.args.get('session_id'))
    active_session = []
    global sessions
    for session in sessions:
        print('Global session variable:')
        print(sessions)
        print('Checking every session for session_id')
        print(str(session.session_id) + ' is the session.session_id')
        print(str(session_id) + ' is the current session')
        if session.session_id == int(session_id):
            print('Found active session!')
            print('Setting active session')
            active_session = session
    if active_session:
        print('Returning active session facts')
        print('Active session:')
        print(active_session)
        print('Active model:')
        print(active_session.model)
        print('Active model facts:')
        print(active_session.model.facts)
        active_model = active_session.model
        facts_from_session = active_model.facts
        print('Returning:')
        print(facts_from_session)
        return {
            'user_id': int(active_session.user_id),
            'facts': facts_from_session
            }
    else:
        return {
            'user_id': 0,
            'facts': []
        }

@app.route('/responses')
def responses():
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        if session.session_id == int(session_id):
            active_session = session
    if active_session:
        return {'responses': active_session.model.responses}
    else:
        return {'responses' : []}

@app.route('/getnextfact')
def get_next_fact():
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        if session.session_id == int(session_id):
            active_session = session
    if active_session:
        active_session.question_presented_time = time_in_ms() - active_session.start_time
        active_session.next_fact, active_session.new = active_session.model.get_next_fact(active_session.question_presented_time)
        return {'next_fact': active_session.next_fact,
                'new': active_session.new}
    else:
        return {'next_fact': [],
            'new':[]}

@app.route('/getactivationlevel')
def getactivationlevel():
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        if session.session_id == int(session_id):
            active_session = session
    if active_session:
        activationLevel = active_session.model.calculate_activation(time_in_ms() - active_session.start_time, active_session.next_fact)
        if numpy.isinf(activationLevel):
            activationLevel = "-Inf"
        return {'activation':activationLevel}
    else:
        return{'activation':0}

@app.route('/activationLog')
def log_activations():
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        if session.session_id == int(session_id):
            active_session = session
    if active_session:
        result = []
        for f in active_session.model.facts:
            fact = []
            fact.append(f.fact_id)
            fact.append(f.question)
            fact.append(f.answer)
            fact.append(str(active_session.model.calculate_activation(time_in_ms() - active_session.start_time, f)))
            result.append(fact)
        return jsonify(result)
    else:
        return jsonify('Could not find active session', 404)

@app.route('/insertactivations')
def insertActivations():
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        if session.session_id == int(session_id):
            active_session = session
    if active_session:
        try:
            connection = mysql.connect()
            cursor = connection.cursor()
            for f in active_session.model.facts:
                city = str(f.answer)
                activation = str(active_session.model.calculate_activation(time_in_ms() - active_session.start_time, f))
                alpha = str(active_session.model.get_rate_of_forgetting(time_in_ms() - active_session.start_time, f))
                query = """INSERT INTO outcomes
                                (user_id, session_id, city, alpha, activation)
                                VALUES (%s,%s,%s,%s,%s)"""
                data = (active_session.user_id, active_session.session_id, city, alpha, activation)
                cursor.execute(query, data)
            connection.commit()
            return jsonify('Responses have been logged'), 200
        except Exception as error:
            print(Exception)
            print(error)
            return jsonify(str(error)), 400
        finally:
            cursor.close()
            connection.close()
    else:
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
    session_id = request.args.get('session_id')
    active_session = []
    global sessions
    for session in sessions:
        if session.session_id == int(session_id):
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
            'responses': active_session.model.responses}
    else:
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
    user_id = int(request.args.get('user_id'))
    session_id = 0
    try:
        session_id = initSession(user_id)
    except Exception as error:
        print('Error')
        print(Exception)
        return error
    print('initializing user')
    print('session_id:')
    print(session_id)
    print('user_id:')
    print(user_id)
    if session_id:
        print('Session_id was found')
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
                    print('Inserting into initial alphas (user id, session_id, city, percentile population, min_distance, initial alpha):')
                    print(user_id)
                    print(',')
                    print(session_id)
                    print(',')
                    print(row['City'])
                    print(',')
                    print(row['percentile_popularity'])
                    print(',')
                    print(row['min_distance'])
                    print(',')
                    print(row['initial_alpha'])
                    query = """INSERT INTO initial_alphas
                            (user_id, session_id, city, percentile_population, min_distance, initial_alpha)
                            VALUES (%s,%s,%s,%s,%s,%s)"""
                    data = (user_id, session_id, row['City'], row['percentile_popularity'], row['min_distance'], row['initial_alpha'])
                    cursor.execute(query, data)
                    count += 1
                # accept the changes
                connection.commit()
                print('Should be in table')
                facts_init = []
                try:
                    print('Now we can init session')
                    facts_init = init(session_id, user_id, sessions)
                except Exception as error:
                    print('Error in init function')
                    print(error)
                finally:
                    print('Finally')
                    data = {
                        'initial_alphas_added': count,
                        'mean_alpha': mean_alpha,
                        'session_id': session_id,
                        'facts': facts_init
                    }
                return jsonify(data), 200
            except Exception as error:
                print(Exception)
                print(error)
                return jsonify(str(error)), 400
            finally:
                cursor.close()
                connection.close()
        #return df.to_json(orient="records")
    else:
        return jsonify('No user id given', 400)

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
            print(Exception)
            print(error)
            return jsonify(str(error)), 400
        finally:
            cursor.close()
            connection.close()

if __name__ == "__main__":
     app.debug = False
     port = int(os.environ.get('PORT', 33507))
     waitress.serve(app, port=port)