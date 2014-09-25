var logInfo = "QuestionStateMachine: ";

var EVENTS = {
    RESPONSE: {
        INITIALIZING: "question_initializing",
        ANSWERING: "question_answering",
        ANSWERED: "question_answered",
        TIMERCHANGED: "question_time_changed",
        TIMEOUT: "question_timeout",
        ENDING: "question_ending",
        FINISH: "question_finish",
        ERROR: "question_error"
    }
};

function QuestionStateMachine(question, eventListener) {

    var self = this;

    /**
     * Playing information -----------------------------------------------------
     **/
    this.question = question;
    this.answer = null;
    this.timeout = 30000 + 1000;  // in milisecond
    this.timeStep = 250;
    this.remainingTime = this.timeout; // in milisecond
    this.correct = false;
    this.eventListener = eventListener;

    this.questionEndingTimer;
    this.questionFinishTimer;

    /*
     * Private methods ---------------------------------------------------------
     */
    // This method _startup run when object is create new
    var _startup = function () {
        self.currentState = self.states['initializing'];
        self.currentState.run();
    };

    var _validateQuestion = function (question) {
        return true;
    };


    this._validateAnswer = function (answer) {
        return true;
    };

    var _initialize = function () {
        // TODO
    };

    var isAnswerCorrect = function(answer) {
        return answer == self.question.answer;
    };

    this.states = {
        initializing: {
            name: 'initializing',
            events: {
                initialized: 'answering'
            },
            run: function () {
                console.log(logInfo + "starting");
                self.eventListener.handleEventNotification({name: "question_initializing", data: {}});
                _initialize();

                // After initialized, change state to answering
                self.consumeEvent({name: 'initialized', data: {}});
            }
        },
        answering: {
            name: 'answering',
            events: {
                question_answer: 'answered',
                question_timeout: 'timeout'
            },
            run: function () {
                console.log(logInfo + "answering");
                self.eventListener.handleEventNotification({name: "question_answering",data: {}});
            }
        },
        answered: {
            name: 'answered',
            events: {
                question_ending: "ending"
            },
            run: function () {
                console.log(logInfo + "answered");
                clearTimeout(self.runtimeout);

                self.eventListener.handleEventNotification({name: "question_answered", data: {}});
                self.consumeEvent({name: "question_ending", data: {}});

            }
        },
        timeout: {
            name: 'timeout',
            events: {
                question_ending: "ending"
            },
            run: function () {
                self.eventListener.handleEventNotification({name: "question_timeout", data: {}});
                self.consumeEvent({name: "question_ending", data: {}});
            }
        },
        ending: {
            name: 'ending',
            events: {
                question_finish: "finish"
            },
            run: function () {
                console.log(logInfo + "ending");
                console.log(self.answer);
                var timeForChangeQuestion;
                self.correct = isAnswerCorrect(self.answer);
                if (self.correct) {
                    self.score = Math.floor(self.remainingTime / 1000);
                    timeForChangeQuestion = 4500; //3500
                } else {
                    self.score = 0;
                    timeForChangeQuestion = 3500; //2000
                }
                var spentTime=-1;
                if(self.remainingTime>0){
                    spentTime = self.timeout + 1000 - self.remainingTime;
                }

                //find index of correct answer
//                var indexOfCorrectAnswer=null;
//                if (self.question.content.choices)
//                for(var i=0; i<self.question.content.choices.length; i++){
//                    if(self.question.content.choices[i].text==self.question.answer){
//                        indexOfCorrectAnswer=i;
//                        break;
//                    }
//                }

                self.questionEndingTimer = setTimeout(function () {
                    self.eventListener.handleEventNotification({name: "question_ending", data: {answer: self.answer,
                        correct: self.correct, score: self.score, correctAnswer: self.question.answer,
                        id: self.question.id, time: spentTime, audio:self.question.question.audio_url}});

                }, 1000);

                self.questionFinishTimer = setTimeout(function () {
                    self.consumeEvent({name: "question_finish", data: {}});
                }, timeForChangeQuestion);

                if (self.remainingTime > 0) {
                    ApolloAnalytics.track("Answered Question", {
                        "Corrected": self.correct, "Spent Time": spentTime
                    });
                }
                else {
                    ApolloAnalytics.track("Answered Question", {
                        "Spent Time": -1
                    });
                }

            }
        },
        finish: {
            name: 'finish',
            events: {

            },
            run: function () {
                console.log(logInfo + "finish");
                self.eventListener.handleEventNotification({name: "question_finish", data: {}});


            }
        }
    };

    _startup();

    this.activeTimer = function () {
        console.log("run Active timer");
        var data = {};
        data.remainingTime = self.remainingTime;

        self.eventListener.handleEventNotification({name: "question_time_changed", data: data});

        var countDown = function () {
            self.runtimeout = setTimeout(function () {
                self.remainingTime -= self.timeStep;
//                console.log(self.remainingTime);
                var data = {};
                data.remainingTime = self.remainingTime;
                self.eventListener.handleEventNotification({name: "question_time_changed", data: data});
//                self.eventListener.handleEventNotification({name: EVENTS.RESPONSE.TIMERCHANGED, data:data});
                if (self.remainingTime <= 0) {
//                    self.consumeEvent({name: "question_timeout"});
                    return;
                }
                countDown();
            }, self.timeStep);
        };

//        setTimeout(function(){ countDown();}, 1000);
        countDown();
    };

}


/**
 * The data from client for question_answer must like this
 *     data: {
*           answer: {..}
*    }
 *
 */
QuestionStateMachine.prototype.destroy = function () {
    clearTimeout(this.questionFinishTimer);
    clearTimeout(this.questionEndingTimer);
    clearTimeout(this.runtimeout);
};

QuestionStateMachine.prototype.consumeEvent = function (event) {

    var self = this;
    var name = event.name;
    var data = event.data;
    var nextState = self.currentState.events[name];

    if (nextState && name === "question_answer" && self._validateAnswer(event.data)) {

        console.log(logInfo + "answer from user: " + JSON.stringify(event.data));
        self.answer = data.answer;
        self.currentState = self.states[nextState];
        self.currentState.run();
    }
    else if (nextState && name !== "question_answer") {
        console.log(logInfo + " change from '"
            + self.currentState.name + "' to '" + nextState + "'");
        self.currentState = self.states[nextState];
        self.currentState.run();
    }
    else {
        self.eventListener.handleEventNotification({
            name: EVENTS.RESPONSE.ERROR,
            data: {
                message: " event '" + name + "' not acceptable in '" + self.currentState.name + "' state",
                cause_by: "Not acceptable event"
            }
        });
    }

};

QuestionStateMachine.prototype.getAnswer = function () {
    return this.answer;
};

QuestionStateMachine.prototype.getCurrentState = function () {
    return this.currentState;
};

QuestionStateMachine.prototype.active = function () {
    console.log("active Timer");
    this.activeTimer();
};
