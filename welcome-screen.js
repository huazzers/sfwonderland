p5.disableFriendlyErrors = true; // disables FES

//logo image array(s) + status
let logo_bg = [];
let logo_text = [];
let currFrame=0;
let lastTime=0;

function preload(){

  //load base template
  for (let i = 40; i <= 119; i++){
    logo_bg[i-40] = loadImage('assets/images/website/bg_png/logo_bg_'+nf(i,5)+'.png');
    logo_text[i-40] = loadImage('assets/images/website/text_png/logo_text_'+nf(i,5)+'.png');
  }
}

function setup() {
  canvas = createCanvas(windowWidth/2, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  noSmooth();
  frameRate(60);
  //resize all logo image arrays
  for (let i = 0; i <= 79; i++){
    logo_bg[i].resize(0,height);
    logo_text[i].resize(width*0.8,0);
  }
}

function draw() {

  //frame animation for projection base
  if (currFrame < 79){
    if ((millis()-lastTime)>125){
      currFrame ++;
      lastTime=millis();
      //noStroke();
      stroke(0);
      strokeWeight(3);
      fill(255);
      rectMode(CENTER);
      rect(width/2,height/2,width,height);
      imageMode(CENTER);

      image(logo_bg[currFrame],width/2,height/2);
      image(logo_text[currFrame],width/2,height/2);
    }
  } else {
    if ((millis()-lastTime)>125){
      currFrame =0;
      lastTime=millis();
    }
  }
}
