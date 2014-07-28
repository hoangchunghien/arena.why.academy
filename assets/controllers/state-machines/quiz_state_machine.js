

var logInfo = "QuizStateMachine: ";

var EVENTS = {
    RESPONSE: {
        INITIALIZING: "quiz_initializing",
        QUESTIONING: "quiz_questioning",
        QUESTION_ANSWERED: "question_answered",
        FINISHED: "quiz_finished",
        ERROR: "quiz_error"
    }
};

function QuizStateMachine(questions, eventListener) {

    var self = this;

    /**
     * Playing information -----------------------------------------------------
     **/
    this.eventListener = eventListener;
    this.quiz = {};
    this.quiz.questions=questions;
    this.result = null;
    this.questionMachines = [];
    this.questionIndex = 0;
    this.currentQuestionMachines = null;


    /*
     * Private methods ---------------------------------------------------------
     */
    // This method _startup run when object is create new
    var _startup = function() {
        self.currentState = self.states['initializing'];
        self.currentState.run();
    };

    var _validateQuiz = function(quiz) {
        //TODO
    };

    var _initialize = function() {

        for (var i = 0; i < self.quiz.questions.length; i++) {
            var question = self.quiz.questions[i];
            self.questionMachines[i] = new QuestionStateMachine(question, self);

        }
        if (self.questionMachines.length > 0) {
            self.currentQuestionMachines = self.questionMachines[0];
            self.currentQuestionMachines.active();
            console.log("active");
        }
    };

    self._nextQuestionMachine = function() {
        if (self.questionMachines.length <= 0)
            return false;

        if (self.questionIndex >= self.questionMachines.length - 1) {
            return false;
        }
        else {
            self.currentQuestionMachines = self.questionMachines[++self.questionIndex];
            self.currentQuestionMachines.active();
            console.log(logInfo + "question index: " + self.questionIndex);
            return true;
        }
    };


    this.states = {
        initializing:
                {
                    name: 'initializing',
                    events: {
                        initialized: 'questioning'
                    },
                    run: function() {
                        console.log(logInfo + "initializing");
                        // Notify to player
                        self.eventListener.handleEventNotification({name: EVENTS.RESPONSE.INITIALIZING, data: {}});
                        _initialize();

                        self.consumeEvent({name: "initialized", data: {}});
                    }
                },
        questioning:
                {
                    name: 'questioning',
                    events: {
                        finish: 'finished'
                    },
                    run: function() {
                        console.log(logInfo + "questioning");
                        self.eventListener.handleEventNotification({name: "quiz_questioning", data: self.currentQuestionMachines.question});
                    },
                    question_events: {
                        question_answer: {
                            accept: true,
                            run: function() {
                                // Checking only when question state is answered
                                if (self.currentQuestionMachines.getCurrentState().name === "answered") {
                                    // If there have no next question, then change state to finished
                                    console.log(logInfo + " answered, next question");
//                                    self.eventListener.handleEventNotification({name:EVENTS.RESPONSE.QUESTION_ANSWERED, data })
                                    if (!self._nextQuestionMachine()) {
                                        console.log(logInfo + " finished quiz");
                                        self.consumeEvent({name: 'finish', data: {}});
                                    }
                                }
                            }
                        }
                    }
                },
        finished:
                {
                    name: 'finished',
                    events: {
                    },
                    run: function() {
                        console.log(logInfo + "finished");
                        self.eventListener.handleEventNotification({name: EVENTS.RESPONSE.FINISHED, data: {}});
                    }
                }

    };

    _startup();
}

QuizStateMachine.prototype.consumeEvent = function(event) {

    var self = this;
    var name = event.name;

    var nextState = self.currentState.events[name];
    if (nextState) {
        console.log(logInfo + " change from '"
                + self.currentState.name + "' to '" + nextState + "'");
        self.currentState = self.states[nextState];
        self.currentState.run();
    }
    else {
        var data = event.data;
        if (self.currentState['question_events']
                && self.currentState.question_events[name]
                && self.currentState.question_events[name].accept) {
            console.log(logInfo + " transport '" + name + "' to QuestionMachine");

            self.currentQuestionMachines.consumeEvent(event);
            setTimeout(function(){
                self.currentState.question_events[name].run();
            },1000);

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
    }
};

QuizStateMachine.prototype.getCurrentState = function() {
    return this.currentState;
};

QuizStateMachine.prototype.getResult = function() {
    return this.result;
};

QuizStateMachine.prototype.handleEventNotification = function(event) {
    var self = this;
    switch (event.name) {
        case "question_answered":
            console.log("test time out");
            self.eventListener.handleEventNotification(event);
            setTimeout(function(){
                self._nextQuestionMachine();
                self.eventListener.handleEventNotification({name:"question_next_question", data:self.currentQuestionMachines.question});
            },1000);
            break;
        case "question_timeout":
            self._nextQuestionMachine();
            self.eventListener.handleEventNotification({name:"question_next_question", data:self.currentQuestionMachines.question});
            break;
        default:
//            console.log(event.data.remainingTime);
            self.eventListener.handleEventNotification(event);
            break;

    }
};

