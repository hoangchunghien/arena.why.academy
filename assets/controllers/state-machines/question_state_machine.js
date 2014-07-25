var logInfo = "QuestionStateMachine: ";

var EVENTS = {
    RESPONSE: {
        INITIALIZING: "question_initializing",
        ANSWERING: "question_answering",
        ANSWERED: "question_answered",
        TIMERCHANGED:"question_time_changed",
        TIMEOUT:"question_timeout",
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
    this.timeout = 15;
    this.remainingTime = this.timeout;
    this.correct=false;
    this.eventListener = eventListener;

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

    this.states = {
        initializing: {
            name: 'initializing',
            events: {
                initialized: 'answering'
            },
            run: function () {
                console.log(logInfo + "starting");
                self.eventListener.fireStateChanged({name: EVENTS.RESPONSE.INITIALIZING, data: {}});
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
                self.eventListener.fireStateChanged({name: EVENTS.RESPONSE.ANSWERING, data: {}});
            }
        },
        answered: {
            name: 'answered',
            events: {

            },
            run: function () {
                console.log(logInfo + "answered");
                clearTimeout(self.runtimeout);
                console.log(self.answer);
                if(self.answer==self.question.answer){
                    self.correct=true;
                    self.score=self.remainingTime;
                }
                self.eventListener.fireStateChanged({name: "question_answered", data: {answer: self.answer,
                correct:self.correct, score:self.score}});

            }
        },
        timeout:{
            name: 'timeout',
            events: {

            },
            run: function () {
                self.eventListener.fireStateChanged({name: "question_timeout", data: {}});
            }
        }

    };

    _startup();

    this.activeTimer=function(){
        console.log("run Active timer");
        var countDown=function(){
            self.runtimeout=setTimeout(function () {
                self.remainingTime--;
//                console.log(self.remainingTime);
                var data={};
                data.remainingTime=self.remainingTime;
                self.eventListener.fireStateChanged({name:"question_time_changed", data:data});
//                self.eventListener.fireStateChanged({name: EVENTS.RESPONSE.TIMERCHANGED, data:data});
                if(self.remainingTime<=0){
                    self.consumeEvent({name:"question_timeout"});
                    return;
                }
                countDown();

            }, 1000);
        };
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
        self.eventListener.fireStateChanged({
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

QuestionStateMachine.prototype.active=function(){
    console.log("active Timer");
    this.activeTimer();
};
