import React from "react";
import { Button } from "react-bootstrap";


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
      <nav className="navbar navbar-light bg-light">
      <div className="navbar-brand">
        <span className="badge badge-pill badge-info m-2" style={{ width: 50 }}>
          3
        </span>
        Players Remaining
      </div>
      {this.props.nextUser  ? ( //display different text depending on whether the game is running onr not.
        <div className="navbar-brand" >
          It's {this.props.nextUser.email}'s turn!
        </div>
      ) :(
        <div className="navbar-brand" >
          The game is paused... wait for the excitement to begin!
        </div>
      )}
      {this.props.userLoggedIn === "false" ? (
          <div className="navbar-brand" >
              <input type="text" name="myUser" value={this.state.user} onChange={this.handleChange} ></input>&nbsp; &nbsp;
              <Button onClick={event => this.props.loginFunc(this.state.user)}>login</Button>  
          </div>
        ) : (
          <div className="navbar-brand" >
            {this.state.user} &nbsp;
            <a href="#" onClick={event => this.props.logoutFunc()}>logout</a>
              
          </div>        
        )}
    </nav>
    )
  }
}

export default NavBar;