# GiftSwap App

This is the giftswap react.js app. It's a work in progress! 

To run, you will need the gameserver app running on a serverr somewhere. (https://github.com/gcolman/giftswap-gameserver) That server exposes a websocket to the 
game front end on port 8080. The game serber imports a config file (TODO it's hard coded at the moment) containing all of the uplopaded gift information and image locations. 

The front end allows users to log in (god no there's no real security in there!) with a username that must correspond to a user in the config. and then play the game. An admin function to start the game sto, pause, chose next user etc is in there too. 

The game will run on Red Hat OPenshift, just use a Node.js S2I image builder and point to this repo.

TODO
- Externalise things into properties (ws address)
- All images are in this repo, needs to be config. 

