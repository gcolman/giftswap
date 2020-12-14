import React from "react";
import { Button } from "react-bootstrap";
import '../App.css';

class NavBar extends React.Component {
  constructor(props) {
      super(props);
      this.state = {user:""};
  }

  handleChange = (e) =>{ 
    this.setState({user: e.target.value});
  }

  render() {
    return(
      <nav className="App-header">
      <div className="navbar-brand">
        
        <span className="badge badge-pill badge-info m-2" style={{ width: 50 }}>
          {this.props.parentState.remainingUsers}
          
        </span>
        Players Remaining
      </div>
      <img src={process.env.PUBLIC_URL + 'images/RHTrans.png'} />


      {this.props.userLoggedIn === "false" ? (
          <div className="navbar-brand" >
              <input type="text" name="myUser" value={this.state.user} onChange={this.handleChange} ></input>&nbsp; &nbsp;
              <Button onClick={() => this.props.loginFunc(this.state.user)}>login</Button>  
          </div>
        ) : (
          <div className="navbar-brand" >
            {this.props.parentState.loggedInUser} &nbsp;
            <a href="#" onClick={() => this.props.logoutFunc()}>logout</a>
              
          </div>        
        )}
    </nav>
    )
  }
}

export default NavBar;