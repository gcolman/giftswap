const WebSocket = require('ws');
const fs = require('fs');
const wss = new WebSocket.Server({ port: 8089 });
const ADMIN = "gcolman";
const INIT_FILE="./config.json";
const LATEST_STATE_FILE="./latestState.json"

 currentData ={};
var browseEvent ={"type": "browse","body": "2",};
var selectionEvent = {"type": "newData","body": [{"giver": "Graeme Colman","chosen":"false", "wrapped": "1.jpg","unwrapped": "u1.jpg","state": "wrapped","receiver": null,"clue": "It's Big"},{"giver": "Graeme Colman","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "unwrapped","receiver": "Waaqas","clue": "Blue and round"},{"giver": "Anthony Kesterton","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "It's a baby"},{"giver": "Waaqas Kauser","chosen":"false", "wrapped": "3.jpg","unwrapped": "u3.jpg","state": "wrapped","receiver": null,"clue": "kindness is doomed"},{"giver": "Jon Walton","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "ooo missus"},{"giver": "Simon Alcott","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "wrapped","receiver": null,"clue": "monkey"},{"giver": "Jo Hodgson","chosen":"false", "wrapped": "1.jpg","unwrapped": "u6.jpg","state": "wrapped","receiver": null,"clue": "Err random"},{"giver": "Andy Downs","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "ops a little bit"},{"giver": "Ben Holmes","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "nice..."}]};
var loginEvent={"type": "login","body": "gcolman",};
var nextUserEvent={"type":"nextUser", "email":"", "name":"", "remainingUsers":"0", "wasStealVictim":"false"};
var stateEvent={"type":"state", "body":"lobby" };
var resetEvent={"type":"reset", "body":"" };
var loggedInUsers={"type": "loggedInUsers", "body": []};
var loginError={"type": "loginError", "body": "Login failed"};
var loginSuccess={"type": "loginSuccess", "body": ""};
var allUsers = [];
var allUsersRemainingToPlay = [];
var allUsersHavingPlayed = [];

//hnandle some init stuff like reading input files etc.
handleInit();


function handleInit() {
  //if restart (i.e the websocket server has gone down mid game) then reload the in game data
  //else reload start data
  loggedInUsers.body = [];
  allUsers = [];
  allUsersRemainingToPlay = [];
  allUsersHavingPlayed = [];
  readFile(INIT_FILE);
  //allUsers = this.currentData.body.map(user => user.email);
  allUsersRemainingToPlay = allUsers;
  //this.state.remainingUsers = allUsersRemainingToPlay.length;
};


function readFile (filename){
  try {
    data = fs.readFileSync(filename, 'utf8')
    this.currentData = JSON.parse(data);
    console.log("-----> reading file");
    allUsers = this.currentData.body.map(user => user.email);

  } catch (err) {
    console.error(err)
  }
};

function noop() {}

function heartbeat() {
  console.log("pong");
  this.isAlive = true;
}

/**
 * The main websocket for the game server.
 */
wss.on('connection', function connection(ws) {
 
  ws.isAlive = true;

  ws.on('message', function incoming(data) {
    msg = JSON.parse(data);
    console.log(msg);

    //If a login then send back the current data
    if(msg.type =="login"){
      handleLogin(data, ws);
    } else if(msg.type =="logout") { 
      handleLogout(data);
    }else if(msg.type =="init") {
      console.log("initing " +JSON.stringify(currentData));
      ws.send(JSON.stringify(currentData));
      //ws.send(JSON.stringify(stateEvent));
    } else if(msg.type =="selectionEvent") {
      handleNewData(data);
    } else if(msg.type ==="nextUser") {
      handleNextUser(ws);
    } else if(msg.type ==="state") {
      BroadcastMessage(JSON.stringify(msg));
    } else if(msg.type ==="data") {
      currentData = msg;
      console.log("/nsetting data to /n" +JSON.stringify(currentData));
      BroadcastMessage(JSON.stringify(msg));
    } else if(msg.type ==="reset") {
      handleInit();
      resetEvent.body = "reset";
      BroadcastMessage(JSON.stringify(resetEvent));
      BroadcastMessage(JSON.stringify(currentData));
    } else if(msg.type ==="reload") {
      resetEvent.body = "reload";
      reloadData();
    } else if(msg.type ==="giftSelect") {
      handleGiftSelect(msg);
    }  else if(msg.type ==="giftSteal") {
      handleGiftSwap(msg);
    }  else if(msg.type ==="move") {
      BroadcastMessage(JSON.stringify(msg));
    } 
  });
  //endon


  ws.on('pong', heartbeat);

});


const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);


BroadcastMessage = (data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
       client.send(data);
     }
   });
};

/**
 * Reload the data from the file that holds the latest game state.
 */
reloadData = () => {
  readFile(LATEST_STATE_FILE);
  //allUsers = currentData.body.map(user => user.email);
  //reloading needs to update the list of users that have played and are yet to play
  allUsersRemainingToPlay = allUsers;
  for(i=0;i<currentData.body.length;i++){
    if(currentData.body[i].receiver) {
        //remove the user from allremainingtoplay
        for(x=0;x<allUsersRemainingToPlay.length;x++){
          if(allUsersRemainingToPlay[x] === currentData.body[i].receiver) {
            allUsersRemainingToPlay.splice(x, 1); 
          }
        }
      }
    }
  BroadcastMessage(JSON.stringify(currentData));
}

/**
 * Handle a gift selection event. The client will call this event. The client will send a seperate data
 * event which will broadcast the latest data changes.
 */
handleGiftSelect = (msg) => {
  //remove the user from the remaining users
  removeRemainingUser(msg.user);
  persistUpdates();
}

removeRemainingUser = (user) => {
  for(i=0;i<allUsersRemainingToPlay.length;i++){
    if(allUsersRemainingToPlay[i] === user) {
      allUsersRemainingToPlay.splice(i, 1); 
      console.log("remove " +user);
    }
  }
}

/**
 * Handle a gift swap event
 */
handleGiftSwap = (msg) => {
  //add the user back into the remaining users and remove the receibver.
  removeRemainingUser(msg.user);
  allUsersRemainingToPlay.push(msg.victim);
  console.log("adding " +msg.victim);
  nextUserEvent.email = msg.victim;
  nextUserEvent.remainingUsers = allUsersRemainingToPlay.length;
  nextUserEvent.wasStealVictim = "true"; // do that the front end knows that this is in a steal round.
  BroadcastMessage(JSON.stringify(nextUserEvent));
}

/**
 * Handle login data
 */
handleLogin = (data, ws) => {
  loginObj=JSON.parse(data);
  
  if(allUsers.includes(loginObj.body)) { // check to see if the user is in the valid list of loggedInUsers taken from allUsers
    
    //If a new login then pus to the loggedINUsers array
    if(!loggedInUsers.body.includes(loginObj.body)) {
      loggedInUsers.body.push(loginObj.body);
    }
      
      // send the current data back to the user
      loginSuccess.user=msg.body;
      ws.send(JSON.stringify(loginSuccess));

      //send everyone the updated list of loggedInUsers
      BroadcastMessage(JSON.stringify(loggedInUsers));
      BroadcastMessage(JSON.stringify(currentData));

}};


/**
 * Handle the logout
 */
handleLogout = (data) => {
  logoutObj=JSON.parse(data);

  if(loggedInUsers.body.includes(logoutObj.body)) { //check if looged in first, otherwise do nowt
    for( var i = 0; i < loggedInUsers.body.length; i++){    //iterate through and remove.
      console.log(loggedInUsers.body[i]);
      if ( loggedInUsers.body[i] === logoutObj.body) { 
        loggedInUsers.body.splice(i, 1); 
        console.log(loggedInUsers.body);
      }
    }
  }
};

/**
 * New user
 */
handleNextUser = (ws) => {
  //If a user i
  var user = allUsersRemainingToPlay[Math.floor(Math.random() * allUsersRemainingToPlay.length)];
  nextUserEvent.email = user;
  nextUserEvent.remainingUsers = allUsersRemainingToPlay.length;
  nextUserEvent.wasStealVictim = "false"; //only set to true if the next user was a resuklt of a steal
  console.log(nextUserEvent);
  BroadcastMessage(JSON.stringify(nextUserEvent));
  //ws.send(JSON.stringify(nextUserEvent));
}


/**
 * Persist somewhere 
 */
handleNewData = (data) => {
  //persist the new data
};


/**
 * write latest data to latestState.json
 */
persistUpdates = () =>{
  fs.writeFileSync(LATEST_STATE_FILE, JSON.stringify(currentData));
}
