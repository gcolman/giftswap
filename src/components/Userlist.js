import React from "react";
import '../App.css';

class Userlist extends React.Component {
  constructor(props) {
      super(props);
      this.state = {

        };
  }

  render() {
    return(
      <div>
        <div class="div-table smallText">
          <div class="div-table-row" >
            {this.props.wsConnectionState === 1 ?(
              <div>CONNECTED</div>
            ):(
              <div>LOST CONNECTION</div>
            ) 
            }
            
          </div>
          <div class="div-table-row" >
                {this.props.allData.map((entry, i) => (
                    <span>
                      {entry.receiver} &nbsp;
                    </span>
                ))}
          </div>
          <div class="div-table-row" >
              ALL PLAYERS
          </div>
          <div class="div-table-row" >            
                  {this.props.allData.map((entry, i) => (
                      <span>
                        {entry.giver} &nbsp;
                      </span>
                  ))}
            </div>
        </div>
      </div>
    )
  }
}

export default Userlist;