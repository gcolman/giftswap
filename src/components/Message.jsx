import React from "react";
import { Button } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert'

class Message extends React.Component {
  constructor(props) {
      super(props);

  }



  render() {
    return(
      <div>
      <Alert show={this.props.gamestate === "paused" } variant="primary"  disissible>
      <Alert.Heading>The Game Has Been Paused</Alert.Heading>
          <p>
          be patient, be kind, be happy
          </p>
      </Alert>
    </div>
    )
  }
}

export default Message;