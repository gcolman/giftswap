import React from "react";
import { Button } from "react-bootstrap";


class Adminbar extends React.Component {
  constructor(props) {
      super(props);
  }



  render() {
    return(
      <nav className="navbar navbar-light bg-light">
        <div className="navbar-brand" >
          <Button onClick={this.props.start}>start</Button> &nbsp; 
          <Button onClick={this.props.pause}>pause</Button> &nbsp;
          <Button onClick={this.props.stop}>stop</Button> &nbsp;
          <Button onClick={this.props.respin}>respin</Button> &nbsp;
          <Button onClick={this.props.reset}>reset</Button> 
        </div>
      </nav>
    )
  }
}

export default Adminbar;