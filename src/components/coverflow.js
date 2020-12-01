import React from "react";
import Coverflow from 'react-coverflow';
import Button from 'react-bootstrap/Button';
import Websocket from 'react-websocket';


class CoverFlowComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: 0,
          };
    }
    
    handleData = (data) => {
        console.log(data);
        this.state.x=JSON.parse(data);
        this.setState({
          active: this.state.x,
        });
      }

    render() {
        return(
        <div>   
            <div>
                <Websocket url='ws://localhost:8089' onMessage={this.handleData.bind(this)} />
            </div>

            <div>
                <Coverflow width="960" height="800" classes={{background: 'rgb(233, 23, 23)'}} className=''
                displayQuantityOfSide={2}
                navigation={false}
                enableScroll={false}
                infiniteScroll={true}
                clickable={true}
                active={this.props.activeIndex}
                >

                {/*  Iterate through the giftData array to create the images and buttons int he carousel */ } 
                {this.props.giftData.map((pressie, i) => (   
                    <div role="menuitem" tabIndex="0">

                        {/*  Using the tertiary operator to show an unwrapped div or a wrapped div */}
                        {/*  based ont he state in the giftData object. Button pressed calles function to set object to unwrapped */}
                        {this.props.giftData[i].state==="wrapped" ? (
                            <span>
                                <img src={process.env.PUBLIC_URL + 'images/' +pressie.wrapped} alt={pressie.giver} style={{display: 'block', width: '100%',}}/>
                                <div className="navbar-brand" >
                                    {this.props.loggedIn === "true" && this.props.gamestate === "started" && this.props.itsMyTurn === "true" ? (
                                        <Button variant="success" onClick={event => this.props.giftSelectCallback(i)}>Take me I'm yours!</Button>
                                    ):(<div/>)}
                                    <br/>
                                <span> Merry Xmas <br/>from {pressie.giver}</span>
                                </div>   
                            </span>
                            ) : (
                                <span>
                                <img src={process.env.PUBLIC_URL + 'images/' +pressie.unwrapped} alt={pressie.giver} style={{display: 'block', width: '100%',}}/>
                                <div className="navbar-brand" >
                                    {this.props.loggedIn === "true" && this.props.gamestate === "started" && this.props.itsMyTurn === "true" ? ( // check weather to show the unwrap buttons etc.
                                        <Button variant="danger" onClick={event => this.props.giftStealCallback(i)}>Steal this from {pressie.receiver}</Button>
                                    ):(<div/>)}
                                      <br/>
                                <span> Ho Ho Ho...<br/>it's yours! {pressie.receiver}</span>
                                </div>   
                            </span>
                            )}  
                    
                    </div>
                    )

                )}
            </Coverflow>
        </div>
    </div>
        )
    }
}



export default CoverFlowComponent;

