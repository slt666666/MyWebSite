/* @pjs font="/static/sword_art_online_font_by_darkblackswords-d5nssbp.otf"; */
Flock fishes;
pathfinder[] paths;
int mainWidth;
int mainHeight;

MenuIcon menu;
MenuDetail detail;
boolean menuIsset;
boolean detailIsset;

PImage menu0;
PImage menu1;
PImage menu2;
PImage menu3;

// 計算処理向上のため先に計算しておく
float cos1_6 = cos(PI/6) ,sin1_6 = sin(PI/6), cos1_3 = cos(PI/3), sin1_3 = sin(PI/3), cos1_2 = cos(PI/2), sin1_2 = sin(PI/2), cos2_3 = cos(PI*2/3), sin2_3 = sin(PI*2/3)
    , cos3_5 = cos(PI*3/5), sin3_5 = sin(PI*3/5), cos9_10 = cos(PI*9/10), sin9_10 = sin(PI*9/10), cos13_10 = cos(PI*13/10), sin13_10 = sin(PI*13/10);

void setup(){
  cursor(CROSS);
  mainWidth = innerWidth;
  mainHeight = innerHeight;
  size(mainWidth,mainHeight);
  background(0);
  fishes = new Flock(3,0);
  paths = new pathfinder[1];
  paths[0] = new pathfinder(width/2, height);

  font = loadFont(SAOfont);
  textFont(font);

  menuIsset = false;
  detailIsset = false;
  smooth();
  menu0 = loadImage(menu0pass);
  menu1 = loadImage(menu1pass);
  menu2 = loadImage(menu2pass);
  menu3 = loadImage(menu3pass);
}

void draw() {

  fill(0,0,0,12);
  stroke(0);
  rect(0,0,mainWidth,mainHeight);
  fishes.deadCheck();
  fishes.update();
  fishes.display();

  for (int i=0;i<paths.length;i++) {
    float diam = paths[i].diameter;
    if (diam > 1){
      fill((paths[i].colNum),255,255);
      stroke((paths[i].colNum),255,255);
      ellipse(paths[i].location.x, paths[i].location.y, diam, diam);
      paths[i].update();
    }
  }

  if (fishes.creatures.size() < 3) {
    fishes.addFish(1);
  }

  if (menuIsset) {
    menu.display();
  }
  if (detailIsset) {
    detail.display();
  }

  fill(220,150);
  stroke(220, 150);
  textSize(48);
  textAlign(CENTER);
  text("Welcome to SandBox !!!",0, height/2, width, 50);
}

$('#test').click(function(){
  noLoop();
});

// 画面サイズ変更時の処理
$(function(){
  var timer = false;
  $(window).resize(function() {
    if (timer !== false) {
      clearTimeout(timer);
    }
    timer = setTimeout(function() {
    //リロードする
    mainWidth = innerWidth;
    mainHeight = innerHeight;
    size = (innerWidth, innerHeight);
    }, 200);
  });
});

void mousePressed(){
   //fishes.addFish(3);
   if (!menuIsset){
     menu = new MenuIcon();
     menuIsset = true;
   }else{
     if (!menu.insideCheck()) {
       menu = new MenuIcon();
       menuIsset = true;
       detailIsset = false;
     }else{
       // メニュー広げる処理
       int selectNum = menu.selectNum;
       detail = new MenuDetail(menu.iconSet[selectNum].positionX,menu.iconSet[selectNum].positionY,menu.selectNum);
       detailIsset = true;
     }
   }
}

class Ball {

  PVector position;
  float dx;
  float dy;

  Ball(){
    position = new PVector(width/2, 0);
    dx = random(-10,10);
    if (dx > 0 && dx < 3){ dx += 3 };
    if (dx < 0 && dx > -3){ dx -= 3 };
    dy = random(0.5,3);
  }

  void move(){
    //fill(255);
    //stroke(255);
    //ellipse(position.x,position.y,4,4);
    position.x += dx;
    position.y += dy;

    if ( position.x > width || position.x < 0 ) dx = -dx;
  }

}

class BodyParts {

  PVector position;
  PVector velocity;
  float topspeed;
  float reductionRate;
  float angle;
  float colNum;

  boolean hit = false;

  BodyParts(float x, float y, float col) {
    position = new PVector(x,y);
    velocity = new PVector(0,0);
    colNum = col;
    topspeed = 3;
  }

  void update(BodyParts target) {

    velocity = PVector.sub(target.position, position);
    float distance = velocity.mag();
    velocity.normalize();
    if (distance < 15){
      velocity.mult(map(distance,0,100,0,topspeed));
    }else{
      velocity.mult(topspeed);
    }

    position.add(velocity);

  }

  void display() {
    // processingでは上ほどyが小さく、下ほどyが大きい。
    // radian、角度を使う計算を取り入れるときは注意
    // 今回は正規の座標系で計算してからprocessing座標に変換する

    angle = atan2(-velocity.y, velocity.x);
    float mapAngle = abs(angle);
    if (mapAngle >= PI/2){
      reductionRate = map(mapAngle,PI/2,PI,0,1);
    }else{
      reductionRate = map(mapAngle,0,PI,1,0);
    }
    stroke(0,colNum,255);
    strokeWeight(2);
    fill(0,colNum,255);

  }

  boolean collision(){

    if (position.y > height){
      return true;
    }else{
      return false;
    }
  }

}
class Creature{
  ArrayList<BodyParts> bodies;
  Head brain;

  Creature(int num, Head head){
    bodies = new ArrayList<BodyParts>();
    brain = head;
    bodies.add(head);
  }

  void update(){
    //頭部の更新
    brain.update();
    //その他のBodyパーツ更新
    //for (int i = 1; i < bodies.size(); i++){
    //  bodies.get(i).update(bodies.get(i-1));
    //}
  }

  void display(){
  }

  void connect(){
  }
}
class CreatureFish extends Creature{

  CreatureFish(int num, fishHead head){
    super(num, head);
    for (int i = 0; i < num-1; i++){
      bodies.add(new Middle(head.position.x,head.position.y, random(255)));
    }
    bodies.add(new Tail(head.position.x,head.position.y, random(255)));
  }

  void update(){
    super.update();
    //その他のBodyパーツ更新
    for (int i = 1; i < bodies.size(); i++){
      bodies.get(i).update(bodies.get(i-1));
    }
  }

  void display(){
    bodies.get(bodies.size()-1).display();
    for (int i = bodies.size()-3; i >= 0; i--){
      bodies.get(i).display();
    }
  }

  void connect(){
    stroke(255);
    noFill();
    beginShape();
    for (int i = 1; i < bodies.size(); i++){
      vertex(bodies.get(i).position.x, bodies.get(i).position.y);
    }
    endShape();
  }
}

class fishHead extends Head{

  fishHead(float x, float y, float col) {
    super(x, y, col);
  }

  void display() {
    angle = atan2(-velocity.y,velocity.x);
    float cosA = cos(angle);
    float sinA = sin(angle);
    reductionRate = map(abs(velocity.x),0,topspeed,0,1);
    stroke(0,colNum,255);
    strokeWeight(2);
    pushMatrix();
    translate(position.x, position.y);
    fill(0,colNum,255);
    beginShape();
    //右向き
    if(angle <= PI/2 && angle >= -PI/2){
      vertex(16*(cosA*cos1_6 + sinA*sin1_6)*reductionRate,
            -16*(sinA*cos1_6 - cosA*sin1_6));
      vertex(6*(cosA*-cos1_6 + sinA*sin1_6)*reductionRate,
            -6*(sinA*cos1_6 - cosA*sin1_6));
      vertex(12*(cosA*cos2_3 - sinA*sin2_3)*reductionRate,
            -12*(sinA*cos2_3 + cosA*sin2_3));
      vertex(20*(cosA*cos2_3 - sinA*sin2_3)*reductionRate,
            -20*(sinA*cos2_3 + cosA*sin2_3));
      vertex(12*(cosA*cos1_3 - sinA*sin1_3)*reductionRate,
            -12*(sinA*cos1_3 + cosA*sin1_3));
    }else{
    //左向き
      vertex(16*(cosA*cos1_6 - sinA*sin1_6)*reductionRate,
            -16*(sinA*cos1_6 + cosA*sin1_6));
      vertex(6*(cosA*-cos1_6 - sinA*sin1_6)*reductionRate,
            -6*(sinA*cos1_6 + cosA*sin1_6));
      vertex(12*(cosA*cos2_3 + sinA*sin2_3)*reductionRate,
            -12*(sinA*cos2_3 - cosA*sin2_3));
      vertex(20*(cosA*cos2_3 + sinA*sin2_3)*reductionRate,
            -20*(sinA*cos2_3 - cosA*sin2_3));
      vertex(12*(cosA*cos1_3 + sinA*sin1_3)*reductionRate,
            -12*(sinA*cos1_3 - cosA*sin1_3));
    }
    endShape(CLOSE);
    //目
    stroke(0);
    fill(0);
    ellipse(0,0,4*reductionRate,4);
    popMatrix();
  }

}
class Flock{
  ArrayList<Creature> creatures;
  int subNum = 1;

  Flock(int num_fish, int num_hebi){
    creatures = new ArrayList<Creature>();
    for (int i = 0; i < num_fish; i++){
      fishHead brain = new fishHead(random(width), 0, random(255));
      creatures.add(new CreatureFish(6, brain));
    }
    //for (int i = 0; i < num_hebi; i++){
    //  hebiHead brain = new hebiHead(random(width), 0, random(255));
    //  creatures.add(new CreatureHebikera(4, brain));
    //}
  }

  void addFish(int num){
    for (int i = 0; i < num; i++){
      fishHead brain = new fishHead(random(width), 0, random(255));
      creatures.add(new CreatureFish(6, brain));
    }
  }

  //void addHebi(){
  //  hebiHead brain = new hebiHead(random(width), 0, random(255));
  //  creatures.add(new CreatureHebikera(4, brain));
  //}

  void update(){
    for (Creature c: creatures){
      c.update();
    }
  }

  void display(){
    for (Creature c: creatures){
      c.display();
      c.connect();
    }
  }

  void deadCheck(){
    for (int i = creatures.size()-1; i >= 0; i--){
      if(creatures.get(i).bodies.get(0).collision()){
        Creature creature = creatures.get(i);
        paths = (pathfinder[])append(paths, new pathfinder(creature.brain.position.x,creature.brain.position.y));
        creatures.remove(creatures.get(i));
      }
    }
  }
}
class Head extends BodyParts{

  int followNum;
  Ball ball;

  Head(float x, float y, float col) {
    super(x, y, col);
    ball = new Ball();
  }

  void update() {
    ball.move();
    velocity.add(follow());
    velocity.add(separate());
    velocity.limit(topspeed);
    position.add(velocity);
  }

  PVector follow() {
    PVector followPower = PVector.sub(ball.position,position);
    followPower.setMag(0.2);
    followPower.limit(topspeed);
    return followPower;
  }

  PVector separate(){
    float desiredDistance = 12;
    PVector sum = new PVector();
    int count = 0;
  //for (Creature c: FishAndHebi.creatures){
    for (Creature c: fishes.creatures){
      for (BodyParts p: c.bodies){
        float d = PVector.dist(position, p.position);
        if ((d > 0) && (d < desiredDistance)){
          PVector diff = PVector.sub(position, p.position);
          diff.normalize();
          diff.div(d);
          sum.add(diff);
          count++;
        }
      }
    }
    if (count > 0){
      sum.div(count);
      sum.normalize();
      sum.mult(0.6);
    }
    return sum;
  }

  void display() {
    angle = atan2(-velocity.y,velocity.x);
    reductionRate = map(abs(velocity.x),0,topspeed,0,1);
    stroke(255,colNum,0);
    strokeWeight(2);
  }

}
class Middle extends BodyParts {

  Middle(float x, float y, float col) {
    super(x, y, col);
  }

  void display() {
    super.display();
    float cosA = cos(angle);
    float sinA = sin(angle);

    pushMatrix();
    translate(position.x, position.y);
    beginShape();
    if(angle <= PI/2 && angle >= -PI/2){
      vertex(8*cosA*reductionRate,-8*sinA);
      vertex(18*(cosA*cos3_5 - sinA*sin3_5)*reductionRate,
            -18*(sinA*cos3_5 + cosA*sin3_5));
      vertex(-8*sinA*reductionRate,-8*cosA);
      vertex(12*(cosA*cos9_10 - sinA*sin9_10)*reductionRate,
            -12*(sinA*cos9_10 + cosA*sin9_10));
      vertex(8*(cosA*-cos1_6 - sinA*-sin1_6)*reductionRate,
            -8*(sinA*-cos1_6 + cosA*-sin1_6));
      vertex(12*(cosA*cos13_10 - sinA*sin13_10)*reductionRate,
            -12*(sinA*cos13_10 + cosA*sin13_10));
      vertex(8*(cosA*cos13_10 - sinA*sin13_10)*reductionRate,
            -8*(sinA*cos13_10 + cosA*sin13_10));
      vertex(8*(cosA*-cos3_5 - sinA*-sin3_5)*reductionRate,
            -8*(sinA*-cos3_5 + cosA*-sin3_5));
    }else{
    //左向き
      vertex(8*cosA*reductionRate,-8*sinA);
      vertex(18*(cosA*cos3_5 + sinA*sin3_5)*reductionRate,
            -18*(sinA*cos3_5 - cosA*sin3_5));
      vertex(8*(cosA*cos1_2 + sinA*sin1_2)*reductionRate,
            -8*(sinA*cos1_2 - cosA*sin1_2));
      vertex(12*(cosA*cos9_10 + sinA*sin9_10)*reductionRate,
            -12*(sinA*cos9_10 - cosA*sin9_10));
      vertex(8*(cosA*-cos1_6 + sinA*-sin1_6)*reductionRate,
            -8*(sinA*-cos1_6 - cosA*-sin1_6));
      vertex(12*(cosA*cos13_10 + sinA*sin13_10)*reductionRate,
            -12*(sinA*cos13_10 - cosA*sin13_10));
      vertex(8*(cosA*cos13_10 + sinA*sin13_10)*reductionRate,
            -8*(sinA*cos13_10 - cosA*sin13_10));
      vertex(8*(cosA*-cos3_5 + sinA*-sin3_5)*reductionRate,
            -8*(sinA*-cos3_5 - cosA*-sin3_5));
    }
    endShape(CLOSE);
    popMatrix();
  }

}
class pathfinder {

  PVector location;
  PVector velocity;
  float colNum;
  float diameter;

  pathfinder(float x, float y) {
    location = new PVector(x, y);
    velocity = new PVector(0, -1);
    diameter = 16;
    colNum = random(255);
  }

   pathfinder(pathfinder parent) {
     location = parent.location.get();
     colNum = parent.colNum;
     velocity = parent.velocity.get();
     diameter = parent.diameter*0.7;
     parent.diameter = parent.diameter*0.7;
   }

   void update(){
     if ( diameter > 0.4 ) {
       location.add(velocity);
       PVector bump = new PVector(random(-1, 1), random(-1, 1));
       bump.mult(0.1);
       velocity.add(bump);
       velocity.normalize();
       if (random(0,1)<0.02){
         paths = (pathfinder[])append(paths, new pathfinder(this));
       }
     }
   }
}
class Tail extends BodyParts{

  Tail(float x, float y, float col){
    super(x, y, col);
  }

  void display() {
    super.display();
    float cosA = cos(angle);
    float sinA = sin(angle);
    pushMatrix();
    translate(position.x, position.y);
    beginShape();
    vertex(8*cosA*reductionRate,-8*sinA);
    vertex(-4*sinA*reductionRate,-4*cosA);
    vertex(-24*cosA*reductionRate,24*sinA);
    vertex(4*sinA*reductionRate,4*cosA);
    endShape(CLOSE);
    popMatrix();
  }
}


class Detail {

  float positionX;
  float positionY;
  int selectNum;
  int detailNum;
  int slide;
  boolean appeared;
  PImage img;

  Detail(float x, float y, int selectNum, int detailNum) {
    positionX = x;
    positionY = y;
    selectNum = selectNum;
    detailNum = detailNum;
    slide = 0;
    img = menu0;
    appeared = false;
  }

  boolean insideCheck() {
    return (mouseX > positionX && mouseX < positionX+100 && mouseY < positionY && mouseY > positionY - 42);
  }

  void display() {

    if (!appeared) {

      fill(220,150);
      rect(positionX, positionY, 100, -1-slide);
      slide += 10;
      if (slide > 41) { appeared = true; }

    }else{
      // insideCheck入れる
      if (!insideCheck()){
        fill(220,150);
        rect(positionX, positionY, 100, -42);
        tint(0,100);
        image(img, positionX+8, positionY-30, 20, 20);
      }else{
        fill(256,183,76,150);
        rect(positionX, positionY, 100, -42);
        noTint();
        image(img, positionX+8, positionY-30, 20, 20);
      }
    }
  }
}

class Icon {

  float positionX;
  float positionY;
  int slide;
  boolean appeared;
  PImage img;

  Icon(float x, float y, int menuNum) {
    positionX = x;
    positionY = y;
    slide = 1;
    switch(menuNum) {
  　　case 0:
  　　　img = menu0;
       break;
  　　case 1:
  　　　img = menu1;
       break;
     case 2:
  　　　img = menu2;
       break;
     case 3:
  　　　img = menu3;
       break;
  　　default:
  　　　break
  　}
    appeared = false;
  }

  boolean insideCheck() {
    return (dist(mouseX,mouseY,positionX,positionY) < 20);
  }

  void appear() {

    stroke(200);
    fill(200,150);
    ellipse(positionX,positionY-50+slide,40,40);
    slide += 15;
    if (slide > 49){
      appeared = true;
    }

  }

  void display() {
    if (insideCheck()) {
      fill(255,183,76,150);
      stroke(255,183,76,150);
      ellipse(positionX,positionY,40,40);
      strokeWeight(2);
      stroke(0,150);
      ellipse(positionX,positionY,38,38);
      noTint();
      image(img, positionX-13, positionY-13, 26, 26);
    }else{
      fill(200,150);
      stroke(200,150);
      ellipse(positionX,positionY,40,40);
      strokeWeight(2);
      stroke(0,150);
      ellipse(positionX,positionY,38,38);
      tint(0,100);
      image(img, positionX-13, positionY-13, 26, 26);
    }
  }
}

class MenuDetail {

  Detail[] details;
  float positionX;
  float positionY;

  MenuDetail(float x, float y, int selectNum) {

    positionX = x + 30;
    positionY = y;
    details = new Detail[2];
    details[0] = new Detail(x + 52, y + 20, selectNum, 0);
    details[1] = new Detail(x + 52, y - 25 ,selectNum, 1);
  }

  boolean insideCheck() {
    return true;
  }

  void display() {
        // 矢印
    fill(220,150);
    triangle(positionX, positionY, positionX+20, positionY+10, positionX+20, positionY-10);
    fill(0,150);
    ellipse(positionX+15,positionY,2,2);
    details[0].display();
    details[1].display();
  }
}

class MenuIcon {

  boolean appeared;
  int selectNum;
  Icon[] iconSet;

  MenuIcon() {
    iconSet = new Icon[4];
    for (int i = 0; i < 4; i++){
      iconSet[i] = new Icon(mouseX,mouseY+i*50,i);
    }
    appeared = false;
  }

  boolean insideCheck() {

    for (int j = 0; j < 4; j++) {
      if (iconSet[j].insideCheck()){
        selectNum = j;
        return true;
      }
    }
    return false;
  }

  void display() {
    iconSet[0].appeared = true;
    for (int i = 3; i > 0; i--){
      if (iconSet[i-1].appeared) {
        if (iconSet[i].appeared) {
          iconSet[i].display();
        }else{
          iconSet[i].appear();
        }
      }
    }
    iconSet[0].display();
  }
}
