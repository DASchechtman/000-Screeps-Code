# Screeps-Code

## About
This codebase contains my bot AI for the game screeps. Screeps is a massively multiplayer online real-time strategy game. The goal in Screeps is to build bots that gather resources. Those resources will then be used to create buildings with various effects to help you better gather more resources. Everything in screeps is done via programming. My code competes with every other player's AI to gather resources and defend my resources.

## Installation
If you want to run this code and have a Screeps account, you can download this repo and run ```npm install```.

### Notes
1. in package.json there are a scripts defining build routines that will build the code to the main server ```upload-m``` and to a private debug server on localhost ```upload-d```. You will have to look over these scripts and determine what edits need to be made to let them work (go [here](https://github.com/screepers/screeps-launcher) to learn how to set up a private server, and [here](https://docs.screeps.com/commit.html) to learn how to upload to the main server if you're new to Screeps)
1. This project uses Grunt to upload to the server, as such you will need to provide your account info to the ```Screeps-Info-Template.json``` file and then rename it to ```Screeps-Info.json```.
1. You will need to have at least python3 installed on your machine if you want to use the ```flatten.py``` file as part of the build. All it does is take all the Typescript code from the scr directory, and copies all the files into the dist directory without any subfolders. And while it is copying it readjusts all import statements to import files from within the same folder.
