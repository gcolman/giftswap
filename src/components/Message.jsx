import React from "react";
import { Button } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert'
import Jumbotron from 'react-bootstrap/Jumbotron'
import Container from 'react-bootstrap/Container'



class Message extends React.Component {
  constructor(props) {
      super(props);      
  }

  render() {
    return(
      <Jumbotron>
        <Container>
        <h2>{this.props.parentState.msgHeading}</h2>
        <p>{this.props.parentState.msgText}</p>
        <p>
          <Button variant="primary" onClick={this.props.messageHideCallback}>OK</Button>
       </p>
        </Container>
      </Jumbotron>

    )
  }
}

export default Message;