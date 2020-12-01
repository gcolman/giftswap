import React from 'react';
import NavBar from "./components/navbar";
import Adminbar from "./components/Adminbar";
import Message from "./components/Message";
import Spinner from "./components/Spinner";
import CoverFlowComponent from "./components/coverflow";
import Cookies from 'js-cookie'



import './App.css';
import Lobby from './components/Lobby';
import Userlist from './components/Userlist';

const data = [{giver: 'Graeme Colman', wrapped: "1.jpg", unwrapped: "u1.jpg", state: "wrapped",  receiver: null, clue: "It's Big",},
{giver: 'Graeme Colman', wrapped: "5.jpg", unwrapped: "u5.jpg", state: "unwrapped", receiver: "Waaqas", clue: "Blue and round",},
{giver: 'Anthony Kesterton', wrapped: "2.jpg", unwrapped: "u2.jpg", state: "wrapped", receiver: null, clue: "It's a baby",},
{giver: 'Waaqas Kauser', wrapped: "3.jpg", unwrapped: "u3.jpg", state: "wrapped", receiver: null, clue: "kindness is doomed",},
{giver: 'Jon Walton', wrapped: "4.jpg", unwrapped: "u4.jpg", state: "wrapped", receiver: null, clue: "ooo missus",},
{giver: 'Simon Alcott', wrapped: "5.jpg", unwrapped: "u5.jpg", state: "wrapped", receiver: null, clue: "monkey",},
{giver: 'Jo Hodgson', wrapped: "1.jpg", unwrapped: "u6.jpg", state: "wrapped", receiver: null, clue: "Err random",},
{giver: 'Andy Downs', wrapped: "2.jpg", unwrapped: "u2.jpg", state: "wrapped", receiver: null, clue: "ops a little bit",},
{giver: 'Ben Holmes', wrapped: "4.jpg", unwrapped: "u4.jpg", state: "wrapped", receiver: null, clue: "nice...",},
];
const users = [ ];

class App extends React.Component {


  constructor(props) {
    super(props);
    this.state = {list:data, disp:users, loggedIn:"false", loggedInUser:"", gamestate:"play", nextUser:"", itsMyTurn:"false"};
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.pause = this.pause.bind(this);
    this.reset = this.reset.bind(this);
    this.respin = this.respin.bind(this);

    this.login = this.login.bind(this);
    this.ws = new WebSocket('ws://localhost:8089/', 'echo-protocol');
    this.msg = "";
    this.copy = [];

    
    
    this.ws.onopen = (arg) => {
      // connection opened
    };
    
    this.ws.onmessage = (e) => {
      var copyState = this.state;
      console.log(e.data);
      this.msg = JSON.parse(e.data);

      if(this.msg.type === "data"){
         //game data  
      } else if(this.msg.type === "state") {
         //State data change
         if(this.msg.body === "started") {
            this.start("fromWS");
         } else if (this.msg.body === "stopped") {
            this.stop("fromWS");
         } else if (this.msg.body === "paused") {
            this.pause("fromWS");
        } 
      } else if(this.msg.type === "users") {
        copyState.disp = this.msg.body;
        this.setState(copyState);
      }else if(this.msg.type === "loginSuccess") {
        //changed to loggedIn = true
        copyState.loggedIn = "true";
        copyState.loggedInUser = this.msg.user;
        this.setState(copyState);
        Cookies.set('gwuser', this.msg.user);
      }else if(this.msg.type === "loginError") {
        //
      } else if(this.msg.type === "nextUser") {
        copyState.nextUser = this.msg;
        if(this.msg.email === this.state.loggedInUser) {
          copyState.itsMyTurn = "true";
        } else {
          copyState.itsMyTurn = "false";
        }
        this.setState(copyState);
      }
    };
    
    this.ws.onerror = (e) => {
        // an error occurred
    };
    this.ws.onclose = this.logout; // function implemented elsewhere
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
    this.ws.send('{ "type": "logout", "body": "' +this.state.loggedInUser +'"}');
    Cookies.set('gwuser', '');
    var copyState = this.state;
    copyState.loggedIn = "false";
    copyState.loggedInUser = "";
    this.setState(copyState);
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
    if(fromEvent != "fromWS") { //if this event was generated here, then we want send the event to the server. otherwise we are reacting to anothers event 
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
    if(fromEvent != "fromWS") { //if this event was generated here, then we want send the event to the server. otherwise we are reacting to anothers event 
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
    if(fromEvent != "fromWS") { //if this event was generated here, then we want send the event to the server. otherwise we are reacting to anothers event 
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
  }

  /**
   * The main render component of the whole game.
   */
    render() {
      return(
        <div className="App">
          <NavBar loginFunc={this.login} logoutFunc={this.logout} userLoggedIn={this.state.loggedIn} nextUser={this.state.nextUser} gamestate={this.state.gamestate} nextUser={this.state.nextUser} itsMyTurn={this.state.itsMyTurn}/>  
          <Adminbar start={this.start} stop={this.stop} pause={this.pause} reset={this.reset} respin={this.respin}  />
          
          <Message gamestate={this.state.gamestate}/>
          {this.state.gamestate === "stopped" ? 
            (<div>
                <Lobby/>
            </div> )
          :(
            <CoverFlowComponent present={this.state.list} loggedIn={this.state.loggedIn}  gamestate={this.state.gamestate} nextUser={this.state.nextUser} itsMyTurn={this.state.itsMyTurn}/>
          )}
          <div>
            <Userlist loggedInUsers={this.state.disp}  />
          </div>
          <Spinner/>
      </div>
      )
    }

  }

export default App;
