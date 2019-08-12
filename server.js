// Development environment - we are on our local node server
let express = require('express'),
	 bodyParser = require('body-parser'),
	 app = express(),
	 port = process.env.PORT || 3000;

let alexaVerifier = require('alexa-verifier');
var isFirstTime = true;
const SKILL_NAME = 'Kittycall';
const GET_CAT_MESSAGE = "Here's your cat: ";
const HELP_MESSAGE = 'You can say get me a cat, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const MORE_MESSAGE = 'Do you want more?';
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered"/>';

const data = [
  'Snowy',
  'Patches',
  'Coco'
];

const Age = [
	2,
	2,
	1
];


app.use(bodyParser.json({
	 verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
	 }
  }));

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

function log() {
  if (true) {
    console.log.apply(console, arguments);
  }
}

app.post('/Kittycall', requestVerifier, function(req, res) {
  if (req.body.request.type === 'LaunchRequest') {
    res.json(getNewHero());
    isFirstTime = false;
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End");
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case 'AMAZON.YesIntent':
        res.json(getCat());
        break;
      case 'AMAZON.NoIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      default:
    }
  }
});


function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null);
}

function stopAndExit() {

  const speechOutput = STOP_MESSAGE;
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}

function help() {

  const speechOutput = HELP_MESSAGE;
  const reprompt = HELP_REPROMPT;
  var jsonObj = buildResponseWithReprompt(speechOutput, false, "", reprompt);

  return jsonObj;
}

function getCat() {
  var welcomeSpeechOutput = 'Welcome to Cat Caller <break time="0.3s" />';
  if (!isFisrtTime) {
    welcomeSpeechOutput = '';
  }
  const catArr = data;
  const catIndex = Math.floor(Math.random() * catArr.length);
  const randomCat = catArr[catIndex] + 'is' + Age[catIndex] + 'years old';
  const tempOutput = WHISPER + GET_CAT_MESSAGE + randomCat + PAUSE;
  const speechOutput = welcomeSpeechOutput + tempOutput + MORE_MESSAGE;
  const more = MORE_MESSAGE;
  return buildResponseWithReprompt(speechOutput, false, randomHero, more);
}

function buildResponse(speechText, shouldEndSession, cardText) {

  const speechOutput = "<speak>" + speechText + "</speak>";
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": shouldEndSession,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      },
      "card": {
        "type": "Simple",
        "title": SKILL_NAME,
        "content": cardText,
        "text": cardText
      }
    }
  };
  return jsonObj;
}

function buildResponseWithReprompt(speechText, shouldEndSession, cardText, reprompt) {

  const speechOutput = "<speak>" + speechText + "</speak>";
  var jsonObj = {
     "version": "1.0",
     "response": {
      "shouldEndSession": shouldEndSession,
       "outputSpeech": {
         "type": "SSML",
         "ssml": speechOutput
       },
     "card": {
       "type": "Simple",
       "title": SKILL_NAME,
       "content": cardText,
       "text": cardText
     },
     "reprompt": {
       "outputSpeech": {
         "type": "PlainText",
         "text": reprompt,
         "ssml": reprompt
       }
     }
   }
 };
  return jsonObj;
}

app.listen(port);

console.log('Alexa list RESTful API server started on: ' + port);


