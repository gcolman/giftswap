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

const delay = ms => new Promise(res => setTimeout(res, ms));

const data = [{"giver": "Graeme Colman", "email": "gcolman", "chosen":"false", "wrapped": "1.jpg","unwrapped": "u1.jpg","state": "wrapped","receiver": null,"clue": "It's Big"},{"giver": "Ben Holmes", "email": "bholmes","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "unwrapped","receiver": "Waaqas","clue": "Blue and round"},{"giver": "Anthony Kesterton", "email": "akesterton","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "It's a baby"},{"giver": "Waaqas Kauser", "email": "wkauser","chosen":"false", "wrapped": "3.jpg","unwrapped": "u3.jpg","state": "wrapped","receiver": null,"clue": "kindness is doomed"},{"giver": "Jon Walton", "email": "jwalton","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "ooo missus"},{"giver": "Simon Alcott", "email": "salcot","chosen":"false", "wrapped": "5.jpg","unwrapped": "u5.jpg","state": "wrapped","receiver": null,"clue": "monkey"},{"giver": "Jo Hodgson", "email": "jhodgson","chosen":"false", "wrapped": "1.jpg","unwrapped": "u6.jpg","state": "wrapped","receiver": null,"clue": "Err random"},{"giver": "Andy Downs", "email": "adownes","chosen":"false", "wrapped": "2.jpg","unwrapped": "u2.jpg","state": "wrapped","receiver": null,"clue": "ops a little bit"},{"giver": "Ben Holmes","chosen":"false", "wrapped": "4.jpg","unwrapped": "u4.jpg","state": "wrapped","receiver": null,"clue": "nice..."}];

const datax = [{giver: 'Graeme Colman', wrapped: "1.jpg", unwrapped: "u1.jpg", state: "wrapped",  receiver: null, clue: "It's Big",},
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
    this.state = {  
        allData:data, 
        disp:users, 
        loggedIn:"false",
        loggedInUser:"",
        realAdminUser:"",
        gamestate:"play", 
        nextUser:"",
        itsMyTurn:"false",
        activeIndex:0,
        remainingUsers:0,
        messageShow: true,
        msgHeading:"Welcome to the UKI SA Christmas Gift Game",
        msgText:"The rules: Log into the app above. When it's your turn, browse through the gifts in the carousel and you have the option of unwrapping a new present or, you can steal an already unwrapped present from one of ypur colleagues! If a gift is stolen from you then you need to unwrap a new present! Have fun and Merry Christmas!"
      };

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.pause = this.pause.bind(this);
    this.reset = this.reset.bind(this);
    this.respin = this.respin.bind(this);
    this.giftSelectCallback = this.giftSelectCallback.bind(this);

    this.login = this.login.bind(this);
    this.ws = new WebSocket('ws://localhost:8089/', 'echo-protocol');
    this.msg = "";
    this.copy = [];


    
    this.ws.onopen = (arg) => {
      // connection opened
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
      }
    };
    
    this.ws.onerror = (e) => {
        // an error occurred
    };
    this.ws.onclose = this.logout; // function implemented elsewhere
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
    this.setState(copyState);
    Cookies.set('gwuser', msg.user);
  }


  /**
   * Update things to do with next user beiing chosen.
   * @param {*} msg 
   */  
  handleUpdateNextUser = async (msg) =>{
      copyState = this.state;
      copyState.messageShow = true;
      copyState.msgHeading="Oooh, who is the next player going to be?";
      copyState.msgText="";
      this.setState(copyState);
      await delay(1000);
      var i;
      for(i=3;i>=1;i--) {
        copyState.msgHeading=i;
        this.setState(copyState);
        await delay(1000);
      }
      copyState.msgHeading= msg.email + ", come on down!";
      this.setState(copyState);

    var copyState = this.state;
    copyState.nextUser = msg.email;
    copyState.remainingUsers = msg.remainingUsers;
    
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
   *   Callback for coverflow component 
   *    When a gift is selected then set the data to show it. Check the activeindex for the gift to be updated.
   */
  giftSelectCallback = (index) => {
    //unwrap this present!
    this.unwrap(index);
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
    this.ws.send('{ "type": "data", "body":' +JSON.stringify(this.state.allData) +'}');
    this.ws.send('{ "type": "giftSteal", "user":"' +this.state.loggedInUser +'", "victim":"' +this.state.allData[index].receiver +'"}');
    this.unwrap(index);
    
  }

  /**
   * The main render component of the whole game.
   */
    render() {
      return(
        <div className="App">
          <NavBar parentState={this.state}  loginFunc={this.login} logoutFunc={this.logout} userLoggedIn={this.state.loggedIn} nextUser={this.state.nextUser} gamestate={this.state.gamestate} nextUser={this.state.nextUser} itsMyTurn={this.state.itsMyTurn}/>  
          
          {this.state.loggedInUser === "gcolman" ? (
          <Adminbar parentState={this.state} start={this.start} stop={this.stop} pause={this.pause} reset={this.reset} respin={this.respin}  />
          ) : (
            <div/>
          )} 
          {this.state.messageShow &&
            <Message parentState={this.state}/>
          }
          {this.state.gamestate === "stopped" ? 
            (<div>
                <Lobby/>
            </div> )
          :(
            <CoverFlowComponent giftData={this.state.allData} giftSelectCallback={this.giftSelectCallback} giftStealCallback={this.giftStealCallback} activeIndex={this.state.activeIndex} loggedIn={this.state.loggedIn}  gamestate={this.state.gamestate} nextUser={this.state.nextUser} itsMyTurn={this.state.itsMyTurn}/>
          )}
          <div>
            <Userlist loggedInUsers={this.state.disp}  />
          </div>
      </div>
      )
    }

  }

export default App;
