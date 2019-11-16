// fire graphic based of work by aferriss https://editor.p5js.org/aferriss/sketches/SyTRx_bof

// music by 

let mono;

// server variables
let dataServer;
let pubKey = 'pub-c-e5cadb0e-9b8f-4779-9d66-6b8b39854eb8';
let subKey = 'sub-c-c81af26e-ffee-11e9-819e-82cdbbe6698c';

//fire color
let yellowish;
let orangish;
let reddish;

let bluish;
let whiteish;
let purplish;

//name used to sort your messages. used like a radio station. can be called anything
let channelName = "memeClub";

let incomingText = ""; //variable that will hold incoming text

let lastMessageTime = 0;

//how many messages to load from history
// let historyText = "";
// let historyCount = 5;  

//how much people are on the program
let totalPopulation = 0; 
//for fire temporarily getting bigger
let inputText = 1; 


// make an empty array for fire
let bugs = [];
let numBugs = 50;
let rotation = 0;

//text fading
var fade;
var fadeAmount = 1

//question vars
let question = ["What has been bothering you?","Anything negative on your mind?", "Throw your bad thoughts here.", "Let it out.", "Tell me how you have been feeling."];
let questionRandom;

var bkimg;


////PRELOAD
function preload() {
  mono = loadFont('OCRAStd.otf');
  bkimg = loadImage('assets/firegradient_v3.jpg');
  mySound = loadSound('assets/lemon.mp3');
  crackle = loadSound('assets/crackle.mp3');
}


////SETUP
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(mono);
  //randomize question
  questionRandom = random(question);
  
  //fire color
  reddish = color(255, 80, 5, 50);
  yellowish = color(255, 200, 10, 50);
  orangish = color(255,100,20,50);

  bluish = color(255,200,255,50);
  whiteish = color(255,200,50,50);
  purplish = color(255,175,50,50);
  
  
  
  //load audio
  soundFormats('mp3', 'ogg');
  msgFire = loadSound('assets/throwlog.mp3');
  
  
  mySound.setVolume(0.3);
  mySound.play();
  mySound.loop();
  
  crackle.setVolume(0.5)
  crackle.play();
  crackle.loop();

  
  // initialize pubnub
  dataServer = new PubNub({
    publish_key   : pubKey,  //get these from the pubnub account online
    subscribe_key : subKey,  
    ssl: true  //enables a secure connection. This option has to be used if using the OCAD webspace
  });

//attach callbacks to the pubnub object to handle messages and connections
  dataServer.addListener({ message: readIncoming, presence: presenceChange});
  dataServer.subscribe({channels: [channelName], withPresence : true});

  
 dataServer.hereNow({
    channels: [channelName],
    includeUUIDs: true
},
function (status, response)
{
  console.log(response);
  totalPopulation=response.totalOccupancy;
}); 
  
/*  
 dataServer.history(
    {
        channel: channelName,
        count: historyCount,
        reverse: false
    },
    function (status, response){
        console.log(response.messages);
        for(let i =0; i<response.messages.length;i++){
          console.log(response.messages[i].entry);
          text(response.messages[i], 5, 100);
        }
      }
   
   );
*/
  
  //create the text fields for the message to be sent
  sendText = createInput();
  sendText.position(width/2-sendText.width/2,height-150);
  
  fade = 0
  
  
// set options to prevent default behaviors for swipe, pinch, etc
  var options = {
    preventDefault: true
  };

  // document.body registers gestures anywhere on the page
  var hammer = new Hammer(document.body, options);
  hammer.get('swipe').set({
    direction: Hammer.DIRECTION_ALL
  });

  hammer.on("swipe", swiped);

  }
 

////DRAW

function draw() {
  background(0);
  imageMode (CENTER);
  image(bkimg, width/2, height/2, width, height);
  
  
  if(lastMessageTime!=0)
  {
   console.log("last message: "+(millis()-lastMessageTime)); 
  }
  
 //questions
  fill(130);
  textSize(12);
  textAlign(CENTER);
  text("Swipe up to throw your thoughts", width/2, height - 80);
  
  //instruction
  fill(180);
  textSize(18);
  textAlign(CENTER);
  text(questionRandom, width/2, height - 170);
  
  
  
  // loop through all the bugs backwards
  // looping backwards lets us see older particles on top
  for(let i = bugs.length -1; i>= 0; i--){
   	bugs[i].move();

    
    if (millis()-lastMessageTime > 250){
      bugs[i].show(1);
    } else {
      bugs[i].show(2);
    }
   
    
    bugs[i].shrink();
    
    if(bugs[i].radius <= 0 ){
      //remove the dead ones
      bugs.splice(i, 1);
    }
    
  }

  
  //make more fire!!!
    let x = width/2;
    let y = height/2;
    let radius = random((15+totalPopulation*3)*inputText,(30+totalPopulation*3)*inputText);
    let b = new Bug(x, y, radius);
    bugs.push(b);
  
  if (inputText > 1){
    inputText -= 0.05;
  }
  
  
  noStroke();
    // let textOp = 255;
    fill(255, fade);  //read the color values from the message
    textSize(24);
    textAlign(CENTER);
    text(incomingText, width/2, height/2, width * 0.6, height/2);
    if (fade>255) fadeAmount=-1; 
    fade += fadeAmount; 
  
  //text(response.messages[i], 5, 200);
}

class Bug{
  constructor(tempX, tempY, tempR) {
    this.x = tempX;
    this.y = tempY;
    this.radius = tempR;
    
    // pick a random color
    this.color1 = color(255);
    this.color2 = color(255);
    let r = random(3);
    if(r < 1){
      this.color1 = orangish;
    } else if(r >= 1 && r < 2 ){
      this.color1 = yellowish;
    } else if(r >= 2 ){
      this.color1 = reddish;
    }
    
    
    if(r < 1){
      this.color2 = bluish;
    } else if(r >= 1 && r < 2 ){
      this.color2 = whiteish;
    } else if(r >= 2 ){
      this.color2 = purplish;
    }
}

  show(pick) {
    noStroke();
    if(pick==1){
      fill(this.color1);
    }
    if(pick==2){
      fill(this.color2);
    }
    rectMode(CENTER);
    rect(this.x, this.y, this.radius, this.radius);
    angleMode(DEGREES);
    rotate(rotation);
    rotation += 0;

  }

  move() {
    this.x += random(-5, 5);
    this.y -= random(1, 3);
  }
  
  shrink(){    
   // shrink size over time
   this.radius-=0.4;
  }
   
}



///uses built in mouseClicked function to send the data to the pubnub server
function sendTheMessage() {
 
  // Send Data to the server to draw it in all other canvases
  dataServer.publish({
      channel: channelName,
      message:  {
        messageText: sendText.value() //get the value from the text box and send it as part of the message   
      }
    });

}

function swiped(event) {
  console.log(event);
  if (event.direction == 8){   
    //send the message
    sendTheMessage();
    //make the fire bigger temporarily
    inputText = 2;
    sendText.value('');
    //randomize question
    questionRandom = random(question);
    //play sound
    msgFire.play ();
    msgFire.amp (0.5);
    
  }
}

function readIncoming(inMessage){ //when new data comes in it triggers this function
// this works becsuse we subscribed to the channel in setup()
  
  // simple error check to match the incoming to the channelName
  if(inMessage.channel == channelName)
  {
  incomingText = inMessage.message.messageText;
  lastMessageTime = millis();
  fade = 255;
  }
}

function presenceChange(pInfo)

{
console.log(pInfo.occupancy);
totalPopulation = pInfo.occupancy;

}

function openQuestion () {




}

