import React from "react";
import { Button } from "react-bootstrap";


class Userlist extends React.Component {
  constructor(props) {
      super(props);
      this.state = {

        };
  }

  render() {
    return(
      <div>
        {this.props.loggedInUsers}
      </div>
    )
  }
}

export default Userlist;