import React from "react";
import { Button } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert'
import Jumbotron from 'react-bootstrap/Jumbotron'

class Message extends React.Component {
  constructor(props) {
      super(props);

  }



  render() {
    return(
      <Jumbotron>
          <h1>{this.props.parentState.msgHeading}</h1>
        <p>{this.props.parentState.msgText}</p>
      </Jumbotron>
    )
  }
}

export default Message;