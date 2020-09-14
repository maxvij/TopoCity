import time
from flask import Flask, request
from SpacingModel import SpacingModel
from collections import namedtuple

app = Flask(__name__)
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
        model.add_fact(Fact(1, "hello", "bonjour"))
        model.add_fact(Fact(2, "dog", "chien"))
        model.add_fact(Fact(3, "cat", "chat"))
        model.add_fact(Fact(4, "computer", "ordinateur"))
    return {'facts': model.facts}


@app.route('/facts')
def facts():
    return {'facts': model.facts}


@app.route('/responses')
def responses():
    return {'responses': model.responses}


@app.route('/getnextfact')
def get_next_fact():
    global starttime
    print(time.time() - starttime)
    next_fact, new = model.get_next_fact(time.time() - starttime)
    return {'next_fact': next_fact,
            'new': new}


@app.route('/logresponse', methods=['POST', 'GET'])
def log_response():
    global starttime
    next_fact, new = model.get_next_fact(time.time() - starttime)
    resp = Response(fact=next_fact, start_time=time.time() - starttime, rt=(time.time() - starttime) + 5000,
                    correct=True)
    model.register_response(resp)
    return {'responses': model.responses}
