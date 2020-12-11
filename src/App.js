import React from 'react';
import NavBar from "./components/navbar";
import Adminbar from "./components/Adminbar";
import Message from "./components/Message";
//import ModalMessage from "./components/ModalMessage";
import CoverFlowComponent from "./components/coverflow";
import Cookies from 'js-cookie'
import './App.css';
import Lobby from './components/Lobby';
import Userlist from './components/Userlist';

const delay = ms => new Promise(res => setTimeout(res, ms));
const data = [];
const users = [];

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {  
        allData:data,         // Holds all of the pressie array data. This is what the front end UI displays 
        disp:users,           // A list of users in the game 
        loggedIn:"false",     // Is the current session logged onto the game
        loggedInUser:"",      // Who is currently logged in
        realAdminUser:"",     // If defined as an admin then who is that real user (so that the admin can also be a player)
        isAdmin:"false",      // is current user the admin user?
        gamestate:"play",     // State of the game stopped:play:paused
        nextUser:"",          // The next user to play the game. 
        itsMyTurn:"false",    // indicates if it's the current user's turn to play
        activeIndex:0,        // The index of the present in the carousel - should move when this changes
        remainingUsers:0,     // How many users are left to play
        stealRound:"false",   // Indicates that this round of play started with a steal. If so no more steals allowed?
        navbarMessage:"",     // The message to show in the navbar
        messageShow: "true",    // Boolean to indicate if the message jumbptron should be shown.
        msgHeading:"Welcome to the UKI SA Christmas Gift Game",
        msgText:"The rules: Log into the app above. When it's your turn, browse through the gifts in the carousel and you have the option of unwrapping a new present or, you can steal an already unwrapped present from one of ypur colleagues! If a gift is stolen from you then you need to unwrap a new present! Have fun and Merry Christmas!"
      };

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.pause = this.pause.bind(this);
    this.reset = this.reset.bind(this);
    this.respin = this.respin.bind(this);
    this.giftSelectCallback = this.giftSelectCallback.bind(this);
    this.messageHideCallback = this.messageHideCallback.bind(this);
    this.handleBecome = this.handleBecome.bind(this);

    this.login = this.login.bind(this);
    this.ws = new WebSocket('ws://localhost:8089/', 'echo-protocol');
    this.msg = "";
    this.copy = [];


    
    this.ws.onopen = (arg) => {
      // connection opened
      console.log("oooo OnOpen ooooo");
      this.ws.send('{"type":"init"}');
    };


    
    /**
     * This is the main websocket message handler. Calls various funcitons based on the message type.
     */
    this.ws.onmessage = (e) => {
      console.log(e.data);
      this.msg = JSON.parse(e.data);

      if(this.msg.type === "data"){
        this.handleUpdateData(this.msg);
      } else if(this.msg.type === "state") {
          this.handleUpdateState(this.msg);
      } else if(this.msg.type === "users") {
        this.handleUpdateUsers(this.msg);
      } else if(this.msg.type === "loginSuccess") {
        this.handleLoginSuccess(this.msg);
      } else if(this.msg.type === "loginError") {
        //
      } else if(this.msg.type === "nextUser") {
        this.handleUpdateNextUser(this.msg);
      } else if(this.msg.type === "reset") {
        this.handleReset();
      } else if(this.msg.type === "become") {
        this.handleBecome();
      }

    };
    
    this.ws.onerror = (e) => {
        // an error occurred
    };
    this.ws.onclose = this.logout; // function implemented elsewhere
  }

  handleReset(){
  
    var copyState = this.state;
    copyState.loggedIn="false";
    copyState.loggedInUser="";
    copyState.realAdminUser="";
    copyState.isAdmin="false";
    copyState.gamestate="play"; 
    copyState.nextUser="";
    copyState.itsMyTurn="false";
    copyState.activeIndex=0;
    copyState.remainingUsers=0;
    copyState.messageShow= "true";
    copyState.stealRound="false";
    copyState.navbarMessage="";
    copyState.msgHeading="Game has been reset by the administrator - please log in again";
    copyState.msgText="";
    Cookies.set('gwuser', '');
    this.setState(copyState);

  }

    /**
   * Refresh the view of the data.
   * @param {*} msg 
   */
  handleUpdateData(msg){
    var copyState = this.state;
    copyState.allData = msg.body;
    this.setState(copyState);
  }

  /**
   * handle the chaange of state
   * @param {*} msg 
   */
  handleUpdateState(msg){
    if(this.msg.body === "started") {
      this.start("fromWS");
    } else if (this.msg.body === "stopped") {
      this.stop("fromWS");
    } else if (this.msg.body === "paused") {
      this.pause("fromWS");
    } 
  }

  /**
   * a new list of users has been sent, update the app
   * @param {*} msg 
   */
  handleUpdateUsers(msg){
    var copyState = this.state;
    copyState.disp = msg.body;
    this.setState(copyState);
  }

  /**
   * On login success callback, then update the state and then set a client side cookie.
   * @param {*} msg 
   */
  handleLoginSuccess(msg){
    var copyState = this.state;
    copyState.loggedIn = "true";
    copyState.loggedInUser = msg.user;
    //copyState.allData = msg.body;
    copyState.messageShow="false";
    //If the user "isadmin" then set the state to true
    for(var i=0;i<this.state.allData.length;i++){
      if(this.state.allData[i].email === msg.user) {
         if(this.state.allData[i].isAdmin === "true") {
           copyState.isAdmin = "true";
         } 
      }
    }
    this.setState(copyState);
    console.log("::::::::::::setting cookie  " +this.state.allData.type);
    Cookies.set('gwuser', msg.user);
  }

  

  /**
   * Update things to do with next user beiing chosen.
   * @param {*} msg 
   */  
  handleUpdateNextUser = async (msg) =>{
      
      var copyState = this.state;

      //Change the message if the next user is a victem of a steal
      copyState.messageShow = "true";
      if(msg.wasStealVictim === "true") {
        copyState.stealRound="true";
        copyState.msgHeading="Some bugger swiped your gift while you weren't looking!";
      } else {
        copyState.msgHeading="Oooh, who is the next player going to be?";
        copyState.stealRound="false";
      }
      copyState.msgText="";
      this.setState(copyState); //update with the message above

      //Set the state so that the UI is updated then create a 3 second countdown for the next user.
      await delay(1000);
      var i;
      for(i=3;i>=1;i--) {
        copyState.msgHeading=i;
        this.setState(copyState); // countdown
        await delay(1000);
      }

      //Once the countdown has finished then showwho's turn it is
      if(msg.wasStealVictim === "true") {
        copyState.msgHeading= "Never mind, choose another pressie " +msg.email ;
      } else {
        copyState.msgHeading= "Yey! It's your turn " +msg.email +"!" ;
      }
      this.setState(copyState); //show the message

    copyState = this.state;
    copyState.nextUser = msg.email;
    copyState.remainingUsers = msg.remainingUsers;
    copyState.navbarMessage="Current player " +msg.email;
    
    if(msg.email === this.state.loggedInUser) {
      copyState.itsMyTurn = "true";
    } else {
      copyState.itsMyTurn = "false";
    }

    this.setState(copyState);
  }


  /**
   * performs initialisation routines.
   */
  componentDidMount() {
    
    console.log("App:ComponentDidConnect User:" +Cookies.get("gwuser") );
    // If the login cookie (gwuser) was set then fetch it and set the username back in the state. 
    if(Cookies.get("gwuser")) {
      var copyState = this.state;
      copyState.loggedIn = "true";
      copyState.loggedInUser = Cookies.get("gwuser");
      copyState.remainingUsers = this.state.allData.length;
      this.setState(copyState);
    }
  }

  /**
   * Login callback from navbar login. Just sends the login event to the server. 
   * The server will respond with a data event to initialise this user.
   * @param {} data 
   */
  login = (data) => {
    console.log(">>>>" +JSON.stringify(data));
    this.ws.send('{ "type": "login", "body": "' +data +'"}');
  }

  /**
   * Logout callback from navbar logout.
   * Removes the client side cookie and then removes the LoggedIn and loggedInUser fro this session state.
   */
  logout = () => {
    console.log("logout");
   
    Cookies.set('gwuser', '');
    var copyState = this.state;
    copyState.loggedIn = "false";
    copyState.loggedInUser = "";
    this.setState(copyState);
    this.ws.send('{ "type": "logout", "body": "' +this.state.loggedInUser +'"}');
  }

  /**
   * The start event called from both an admin button click and also a start event message. 
   * When called, set the state so that the game updates to add buttons etc. 
   * If called from an admin button press then send an event to the server to update all others. 
   * If called from an event, then another client had the statt button, so update the state but don't send an event. 
   * @param {*} fromEvent 
   */
  start = (fromEvent) => {
    var copyState = this.state;
    copyState.gamestate = "started";
    this.setState(copyState);
    console.log("start! " + fromEvent);
    if(fromEvent !== "fromWS") { //if this event was generated here, then we want send the event to the server. otherwise we are reacting to anothers event 
      console.log("start!!!!");
      this.ws.send('{ "type": "state", "body": "started"}');
    }
  }
    
  /**
   * The stop event called from both an admin button click and also a stop event message. 
   * When called, set the state so that the game updates to add buttons etc. 
   * If called from an admin button press then send an event to the server to update all others. 
   * If called from an event, then another client had the statt button, so update the state but don't send an event. 
   * @param {*} fromEvent 
   */  
  stop = (fromEvent) => {
    console.log("stop!");
    var copyState = this.state;
    copyState.gamestate = "stopped";
    this.setState(copyState);
    if(fromEvent !== "fromWS") { //if this event was generated here, then we want send the event to the server. otherwise we are reacting to anothers event 
      this.ws.send('{ "type": "state", "body": "stopped"}');
    }    
  }

    /**
   * The pause event called from both an callback from an admin button click and also a pause event message. 
   * When called, set the state so that the game updates to add buttons etc. 
   * If called from an admin button press then send an event to the server to update all others. 
   * If called from an event, then another client had the statt button, so update the state but don't send an event. 
   * @param {*} fromEvent 
   */
  pause = (fromEvent) => {
    var copyState = this.state;
    copyState.gamestate = "paused";
    this.setState(copyState);
    console.log("pause!");
    if(fromEvent !== "fromWS") { //if this event was generated here, then we want send the event to the server. otherwise we are reacting to anothers event 
      this.ws.send('{ "type": "state", "body": "paused"}');
    }
  }

    /**
   * Callback from teh adminBar react component to select the next user to play the game. 
   * @param {*} fromEvent 
   */
  respin = () => {
    console.log("respin!");
    this.ws.send('{ "type": "nextUser"}');
  }

  /**
   * Rest the whole game
   */
  reset = () => {
    console.log("reset!");
    this.ws.send('{ "type": "reset"}');
  }

  /**
   * Admin function to become any player. Simply swapping the logged in user for the user sent through.
   */
  handleBecome = (user) => {
    console.log("become " +user);
    var copyState = this.state;
    copyState.realAdminUser = copyState.loggedInUser;
    copyState.loggedInUser = user;
    //var nextUserEvent={"type":"nextUser", "email": this.state.nextUser, "remainingUsers": this.state.remainingUsers, "wasStealVictim": this.state.wasStealVictim};
    // if becoming a user who's tiurn it is then set itsMyTurn
    if(user === this.state.nextUser) {
      copyState.itsMyTurn = "true";
    }
    this.setState(copyState);
    //this.handleUpdateNextUser(nextUserEvent);
  }

  /**
   *   Callback for coverflow component 
   *    When a gift is selected then set the data to show it. Check the activeindex for the gift to be updated.
   */
  giftSelectCallback = (index) => {
    //unwrap this present!
    this.copystate = this.state;
    this.copystate.allData[index].state = "unwrapped";
    this.copystate.allData[index].receiver = this.state.loggedInUser;
    this.copystate.itsMyTurn = "false";
    this.setState(this.copystate);
    this.ws.send('{ "type": "data", "body":' +JSON.stringify(this.state.allData) +'}');
    this.ws.send('{ "type": "giftSelect", "user":"' +this.state.loggedInUser +'"}');
  }

  /**
   * The mechanics of unwrapping is to update the data.
   * @param {} index 
   */
  unwrap(index){
    this.copystate = this.state;
    this.copystate.allData[index].state = "unwrapped";
    this.copystate.allData[index].receiver = this.state.loggedInUser;
    this.copystate.itsMyTurn = "false";
    this.setState(this.copystate);
  }

  /**
   * On a steal, we give the present to the loggedInUser. 
   * We also need to put the user back into the nextUser to select position.
   * @param {*} index 
   */
  giftStealCallback = (index) => {
    // give the go back to who owned the present.
    var victim = this.state.allData[index].receiver; //The original receiver has had it sttolen!
    var theif = this.state.loggedInUser;
    this.unwrap(index);
    this.ws.send('{ "type": "data", "body":' +JSON.stringify(this.state.allData) +'}');
    this.ws.send('{ "type": "giftSteal", "user":"' +theif +'", "victim":"' +victim +'"}');
    
  }

  messageHideCallback = () => {
    this.copystate = this.state;
    this.copystate.messageShow = "false";
    this.setState(this.copystate);
  }


  /**
   * The main render component of the whole game.
   */
    render() {
      return(
        <div className="App">
          <NavBar parentState={this.state}  loginFunc={this.login} logoutFunc={this.logout} userLoggedIn={this.state.loggedIn} nextUser={this.state.nextUser} gamestate={this.state.gamestate} itsMyTurn={this.state.itsMyTurn}/>  
          
          {this.state.isAdmin === "true" ? (
            <div>
            <Adminbar parentState={this.state} start={this.start} stop={this.stop} pause={this.pause} reset={this.reset} respin={this.respin} become={this.handleBecome} />
            </div> 
          ) : (
            <div/>
          )} 

          {this.state.messageShow === "true" ? (
            <Message parentState={this.state} messageHideCallback={this.messageHideCallback} />
            ) : (
              <div/>
            )} 
          {this.state.gamestate === "stopped" ? 
            (<div>
                <Lobby/>
            </div> )
          :(
            <CoverFlowComponent giftData={this.state.allData} giftSelectCallback={this.giftSelectCallback} giftStealCallback={this.giftStealCallback} activeIndex={this.state.activeIndex} loggedIn={this.state.loggedIn}  gamestate={this.state.gamestate} nextUser={this.state.nextUser} itsMyTurn={this.state.itsMyTurn} isStealRound={this.state.stealRound}/>
          )}
          <div>
            <Userlist loggedInUsers={this.state.disp}  />
          </div>
      </div>
      )
    }

  }

export default App;
