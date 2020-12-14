import React from "react";
import Coverflow from 'react-coverflow';
import Button from 'react-bootstrap/Button';


class CoverFlowComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: 0,
          };
    }
    

    render() {
        return(
        <div >   
            <div  >
                <div className="coverText" >
                    {this.props.parentState.navbarMessage}
                </div>
                {this.props.parentState.follow ? (
                    <a href="#" onClick={() => this.props.followCallback()}>Stop following {this.props.parentState.nextUser}</a>
                ) : (
                <a href="#" onClick={() => this.props.followCallback()}>Follow {this.props.parentState.nextUser}</a>
                )}
            </div>
            <div>
                <Coverflow width="960" height="800" classes={{background: 'black'}} className=''
                displayQuantityOfSide={3}
                navigation={false}
                enableScroll={false}
                infiniteScroll={true}
                clickable={true}
                active={this.props.parentState.activeIndex}
                >



                {/*  Iterate through the giftData array to create the images and buttons int he carousel */ } 
                {this.props.parentState.allData.map((pressie, i) => (   
                    <div role="menuitem" tabIndex="0">
                        
                        {/*  Using the tertiary operator to show an unwrapped div or a wrapped div */}
                        {/*  based ont he state in the giftData object. Button pressed calles function to set object to unwrapped */}
                        {this.props.parentState.allData[i].state==="wrapped" ? (
                            <span>
                                <img src={process.env.PUBLIC_URL + 'images/' +pressie.wrapped} onClick={event => this.props.moveCallback(i)} alt={pressie.giver} style={{display: 'block', width: '100%',}}/>
                                <div className="navbar-brand" >
                                    {this.props.parentState.loggedIn === "true" && this.props.parentState.gamestate === "started" && this.props.parentState.itsMyTurn === "true" ? (
                                        <Button variant="success" onClick={event => this.props.giftSelectCallback(i)}>Take me I'm yours!</Button>
                                    ):(<div/>)}
                                    <br/>
                                <span class="coverText">- Open Me! -</span>
                                </div>   
                            </span>
                            ) : (
                                <span>
                                <img src={process.env.PUBLIC_URL + 'images/' +pressie.unwrapped} alt={pressie.giver} style={{display: 'block', width: '100%',}}/>
                                <div className="navbar-brand" >
                                    {this.props.parentState.loggedIn === "true" && this.props.parentState.gamestate === "started" && this.props.parentState.itsMyTurn === "true" && this.props.parentState.stealRound === "false" ? ( // check weather to show the unwrap buttons etc.
                                        <Button variant="danger" onClick={event => this.props.giftStealCallback(i)}>Steal this from {pressie.receiver}</Button>
                                    ):(<div/>)}
                                      <br/>
                                <span class="coverText">Merry Christmas<br/>- {pressie.receiver} -</span>
                                </div>   
                            </span>
                            )}  
                    
                    </div>
                    )

                )}
                                <marquee>Especially for Erin...Merry Christmas!</marquee>

            </Coverflow>
        </div>
    </div>



        )
    }
}



export default CoverFlowComponent;

