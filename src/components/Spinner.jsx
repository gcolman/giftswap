import React from "react";
import Slide from 'react-reveal/Slide';



class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ show: !this.state.show });
  }
  render() {
    return (
      <div>
        <Slide left opposite when={this.state.show}>
            <h1>Joanna Hodgson!!</h1>
        </Slide>
        <button className="btn btn-success my-5" type="button" onClick={this.handleClick} >
          { this.state.show ? 'Hide' : 'Show' } Message
        </button>
        
      </div>
    );
  }
}

export default Spinner;