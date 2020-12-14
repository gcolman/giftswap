import React from "react";
import { Button } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert'
import Jumbotron from 'react-bootstrap/Jumbotron'
import Modal from 'react-bootstrap/Modal'



class ModalMessage extends React.Component {
  constructor(props) {
      super(props);      
  }

  render() {
    return(
      <>
      <Modal className="mainmodal" size="lg" show="true" onHide={this.props.messageHideCallback} >
        <Modal.Header >
          <Modal.Title>
            <p class="modalText">
              {this.props.parentState.msgHeading}
            </p>
            </Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <p class="modalText">
              {this.props.parentState.msgText}
            </p>
            <Button variant="success" onClick={this.props.messageHideCallback}>OK</Button>
          </Modal.Body>

      </Modal>
    </>
    )
  }
}

export default ModalMessage;