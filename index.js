module.exports = {
  runSample: runSample,
  runStuff: runStuff
}


const dialogflow = require('dialogflow');
const uuid = require('uuid');

async function runSample(projectId = 'graceful-ratio-195710', text) {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: text,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  //console.log('Detected intent');
  const result = responses[0].queryResult;
  //console.log(`  Query: ${result.queryText}`);
  //console.log(`  Response: ${result.fulfillmentText}`);

  if (result.intent) {
    //console.log(`  Intent: ${result.intent.displayName}`);
    return (result.fulfillmentText);
  } else {
    //console.log(`  No intent matched.`);
    return "No intent matched";
  }
}

// runSample('graceful-ratio-195710');


async function runStuff(text) {
  const pool = require("./creds").pool;
  pool.getConnection(async function (err, connection) {
    let qry = await runSample('graceful-ratio-195710', text);
    if (qry === "No intent matched") {
      return qry;
    }
    connection.query(qry, async function (err, rows) {
        connection.release();
        if (err) throw err;
  
        let result = {};
        result.data = [...rows];
        result.type = 1;
        
        //console.log(result);
        return result;
    });
  });

}

// module.exports = runStuff;