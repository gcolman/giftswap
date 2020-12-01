const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 8089 });


var currentData ={"type": "data", "user":"", "body": [{"giver": "Graeme Colman", "email": "gcolman", "chosen":"false", "wrapped": "1.jpg","unwrapped": "u1.jpg","state": "wrapped","receiver": null,"clue": "It's Big"},{"giver": "Ben Holmes", "email": "bholmes","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "unwrapped","receiver": "Waaqas","clue": "Blue and round"},{"giver": "Anthony Kesterton", "email": "akesterton","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "It's a baby"},{"giver": "Waaqas Kauser", "email": "wkauser","chosen":"false", "wrapped": "3.jpg","unwrapped": "u3.jpg","state": "wrapped","receiver": null,"clue": "kindness is doomed"},{"giver": "Jon Walton", "email": "jwalton","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "ooo missus"},{"giver": "Simon Alcott", "email": "salcot","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "wrapped","receiver": null,"clue": "monkey"},{"giver": "Jo Hodgson", "email": "jhodgson","chosen":"false", "wrapped": "1.jpg","unwrapped": "u6.jpg","state": "wrapped","receiver": null,"clue": "Err random"},{"giver": "Andy Downs", "email": "adownes","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "ops a little bit"},{"giver": "Ben Holmes","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "nice..."}]};
var browseEvent ={"type": "browse","body": "2",};
var selectionEvent = {"type": "newData","body": [{"giver": "Graeme Colman","chosen":"false", "wrapped": "1.jpg","unwrapped": "u1.jpg","state": "wrapped","receiver": null,"clue": "It's Big"},{"giver": "Graeme Colman","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "unwrapped","receiver": "Waaqas","clue": "Blue and round"},{"giver": "Anthony Kesterton","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "It's a baby"},{"giver": "Waaqas Kauser","chosen":"false", "wrapped": "3.jpg","unwrapped": "u3.jpg","state": "wrapped","receiver": null,"clue": "kindness is doomed"},{"giver": "Jon Walton","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "ooo missus"},{"giver": "Simon Alcott","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "wrapped","receiver": null,"clue": "monkey"},{"giver": "Jo Hodgson","chosen":"false", "wrapped": "1.jpg","unwrapped": "u6.jpg","state": "wrapped","receiver": null,"clue": "Err random"},{"giver": "Andy Downs","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "ops a little bit"},{"giver": "Ben Holmes","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "nice..."}]};
var loginEvent={"type": "login","body": "gcolman",};
var nextUserEvent={"type":"nextUser", "email":"gcolman", "name":"", "remainingUsers":"0"};
var stateEvent={"type":"state", "body":"lobby" };
var loggedInUsers={"type": "loggedInUsers", "body": []};
var loginError={"type": "loginError", "body": "Login failed"};
var allUsers = [];
var allUsersRemainingToPlay = [];
var allUsersHavingPlayed = [];

handleInit();
/**
 * The main websocket for the game server.
 */
wss.on('connection', function connection(ws) {
 
  handleInit();

  ws.on('message', function incoming(data) {
    msg = JSON.parse(data);
    console.log(msg);

    //If a login then send back the current data
    if(msg.type =="login"){
      handleLogin(data, ws);
    } else if(msg.type =="logout") { 
      handleLogout(data);
    }else if(msg.type =="init") {
      ws.send(JSON.stringify(currentData));
      ws.send(JSON.stringify(stateEvent));
    } else if(msg.type =="selectionEvent") {
      handleNewData(data);
    } else if(msg.type ==="nextUser") {
      newUser(ws);
    } else if(msg.type ==="state") {
      BroadcastMessage(JSON.stringify(msg));
    } else if(msg.type ==="data") {
      BroadcastMessage(JSON.stringify(msg));
    } else if(msg.type ==="reset") {
      BroadcastMessage(JSON.stringify(currentData));
      BroadcastMessage(JSON.stringify(stateEvent));
      loggedInUsers.body = [];
    } else if(msg.type ==="giftSelect") {
      handleGiftSelect(msg);
    }  else if(msg.type ==="giftSteal") {
      handleGiftSwap(msg);
    } 
  });
  //endon
});

BroadcastMessage = (data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
       client.send(data);
     }
   });
};

/**
 * Handle a gift selection event
 */
handleGiftSelect = (msg) => {
  //remove the user from the remaining users
  removeRemainingUser(msg.user);
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
  BroadcastMessage(JSON.stringify(nextUserEvent));
}

/**
 * Handle login data
 */
handleLogin = (data, ws) => {
  loginObj=JSON.parse(data);
  
  if(allUsers.includes(loginObj.body)) { // check to see if the user is in the valid list of loggedInUsers taken from allUsers
    
    if(!loggedInUsers.body.includes(loginObj.body)) { // process if not already logged in.
      loggedInUsers.body.push(loginObj.body);
    
      //Ifnot already played then add to the waiting to play 
      if(!allUsersHavingPlayed.includes(loginObj.body)) {
        //add to waiting to play
        allUsersRemainingToPlay.push(loginObj.body);
      }

      // send the current data back to the user
      var loginData = currentData;
      loginData.type = "loginSuccess";
      loginData.user = loginObj.body;
      ws.send(JSON.stringify(loginData));
    
      //send everyone the updated list of loggedInUsers
      BroadcastMessage(JSON.stringify(loggedInUsers));
    }
  } else {
    console.log(loginError);
    ws.send(JSON.stringify(loginError)); //send an error message back
  }
};


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
newUser = (ws) => {
  //If a user i
  var user = allUsersRemainingToPlay[Math.floor(Math.random() * allUsersRemainingToPlay.length)];
  nextUserEvent.email = user;
  nextUserEvent.remainingUsers = allUsersRemainingToPlay.length;

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
 * Initialise data
 */
function handleInit(){
  //if restart (i.e the websocket server has gone down mid game) then reload the in game data
  //else reload start data

  allUsers = currentData.body.map(user => user.email);
};

