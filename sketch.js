p5.disableFriendlyErrors = true; // disables FES

//fonts
let font_msyibaiti;
let font_OCRAEXT;

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
let backtomain_icon=[];
let backtomain_sfx;

//data (arrays) of each alertbox element
let warning_icon;
let oneway_icon;
let ok_dog_icon=[];
let not_ok_dog_icon=[];
let ok_dog_sfx=[];
let not_ok_dog_sfx=[];

//graphic to draw on
let pg;

//alert box: graphic above canvas + UI
let ag;
let alertIsActive;
//selected button function+arg while in alert box
let currFunction;

//drawing tool variables
let currBrushCol_0; //R in RGB, H in HSB etc.
let currBrushCol_1; //G in RGB, S in HSB etc.
let currBrushCol_2; //B in RGB, B in HSB etc.
let currBrushCol_alpha; // alpha value

let lastBrushDownPosX, lastBrushDownPosY;

let brushIndex = 0; //type of brush selected (default = 0)
let brushScale = 1; //size of brush shape (default = 1)

//data (arrays) of each drawing tool element
//--brush 0 RAINBOW CIRCLE BRUSH
let rainbow_sfx;
//--brush 1 RAINBOW STAR BRUSH
let aangle = 0;
let bangle = 1;
let cangle = 2;
let increment_a;
let increment_b;



//get pixelDensity
let density;

//---booleans---
let loopedOnce, //check if UI loop looped once
    okToDraw,   //check if it's ok to draw
    isDrawing,  //check if is drawing
    okToShowUI, //check if it's ok to show UI
    clickedUI;  //check if mousePressedOnUI

function preload(){

  //load font
  font_msyibaiti=loadFont('assets/fonts/msyi.ttf');
  font_ocraext = loadFont('assets/fonts/OCRAEXT.TTF');

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
  backtomain_icon[0] = loadImage('assets/images/UI/back to main idle v2.png');
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
  for (let i = 1; i<=36; i++){
    backtomain_icon[i] = loadImage('assets/images/UI/back to main v2/'+nf((2*i)-1,4)+'.png');
  }
  backtomain_sfx = loadSound('assets/audio/tv-static.mp3');

  //load alert box images + sounds
  warning_icon = loadImage('assets/images/UI/alert.png');
  oneway_icon = loadImage('assets/images/UI/oneway.png');
  ok_dog_icon[0] = loadImage('assets/images/UI/ok-dog-idle.png');
  not_ok_dog_icon[0] = loadImage('assets/images/UI/not-ok-dog-idle.png');

  for (let i=1; i<=3; i++){
    ok_dog_sfx[i-1] = loadSound('assets/audio/okdog-'+nf(i,2)+'.mp3');
    not_ok_dog_sfx[i-1] = loadSound('assets/audio/notokdog-'+nf(i,2)+'.mp3');
  }

  for (let i=1; i<=6; i++){
    ok_dog_icon[i] = loadImage('assets/images/UI/ok-dog-anim'+nf(i,4)+'.png');
    not_ok_dog_icon[i] = loadImage('assets/images/UI/not-ok-dog-anim'+nf(i,4)+'.png');
  }

  //load projection_base images
  for (let i = 1; i<=12; i++){
    his01_img[i-1] = loadImage('assets/images/projection_base/projection_base1_00'+nf(i,2)+'.jpg');
    his02_img[i-1] = loadImage('assets/images/projection_base/projection_base2_00'+nf(i,2)+'.jpg');
    ourskyy01_img[i-1] = loadImage('assets/images/projection_base/projection_base3_00'+nf(i,2)+'.jpg');
  }

  //load data (arrays) for drawing tool elements
  rainbow_sfx = loadSound('assets/audio/guitarharmonics.mp3');
}

window.onload = function() {
  this.focus();
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

  //resize alert box icons
  //oneway_icon.resize(0,height/6);
  warning_icon.resize(0,height/35);

  for (let i = 0; i <= 6; i++){
    ok_dog_icon[i].resize(125,0);
    not_ok_dog_icon[i].resize(125,0);
  }

  //UIobj constructor(x, y, img, func, arg, sound, loopSfx, jitterOnHover, timeInterval)
  ui[0]= new UIobj(width/2+80,height-80,save_icon,saveScreenshot,null,save_sfx,false,true,125);
  ui[1]= new UIobj(width/2+180,height-80,undo_icon,undoToPreviousState,null,undoredo_sfx,false,false,90);
  ui[2]= new UIobj(width/2+260,height-80,redo_icon,redoToNextState,null,undoredo_sfx,false,false,90);
  ui[3]= new UIobj(width/2+340,height-80,clear_icon,openAlert,clearCanvas,undoredo_sfx,false,false,90);
  ui[4]= new UIobj(width-80, height-80,newbase_icon,openAlert,changeBase,newbase_sfx,false,false,65);
  ui[5]= new UIobj(width/2+85,80,backtomain_icon,openAlert,backtomain,backtomain_sfx,true,false,65);
  //alertUIs - MUST ALWAYS BE THE LAST 2 OBJECTS IN THE "ui" ARRAY!!
  ui[6]=new UIobj(width/4-65,height*0.7-70,not_ok_dog_icon,closeAlert,null,not_ok_dog_sfx,false,true,83);
  ui[7]=new UIobj(width/4+65,height*0.7-70,ok_dog_icon,runButtonFunction,null,ok_dog_sfx,false,true,83);

  //setup random base template
  currBase = int(Math.random()*3);
  setupBase(currBase);

  //setup drawing graphic
  pg = createGraphics(width/2, height);

  //setup alert graphic
  alertIsActive=false;
  ag = createGraphics(width/2, height);
  ag.rectMode(CENTER);
  ag.textAlign(LEFT, TOP);
  ag.stroke(0);
  ag.strokeWeight(3);
  ag.fill(255);
  ag.drawingContext.shadowBlur=20;
  ag.drawingContext.shadowColor = 'white';
  ag.rect(ag.width/2,height/2,ag.width/2,height/3);
  ag.drawingContext.shadowBlur=0;
  ag.drawingContext.shadowColor = color(0,0);

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

  increment_a = TWO_PI /85.0;
  increment_b = TWO_PI /100.0;
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
  if (brushIndex == 1){//star brush
    aangle = aangle-increment_a;
    bangle = bangle + increment_b;
    cangle = cangle-increment_a;
  }

  if (okToShowUI){
    if (!isDrawing){
      let isHover=[];

      for (let i = 0; i < ui.length; i++){
        if (i<ui.length-2){

          isHover[i] = ui[i].checkHover(mouseX,mouseY);
        } else{

          isHover[i] = ui[i].checkHover(mouseX-width/2,mouseY);
        }
        if (i<ui.length-2&&!alertIsActive){
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
        } else if (i>=ui.length-2&&alertIsActive){
          if (isHover[i]){
            if (loopedOnce){
              loopedOnce = false;
            }
            setupAlertBox();
            imageMode(CORNER);
            image(ag,width/2,0);
            console.log('currently hovering over: '+isHover[i]);
            break;
          } else {
            if (!loopedOnce){
              setupAlertBox();
              imageMode(CORNER);
              image(ag,width/2,0);
              loopedOnce=true;
            }
          }
        }
      }
    }

    if (!alertIsActive){
      for (let i = 0; i < ui.length-2; i++){
        if (!isDrawing){
          ui[i].move(mouseX,mouseY);
        }
        ui[i].show();
      }
    }
  }

  // if (alertIsActive){
  //   imageMode(CORNER);
  //   image(ag, width/2, 0);
  // }
}

function mouseMoved(){
  //update cursor

  if (mouseX<width/2){
    noCursor();
  } else {
    if (!alertIsActive){
      cursor(CROSS);
    } else {

      cursor(ARROW);
    }
  }
}

function mouseDragged(){
  //update cursor

  if (mouseX<width/2){
      noCursor();
  } else {
    if (!alertIsActive){
      cursor(CROSS);
    } else {
    cursor(ARROW)
    }
  }
}

function mousePressed(){
  let isHover = [];
  if (!alertIsActive){

    //non alert UIs
    for (let i = 0; i < ui.length-2; i++){
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
      switch (brushIndex){
        case 0:
          break;
        case 1:
          drawStarBrush();
      }
      lastBrushDownPosX = mouseX;
      lastBrushDownPosY = mouseY;
      playBrushSfx(brushIndex);
      //remove any later save states ie. clear redo history
      saveState.splice(saveStateIndex+1,max_saveStateIndex-saveStateIndex-1);
    }
  } else {
    okToDraw = false;

    //alert UIs
    for (let i = ui.length-2; i < ui.length; i++){
      isHover[i] = ui[i].checkHover(mouseX-width/2,mouseY);
      if (isHover[i]){
        clickedUI=i;
        console.log('clickedUI true for ui['+i+']');
        return;
      } else {
        clickedUI=null;
      }
    }
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
      if (clickedUI<ui.length-2){
        ui[clickedUI].clicked(mouseX,mouseY);
        if (alertIsActive){
          rectMode(CENTER);
          fill(0,120);
          noStroke();
          rect(width/4*3, height/2,width/2,height);
        }
      } else {
        ui[clickedUI].clicked(mouseX-width/2,mouseY);
      }
      console.log('clicked func running for ui['+clickedUI+']');
    }
  }
}


function setupAlertBox(){
  ag.clear();

  //main box
  ag.rectMode(CENTER);
  ag.stroke(0);
  ag.strokeWeight(3);
  ag.fill(255);
  ag.rect(ag.width/2,height/2,ag.width/2,height/2.5);

  //title bar
  ag.stroke(0);
  ag.strokeWeight(1);
  ag.rectMode(CORNER);
  ag.rect(ag.width/4+1,height/2-height/5+1,ag.width/2-2,height/25);

  //warning icon in title bar + oneway icon in main body
  ag.imageMode(CENTER);
  ag.image(warning_icon,ag.width/2,height/2-height/5+1+height/50);
  ag.image(oneway_icon,ag.width/4+80,height/2-height/20);

  //text
  ag.rectMode(CORNER);
  // ag.noFill();
  // ag.stroke(0);
  // ag.rect(ag.width/4+70+oneway_icon.width/2+20,height/2-height/20-oneway_icon.height/2+30,ag.width/2-10-70-oneway_icon.width/2-10,oneway_icon.height/2-40);
  // ag.rect(ag.width/4+70+oneway_icon.width/2+20,height/2-height/20-10,ag.width/2-10-70-oneway_icon.width/2-10,oneway_icon.height/2-10);
  ag.fill(0);
  ag.textAlign(LEFT);
  ag.textWrap(WORD);
  ag.textFont(font_ocraext);
  ag.textSize(28);
  ag.text('WARNING!',ag.width/4+70+oneway_icon.width/2+20,height/2-height/20-oneway_icon.height/2+30,ag.width/2-10-70-oneway_icon.width/2-10,oneway_icon.height/2-40);
  ag.textFont(font_msyibaiti);
  ag.textSize(20);
  ag.text('this action cannot be undone. continue?',ag.width/4+70+oneway_icon.width/2+20,height/2-height/20-10,ag.width/2-10-70-oneway_icon.width/2-10,oneway_icon.height/2);

  //mock alertbox buttons
  ag.rectMode(CENTER);
  ui[ui.length-1].move(mouseX-width/2,mouseY);
  ui[ui.length-1].showInAlert();
  ui[ui.length-2].move(mouseX-width/2,mouseY);
  ui[ui.length-2].showInAlert();

  imageMode(CORNER);
  image(ag,width/2,0);
}

//open alert box
function openAlert(thisFunction){
  alertIsActive = true;
  imageMode(CORNER);
  image(ag, width/2, 0);
  currFunction = thisFunction;
}

//close alert box
function closeAlert(){
  alertIsActive=false;
  setupBase(currBase);
  imageMode(CORNER);
  image(pg,width/2,0);
  console.log('closeAlert(): closed alert box.');
}

//close alert box AND run selected button function
function runButtonFunction(){
  closeAlert();
  if (currFunction!=null){
    currFunction();
  }
  currFunction = null;
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
  for (let i = 0; i < ui.length-2; i++){
    ui[i].show();
  }
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

//go to index.html
function backtomain(){
  window.location.href='index.html';
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
    case 1:
      //stamp brush
      let travelDist = dist(lastBrushDownPosX, lastBrushDownPosY, mouseX, mouseY);
      if (travelDist>7*brushScale){
        drawStarBrush();
      }
      break;
  }
}

function drawStarBrush(){
  if (mouseX>width/2){
    pg.colorMode(HSB);
    if (currBrushCol_0<360){
      currBrushCol_0++;
    } else {
      currBrushCol_0=0;
    }

    if (Math.random()*2>1.5){
      pg.noStroke();
      pg.fill(currBrushCol_0, currBrushCol_1, currBrushCol_2);
    } else {
      pg.noFill();
      pg.strokeWeight(Math.random()*2);
      pg.stroke(currBrushCol_0, currBrushCol_1, currBrushCol_2);
    }

    pg.push();
      pg.translate(mouseX-width/2+sq(sin(bangle*bangle))+sin(aangle)*20*brushScale,mouseY+sq(cos(aangle*aangle))+cos(bangle)*20*brushScale);
      pg.rotate(Math.random()*TWO_PI);
      star(0,0,Math.floor(Math.random()*6)*brushScale,Math.floor(Math.random()*(10-8+1)+8)*brushScale,Math.floor(Math.random()*(6-4+1))+4);
    pg.pop();
    //circle(mouseX+sq(sin(bangle*bangle))+sin(aangle)*10,mouseY+sq(cos(aangle*aangle))+cos(bangle)*10,5);

    if (currBrushCol_0<240){
      if (Math.random()*2>1.5){
        pg.noStroke();
        pg.fill(currBrushCol_0+120, currBrushCol_1, currBrushCol_2);
      } else {
        pg.noFill();
        pg.strokeWeight(Math.random()*2);
        pg.stroke(currBrushCol_0+120, currBrushCol_1, currBrushCol_2);
      }
    } else {
      if (Math.random()*2>1.5){
        pg.noStroke();
        pg.fill(currBrushCol_0-240, currBrushCol_1, currBrushCol_2);
      } else {
        pg.noFill();
        pg.strokeWeight(Math.random()*2);
        pg.stroke(currBrushCol_0-240, currBrushCol_1, currBrushCol_2);
      }
    }
    pg.push();
      pg.translate(mouseX-width/2+sq(cos(bangle*bangle))+cos(cangle)*20*brushScale,mouseY+sq(sin(cangle*cangle))-sin(bangle)*20*brushScale);
      pg.rotate(Math.random()*TWO_PI);
      star(0,0,Math.floor(Math.random()*6)*brushScale,Math.floor(Math.random()*(10-8+1)+8)*brushScale,Math.floor(Math.random()*(6-4+1))+4);
    pg.pop();

    if (currBrushCol_0<120){
      if (Math.random()*2>1){
        pg.noStroke();
        pg.fill(currBrushCol_0+240, currBrushCol_1, currBrushCol_2);
      } else {
        pg.noFill();
        pg.strokeWeight(Math.random()*3);
        pg.stroke(currBrushCol_0+240, currBrushCol_1, currBrushCol_2);
      }
    } else {
      if (Math.random()*2>1){
        pg.noStroke();
        pg.fill(currBrushCol_0-120, currBrushCol_1, currBrushCol_2);
      } else {
        pg.noFill();
        pg.strokeWeight(Math.random()*3);
        pg.stroke(currBrushCol_0-120, currBrushCol_1, currBrushCol_2);
      }
    }

    pg.push();
      pg.translate(mouseX-width/2+sq(cos(cangle*cangle))-cos(aangle)*20*brushScale,mouseY+sq(sin(aangle*aangle))+sin(cangle)*20*brushScale);
      pg.rotate(Math.random()*TWO_PI);
      star(0,0,Math.floor(Math.random()*6)*brushScale,Math.floor(Math.random()*(10-8+1)+8)*brushScale,Math.floor(Math.random()*(6-4+1))+4);
    pg.pop();

    lastBrushDownPosX = mouseX;
    lastBrushDownPosY = mouseY;
  }
}
//center pos X, center pos Y, inner rad, outer rad, no. of points
function star(x, y, radius1, radius2, npoints) {
  let starAngle = TWO_PI / npoints;
  let halfAngle = starAngle / 2.0;
  pg.beginShape();
  for (let a = 0; a < TWO_PI; a += starAngle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    pg.vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    pg.vertex(sx, sy);
  }
  pg.endShape(CLOSE);
}

function resetBrush(thisBrush){
  switch (thisBrush){
    case 0:
      currBrushCol_0=0; //R in RGB, H in HSB etc.
      currBrushCol_1=100; //G in RGB, S in HSB etc.
      currBrushCol_2=100; //B in RGB, B in HSB etc.
      currBrushCol_alpha=1; // alpha value
      break;
    case 1:
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
    case 1:
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
    case 1:
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
  constructor(x, y, img, func, arg, sfx, loopSfx, jitterOnHover, timeInterval) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.func = func;
    this.arg = arg;
    this.sfx = sfx;
    this.loopSfx = loopSfx;
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
    if (d < ((this.img[0].height/2)-10)) {
      this.func(this.arg);
      console.log('UI clicked.');
    }
    // if (this.loopSfx){
    //   if (Array.isArray(this.sfx)){
    //     this.sfx[randomSfx].stop();
    //   } else {
    //     this.sfx.stop();
    //   }
    // }
  }

  checkHover(px, py){
    let d = dist(px, py, this.sourceX, this.sourceY);
    if (d < ((this.img[0].height/2)-10)) {
      return true;
    }
  }

  move(px,py) {
    let isHover = this.checkHover(px,py);

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
          if (this.loopSfx){
            this.sfx[randomSfx].loop();
          } else {
            this.sfx[randomSfx].stop();
            this.sfx[randomSfx].play();
          }
        } else {
          if (this.loopSfx){
            this.sfx.loop();
          } else {
            this.sfx.stop();
            this.sfx.play();
          }
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

      if (this.loopSfx){
        if (Array.isArray(this.sfx)){
          this.sfx[randomSfx].stop();
        } else {
          this.sfx.stop();
        }
      }
    }
  }

  show() {
    //display image in correct position
    imageMode(CENTER);
    image(this.img[this.currFrame],this.x,this.y);
  }

  showInAlert(){
    //display image in correct position
    ag.imageMode(CENTER);
    ag.image(this.img[this.currFrame],this.x,this.y);
  }
}
