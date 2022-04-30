p5.disableFriendlyErrors = true; // disables FES

//save state variables
let saveStateIndex = 0;
let max_saveStateIndex = 10;
let saveState = [];
let newpg = [];

//base template image array + status
let base_template = [];
let currBase;

//projection base array
let projection_base = [];

//data (arrays) of each projection base
let currPBaseFrame=0;
let lastPBaseTime=0;
let his01_img=[];
let his02_img=[];
let ourskyy01_img=[];

//array of UI elements
let ui=[];

//data (arrays) of each UI element
let save_icon=[];
let save_sfx=[];
let undo_icon=[];
let redo_icon=[];
let undoredo_sfx=[];
let clear_icon=[];
let newbase_icon=[];
let newbase_sfx;

//graphic to draw on
let pg;

//drawing tool variables
let currBrushCol_0; //R in RGB, H in HSB etc.
let currBrushCol_1; //G in RGB, S in HSB etc.
let currBrushCol_2; //B in RGB, B in HSB etc.
let currBrushCol_alpha; // alpha value

let brushIndex = 0; //type of brush selected (default = 0)

//data (arrays) of each drawing tool element
let rainbow_sfx;

//get pixelDensity
let density;

//---booleans---
let loopedOnce, //check if UI loop looped once
    okToDraw,   //check if it's ok to draw
    isDrawing,  //check if is drawing
    okToShowUI, //check if it's ok to show UI
    clickedUI;  //check if mousePressedOnUI

function preload(){
  
  //load base template
  for (let i = 1; i <= 3; i++){
    base_template[i-1] = loadImage('assets/images/base_templates/base_'+i+'.png');
  }
  
  //load data (arrays) for UI elements
  for (let i = 0; i <= 3; i++){
    save_icon[i] = loadImage('assets/images/UI/save_'+i+'.png');
  }
  for (let i = 0; i<=3; i++){
    save_sfx[i] = loadSound('assets/audio/catpurrchirp-'+i+'.mp3');
  }
  undo_icon[0] = loadImage('assets/images/UI/egg.png');
  redo_icon[0] = loadImage('assets/images/UI/egg.png');
  newbase_icon[0] = loadImage('assets/images/UI/new_base0000.png');
  for (let i = 0; i<=2; i++){
    undoredo_sfx[i] = loadSound('assets/audio/tinybell-'+i+'.mp3');
  }
  clear_icon[0] = loadImage('assets/images/UI/egg.png');
  for (let i = 1; i<=6; i++){
    undo_icon[i] = loadImage('assets/images/UI/undo_anim000'+i+'.png');
  }
  for (let i = 1; i<=6; i++){
    redo_icon[i] = loadImage('assets/images/UI/redo_anim000'+i+'.png');
  }
  for (let i = 1; i<=6; i++){
    clear_icon[i] = loadImage('assets/images/UI/clear_anim000'+i+'.png');
  }
  for (let i = 1; i<=12; i++){
    newbase_icon[i] = loadImage('assets/images/UI/new_base00'+nf(i,2)+'.png');
  }
  newbase_sfx = loadSound('assets/audio/sparkle_snap.mp3');
  
  //load projection_base images
  for (let i = 1; i<=12; i++){
    his01_img[i-1] = loadImage('assets/images/projection_base/projection_base1_00'+nf(i,2)+'.jpg');
    his02_img[i-1] = loadImage('assets/images/projection_base/projection_base2_00'+nf(i,2)+'.jpg');
    ourskyy01_img[i-1] = loadImage('assets/images/projection_base/projection_base3_00'+nf(i,2)+'.jpg');
  }
  
  //load data (arrays) for drawing tool elements
  rainbow_sfx = loadSound('assets/audio/guitarharmonics.mp3');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  density = pixelDensity();
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  background(0);
  noStroke();
  fill(255);
  rectMode(CENTER);
  rect(width/4,height/2,width/2,height);
  frameRate(60);
  
  //resize all base templates
  for (let i = 1; i <= 3; i++){
    base_template[i-1].resize(width/2,0);
  }
  
  for (let i = 1; i <= 12; i++){
    his01_img[i-1].resize(width/2,0);
    his02_img[i-1].resize(width/2,0);
    ourskyy01_img[i-1].resize(width/2,0);
  }
  
  //setup random base template
  currBase = int(Math.random()*3);
  setupBase(currBase);
  
  //setup drawing graphic
  pg = createGraphics(width/2, height);
  
  //default drawing tool settings
  currBrushCol_0=0; //R in RGB, H in HSB etc.
  currBrushCol_1=0; //G in RGB, S in HSB etc.
  currBrushCol_2=0; //B in RGB, B in HSB etc.
  currBrushCol_alpha=1; // alpha value
  
  // save saveState at beginning for blank canvas
  newpg[saveStateIndex] = createImage(width*density, height*density);
  newpg[saveStateIndex].copy(pg,0,0,width/2,height,0,0,width*density,height*density);
  saveState.push(newpg[saveStateIndex]);
  
  console.log(saveStateIndex);
  
  //UIobj constructor(x, y, img, func, arg, sound, jitterOnHover, timeInterval)
  ui[0]= new UIobj(width/2+60,height-60,save_icon,saveScreenshot,null,save_sfx,true,125);
  ui[1]= new UIobj(width/2+160,height-60,undo_icon,undoToPreviousState,null,undoredo_sfx,false,90);
  ui[2]= new UIobj(width/2+240,height-60,redo_icon,redoToNextState,null,undoredo_sfx,false,90);
  ui[3]= new UIobj(width/2+320,height-60,clear_icon,clearCanvas,null,undoredo_sfx,false,90);
  ui[4]= new UIobj(width-60, height-60,newbase_icon,changeBase,null,newbase_sfx,false,65);
  

  
  resetBrush(brushIndex);
  
  okToShowUI=true;
  isDrawing = false;
}

function draw() {
  
  //frame animation for projection base
  if (currPBaseFrame < 11){
    if ((millis()-lastPBaseTime)>166){
      currPBaseFrame ++;
      lastPBaseTime=millis();
      noStroke();
      fill(0,10);
      rectMode(CENTER);
      rect(width/4,height/2,width/2,height);
      imageMode(CENTER);
      blendMode(LIGHTEST);
      
      switch (currBase){
        case 0:
          image(his01_img[currPBaseFrame],width/4,height/2);
          break;
        case 1:
          image(his02_img[currPBaseFrame],width/4,height/2);
          break;
        case 2:
          image(ourskyy01_img[currPBaseFrame],width/4,height/2);
          break;
      }

      
      blendMode(BLEND);
    }
  } else {
    if ((millis()-lastPBaseTime)>166){
      currPBaseFrame =0;
      lastPBaseTime=millis();
    }
  }
  
  if (mouseIsPressed) {
    if (okToDraw){
      useBrush(brushIndex);
      //render drawing layer
      imageMode(CORNER);
      image(pg,width/2,0);
      if (!isDrawing){
        isDrawing = true;
      }
      
      //render projection 
      blendMode(DIFFERENCE);
      image(pg,0,0);
      blendMode(BLEND);
    } 
  }
  
  if (okToShowUI){
    if (!isDrawing){
      let isHover=[];
    
      for (let i = 0; i < ui.length; i++){
        isHover[i] = ui[i].checkHover(mouseX,mouseY);
        if (isHover[i]){
          if (loopedOnce){
            loopedOnce = false;
          }
          setupBase(currBase);
          imageMode(CORNER);
          image(pg,width/2,0);
          break;
        } else {
          if (!loopedOnce){
            setupBase(currBase);
            imageMode(CORNER);
            image(pg,width/2,0);
            loopedOnce=true;
          }
        }
      }
    }
    
    for (let i = 0; i < ui.length; i++){
      if (!isDrawing){
        ui[i].move();
      }
      ui[i].show();
    }
  }
}

function mouseMoved(){
  //update cursor
  if (mouseX<width/2){
    noCursor();
  } else {
    cursor(CROSS);
  }
}

function mouseDragged(){
  //update cursor
  if (mouseX<width/2){
    noCursor();
  } else {
    cursor(CROSS);
  }

}

function mousePressed(){
  let isHover = [];
  for (let i = 0; i < ui.length; i++){
    isHover[i] = ui[i].checkHover(mouseX,mouseY);
    if (isHover[i]){
      
      okToDraw = false;
      clickedUI=i;
      console.log('clickedUI true for ui['+i+']');
      return;
    } else {
      clickedUI=null;
      okToDraw = true;
    }
  }
  
  if (okToDraw){
    playBrushSfx(brushIndex);
    //remove any later save states ie. clear redo history
    saveState.splice(saveStateIndex+1,max_saveStateIndex-saveStateIndex-1);
  }
}

function mouseReleased() {
  if (okToDraw){
    //save state
    saveNewState();
    
    pauseBrushSfx(brushIndex);
    if (isDrawing){
      pg.blendMode(BLEND);
      isDrawing = false;
    }
  } else {
      if (clickedUI!=null){
        ui[clickedUI].clicked(mouseX,mouseY);
        console.log('clicked func running for ui['+clickedUI+']');
    }
  }
}
  

//undo
function undoToPreviousState() {
  if (!saveState || !saveState.length || saveStateIndex === 0) {
    return;
  }
  saveStateIndex--;
  pg.clear();
  setupBase(currBase);
  pg.imageMode(CORNER);
  pg.image(saveState[saveStateIndex], 0, 0, width/2, height);
  console.log('saveStateIndex: '+saveStateIndex+'; saveState.length: '+saveState.length);
  //render drawing layer
  imageMode(CORNER);
  image(pg,width/2,0);
}

//redo
function redoToNextState() {
  if (saveStateIndex === saveState.length-1) {
    return;
  }
  saveStateIndex++;
  pg.clear();
  setupBase(currBase);
  pg.imageMode(CORNER);
  pg.image(saveState[saveStateIndex], 0, 0, width/2, height);
  console.log(saveStateIndex);
  //render drawing layer
  imageMode(CORNER);
  image(pg,width/2,0);
}

//save state
function saveNewState() {
  if (saveState.length===max_saveStateIndex){
    saveState.splice(0,1);
  } else {
    saveStateIndex++;
  }
  newpg[saveStateIndex] = createImage(width*density, height*density);
  newpg[saveStateIndex].copy(pg,0,0,width/2,height,0,0,width*density,height*density);
  saveState.push(newpg[saveStateIndex]);
  console.log(saveStateIndex);
}

//setup base template
function setupBase(baseIndex){
  noStroke();
  fill(255);
  rectMode(CENTER);
  rect(3*width/4,height/2,width/2,height);
  imageMode(CENTER);
  image(base_template[baseIndex],3*width/4, height/2);
}

//change base template (ie. next)
function changeBase(){
  
  //trigger warning that it will clear canvas
  pg.clear();
  saveStateIndex=0;
  saveState.splice(saveStateIndex,max_saveStateIndex-saveStateIndex-1);
  newpg[saveStateIndex] = createImage(width*density, height*density);
  newpg[saveStateIndex].copy(pg,0,0,width/2,height,0,0,width*density,height*density);
  saveState.push(newpg[saveStateIndex]);
  
  if (currBase<base_template.length-1){
    currBase++;
  } else {
    currBase = 0;
  }
  setupBase(currBase);
  imageMode(CORNER);
  image(pg,width/2,0);
}

function clearCanvas(){
  pg.clear();
  saveStateIndex=0;
  saveState.splice(saveStateIndex,max_saveStateIndex-saveStateIndex-1);
  console.log("length of savestate array: "+saveState.length);
  newpg[saveStateIndex] = createImage(width*density, height*density);
  newpg[saveStateIndex].copy(pg,0,0,width/2,height,0,0,width*density,height*density);
  saveState.push(newpg[saveStateIndex]);
  setupBase(currBase);
  imageMode(CORNER);
  image(pg,width/2,0);
}

//save image
function saveScreenshot(){
  okToShowUI=false;
  pg.clear();
  pg.background(255);
  pg.imageMode(CENTER);
  pg.image(base_template[currBase],width/4, height/2);
  pg.imageMode(CORNER);
  pg.image(saveState[saveStateIndex], 0, 0,width/2,height);
  save(pg,"SFWONDERLAND_"+year()+nf(month(),2)+nf(day(),2)+nf(hour(),2)+nf(minute(),2)+nf(second(),2)+".jpg");
  okToShowUI=true;
  pg.clear();
  setupBase(currBase);
  pg.imageMode(CORNER);
  pg.image(saveState[saveStateIndex], 0, 0,width/2,height);
}

//brush tool
function useBrush(thisBrush){
  
  switch (thisBrush){
    case 0:
      //rainbow brush
      pg.colorMode(HSB);
      
      
      if (currBrushCol_0<360){
        currBrushCol_0++;
      } else {
        currBrushCol_0=0;
      }
      pg.stroke(currBrushCol_0, currBrushCol_1, currBrushCol_2,currBrushCol_alpha);
      pg.strokeWeight(20);
      if (mouseX>width/2){
        pg.line(pmouseX-width/2, pmouseY, mouseX-width/2, mouseY);
      } else {
        pg.line(1, pmouseY,1, mouseY);
      }
      break;
  }
}

function resetBrush(thisBrush){
  switch (thisBrush){
    case 0:
      currBrushCol_0=0; //R in RGB, H in HSB etc.
      currBrushCol_1=100; //G in RGB, S in HSB etc.
      currBrushCol_2=100; //B in RGB, B in HSB etc.
      currBrushCol_alpha=1; // alpha value
      break;
  }
}

function playBrushSfx(thisBrush){
  let thisSfx;
  switch (thisBrush){
    case 0: 
      thisSfx = rainbow_sfx;
      break;
  }
  
  if (Array.isArray(thisSfx)){
    
  }else {
    if (thisSfx.isPlaying()==false){
      thisSfx.setVolume(1,0.5);
      thisSfx.loop();
    }
  }
}

function pauseBrushSfx(thisBrush){
  let thisSfx;
  switch (thisBrush){
    case 0: 
      thisSfx = rainbow_sfx;
      break;
  }
  
  if (Array.isArray(thisSfx)){
    
  }else {
    if (thisSfx.isPlaying()){
      thisSfx.setVolume(0,0.2);
      thisSfx.pause(0.2);
    }
  }
}

class UIobj {
  constructor(x, y, img, func, arg, sfx, jitterOnHover, timeInterval) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.func = func;
    this.arg = arg;
    this.sfx = sfx;
    this.jitterOnHover = jitterOnHover;
    this.playedOnce = false;
    this.sourceX = x;
    this.sourceY = y;
    this.currFrame = 0;
    this.lastTime =0;
    this.timeInterval = timeInterval; 
  }

  clicked(px, py) {
    let d = dist(px, py, this.sourceX, this.sourceY);
    if (d < 50) {
      this.func(this.arg);
      console.log('UI clicked.');
    }
  }
  
  checkHover(px, py){
    let d = dist(px, py, this.sourceX, this.sourceY);
    if (d < 40) {
      return true;
    } 
  }
  
  move() {
    let isHover = this.checkHover(mouseX,mouseY);

    if (isHover){
      
      //jitter animation
      if (this.jitterOnHover == true){
        this.x = this.sourceX+Math.random()*2;
        this.y = this.sourceY+Math.random()*2;
      }
      
      //frame animation
      if (this.currFrame < this.img.length-1){
        if ((millis()-this.lastTime)>this.timeInterval){
          this.currFrame ++;
          this.lastTime=millis();
        }
      } else {
        if ((millis()-this.lastTime)>this.timeInterval){
          this.currFrame =1;
          this.lastTime=millis();
        }
      }
     
      
      //trigger sfx
      if (!this.playedOnce){
        if (Array.isArray(this.sfx)){
          let randomSfx = Math.floor(Math.random(0)*this.sfx.length);
          this.sfx[randomSfx].stop();
          this.sfx[randomSfx].play();
        } else {
          this.sfx.play();
        }
        this.playedOnce = true;
      }
    } else {
      this.x = this.sourceX;
      this.y = this.sourceY;
      this.currFrame = 0;
      
      if (this.playedOnce){
        this.playedOnce = false;
      }
    }
  }

  show() {
    //display image in correct possition
    imageMode(CENTER);
    image(this.img[this.currFrame],this.x,this.y);
  }
}