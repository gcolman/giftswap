import React from "react";
import { Button } from "react-bootstrap";
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

class Adminbar extends React.Component {
  constructor(props) {
      super(props);
  }



  render() {
    return(
      <nav className="xmasBackground navbar navbar-light bg-light">
        <div className="navbar-brand" >
          
          { this.props.parentState.gamestate === "started" ? (
            <div>
            <Button onClick={this.props.pause}>pause</Button> &nbsp;
            <Button onClick={this.props.respin}>Next Player</Button> &nbsp;
            <Button onClick={this.props.stop}>stop</Button>&nbsp;
            <Button onClick={this.props.reset}>reset</Button> &nbsp;
            <Button onClick={this.props.reload}>reload</Button> &nbsp;
           </div> 
          ):(<Button onClick={this.props.start}>start</Button>)}
          
        </div>
        <div>
          <DropdownButton id="dropdown-basic-button" title={this.props.parentState.loggedInUser}>
          { this.props.parentState.allData.map((item, i) => (
            <Dropdown.Item onClick={() => this.props.become(item.email)}>{item.email}</Dropdown.Item>
          ))}
          </DropdownButton>  
        </div>
      </nav>
    )
  }
}

export default Adminbar;