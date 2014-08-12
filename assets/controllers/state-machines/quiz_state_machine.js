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

function QuizStateMachine(quiz, eventListener) {

    var self = this;
    this.startTimer = {};

    /**
     * Playing information -----------------------------------------------------
     **/
    this.eventListener = eventListener;
    this.quiz = {};
    this.quiz.id=quiz.id;
    this.quiz.questions = quiz.questions;
    this.result = {};
    //
    this.result.user_answers=[];
    this.result.point=0;
    //
    this.questionMachines = [];
    this.questionIndex = 0;
    this.currentQuestionMachines = null;


    /*
     * Private methods ---------------------------------------------------------
     */
    // This method _startup run when object is create new
    var _startup = function () {
        mixpanel.track("Start Game", {

        });
        self.currentState = self.states['initializing'];
        self.currentState.run();
    };

    var _validateQuiz = function (quiz) {
        //TODO
    };

    var _initialize = function () {
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

    self._nextQuestionMachine = function () {
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
        initializing: {
            name: 'initializing',
            events: {
                initialized: 'questioning'
            },
            run: function () {
                console.log(logInfo + "initializing");
                // Notify to player
                self.eventListener.handleEventNotification({name: "quiz_initializing", data: {}});

                self.startTimer = setTimeout(function () {
                    _initialize();
                    self.consumeEvent({name: "initialized", data: {}});
                }, 4500);


            }
        },
        questioning: {
            name: 'questioning',
            events: {
                quiz_finish_event: 'finished'
            },
            run: function () {
                console.log(logInfo + "questioning");
                self.eventListener.handleEventNotification({name: "quiz_questioning",
                    data: {question: self.currentQuestionMachines.question, timeout: self.currentQuestionMachines.timeout}});
            },
            question_events: {
                question_answer: {
                    accept: true,
                    run: function () {
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
        finished: {
            name: 'finished',
            events: {
            },
            run: function () {
                console.log(logInfo + "finished");

                self.eventListener.handleEventNotification({name: "quiz_finished_event", data: {quizID:self.quiz.id,result:self.result}});
            }
        }

    };

    _startup();
}

QuizStateMachine.prototype.consumeEvent = function (event) {

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
            setTimeout(function () {
                self.currentState.question_events[name].run();
            }, 1000);

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

QuizStateMachine.prototype.destroy = function () {
    clearTimeout(this.startTimer);
    for (var i = 0; i < this.questionMachines.length; i++) {
        this.questionMachines[i].destroy();
    }
    delete this.questionMachines;
    console.log("Kill Quiz");
};

QuizStateMachine.prototype.getCurrentState = function () {
    return this.currentState;
};

QuizStateMachine.prototype.getResult = function () {
    return this.result;
};

QuizStateMachine.prototype.handleEventNotification = function (event) {
    var self = this;
    switch (event.name) {
        case "question_finish":
            console.log("question_finish");
            self.eventListener.handleEventNotification(event);
            if (self._nextQuestionMachine()) {
                self.eventListener.handleEventNotification({name: "question_next_question",
                    data: {question: self.currentQuestionMachines.question, timeout: self.currentQuestionMachines.timeout}});
            } else {
                self.consumeEvent({name: 'quiz_finish_event', data: {}});
            }
            ;

            break;
        case "question_ending":
            console.log("Test question_ending");

            self.result.user_answers.push({"question_id":event.data.id,"user_answer":event.data.answer,"time":event.data.time});
            self.result.point +=event.data.score;

            self.eventListener.handleEventNotification(event);

            break;
        case "question_answered":
            console.log("test time out");
            self.eventListener.handleEventNotification(event);
            break;
        case "question_timeout":
            self.eventListener.handleEventNotification({name: "question_timeout", data: self.currentQuestionMachines.question});
            break;
        default:
            self.eventListener.handleEventNotification(event);
            break;

    }
};

