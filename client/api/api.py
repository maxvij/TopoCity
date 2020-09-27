import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from SpacingModel import SpacingModel
from collections import namedtuple
import pandas as pd

app = Flask(__name__)
CORS(app)
model = SpacingModel()

Fact = namedtuple("Fact", "fact_id, question, answer")
Response = namedtuple("Response", "fact, start_time, rt, correct")
Encounter = namedtuple("Encounter", "activation, time, reaction_time, decay")

starttime = 0


@app.route('/time')
def get_current_time():
    return {'time': time.time()}


@app.route('/init')
def init():
    global starttime
    starttime = time.time()
    if len(model.facts) == 0:
        model.add_fact(Fact(1, "4.8896900-52.3740300", "Amsterdam"))
        model.add_fact(Fact(2, "6.5625000-52.9966700", "Assen"))
        model.add_fact(Fact(3, "6.5666700-53.2191700", "Groningen"))
        model.add_fact(Fact(4, "5.2916700-52.7033300", "Enkhuizen"))
        model.add_fact(Fact(5, "5.9694400-52.2100000", "Apeldoorn"))
        model.add_fact(Fact(6, "4.7486100-52.6316700", "Alkmaar"))
    return {'facts': model.facts}


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
        print('REQUEST: ')
        print(correctAnswer)
        print('Start Time: ')
        print(request.json['startTime'])
        print('Response Time: ')
        print(request.json['responseTime'])
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
    cities = pd.read_csv('City_info.csv')
    city_names = cities['Woonplaats'].unique()
    json = pd.Series(city_names).to_json(orient='records')
    return json
    