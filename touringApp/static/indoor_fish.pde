Flock fishes;
pathfinder[] paths;

void setup(){
  size(innerWidth,innerHeight);
  background(0);
  fishes = new Flock(2,0);
  paths = new pathfinder[1];
  paths[0] = new pathfinder(width/2, height);
}

void draw() {

  fill(0,0,0,8);
  stroke(0);
  rect(0,0,innerWidth,innerHeight);
  fishes.deadCheck();
  fishes.update();
  fishes.display();

  for (int i=0;i<paths.length;i++) {
    PVector loc = paths[i].location;
    float diam = paths[i].diameter;
    if (diam > 1){
      fill((paths[i].colNum),255,255);
      stroke((paths[i].colNum),255,255);
      ellipse(loc.x, loc.y, diam, diam);
      paths[i].update();
    }
  }

  if (fishes.creatures.size() < 2) {
    fishes.addFish(1);
  }
}

$('#test').click(function(){
  noLoop();
});

void mousePressed(){
   fishes.addFish(2);
}

class Ball {

  PVector position;
  float dx;
  float dy;

  Ball(){
    position = new PVector(width/2, 0);
    dx = random(-6,6);
    dy = random(0.5,2);
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
    if (distance < 12){
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
    reductionRate = map(abs(velocity.x),0,topspeed,0,1);
    stroke(0,colNum,255);
    strokeWeight(2);
    pushMatrix();
    translate(position.x, position.y);
    fill(0,colNum,255);
    beginShape();
    //右向き
    if(angle <= PI/2 && angle >= -PI/2){
      vertex(16*cos(angle-PI/6)*reductionRate,-16*sin(angle-PI/6));
      vertex(6*cos(angle-PI*5/6)*reductionRate,-6*sin(angle-PI*5/6));
      vertex(12*cos(angle+PI*2/3)*reductionRate,-12*sin(angle+PI*2/3));
      vertex(20*cos(angle+PI*2/3)*reductionRate,-20*sin(angle+PI*2/3));
      vertex(12*cos(angle+PI/3)*reductionRate,-12*sin(angle+PI/3));
    }else{
    //左向き
      vertex(16*cos(angle+PI/6)*reductionRate,-16*sin(angle+PI/6));
      vertex(6*cos(angle+PI*5/6)*reductionRate,-6*sin(angle+PI*5/6));
      vertex(12*cos(angle-PI*2/3)*reductionRate,-12*sin(angle-PI*2/3));
      vertex(20*cos(angle-PI*2/3)*reductionRate,-20*sin(angle-PI*2/3));
      vertex(12*cos(angle-PI/3)*reductionRate,-12*sin(angle-PI/3));
    }
    endShape(CLOSE);
    //目
    stroke(0);
    strokeWeight(2);
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
    PVector followP = follow();
    PVector separateP = separate();
    velocity.add(followP);
    velocity.add(separateP);
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
      sum.mult(0.2);
    }
    return sum;
  }

  void display() {
    angle = atan2(-velocity.y,velocity.x);
    reductionRate = map(abs(velocity.x),0,topspeed,0,1);
    stroke(255,colNum,0);
    strokeWeight(2);
    pushMatrix();
    translate(position.x, position.y);
    fill(255,colNum,0);
    beginShape();
    //右向き
    if(angle <= PI/2 && angle >= -PI/2){
      vertex(16*cos(angle-PI/6)*reductionRate,-16*sin(angle-PI/6));
      vertex(6*cos(angle-PI*5/6)*reductionRate,-6*sin(angle-PI*5/6));
      vertex(12*cos(angle+PI*2/3)*reductionRate,-12*sin(angle+PI*2/3));
      vertex(20*cos(angle+PI*2/3)*reductionRate,-20*sin(angle+PI*2/3));
      vertex(12*cos(angle+PI/3)*reductionRate,-12*sin(angle+PI/3));
    }else{
    //左向き
      vertex(16*cos(angle+PI/6)*reductionRate,-16*sin(angle+PI/6));
      vertex(6*cos(angle+PI*5/6)*reductionRate,-6*sin(angle+PI*5/6));
      vertex(12*cos(angle-PI*2/3)*reductionRate,-12*sin(angle-PI*2/3));
      vertex(20*cos(angle-PI*2/3)*reductionRate,-20*sin(angle-PI*2/3));
      vertex(12*cos(angle-PI/3)*reductionRate,-12*sin(angle-PI/3));
    }
    endShape(CLOSE);
    //目
    stroke(0);
    strokeWeight(2);
    fill(0);
    ellipse(0,0,4*reductionRate,4);
    popMatrix();
  }

}
class Middle extends BodyParts {

  Middle(float x, float y, float col) {
    super(x, y, col);
  }

  void display() {
    super.display();
    pushMatrix();
    translate(position.x, position.y);
    beginShape();
    if(angle <= PI/2 && angle >= -PI/2){
      vertex(8*cos(angle)*reductionRate,-8*sin(angle));
      vertex(18*cos(angle+PI*3/5)*reductionRate,-18*sin(angle+PI*3/5));
      vertex(8*cos(angle+PI/2)*reductionRate,-8*sin(angle+PI/2));
      vertex(12*cos(angle+PI*9/10)*reductionRate,-12*sin(angle+PI*9/10));
      vertex(8*cos(angle+PI*7/6)*reductionRate,-8*sin(angle+PI*7/6));
      vertex(12*cos(angle+PI*13/10)*reductionRate,-12*sin(angle+PI*13/10));
      vertex(8*cos(angle+PI*13/10)*reductionRate,-8*sin(angle+PI*13/10));
      vertex(8*cos(angle+PI*8/5)*reductionRate,-8*sin(angle+PI*8/5));
    }else{
    //左向き
      vertex(8*cos(angle)*reductionRate,-8*sin(angle));
      vertex(18*cos(angle-PI*3/5)*reductionRate,-18*sin(angle-PI*3/5));
      vertex(8*cos(angle-PI/2)*reductionRate,-8*sin(angle-PI/2));
      vertex(12*cos(angle-PI*9/10)*reductionRate,-12*sin(angle-PI*9/10));
      vertex(8*cos(angle-PI*7/6)*reductionRate,-8*sin(angle-PI*7/6));
      vertex(12*cos(angle-PI*13/10)*reductionRate,-12*sin(angle-PI*13/10));
      vertex(8*cos(angle-PI*13/10)*reductionRate,-8*sin(angle-PI*13/10));
      vertex(8*cos(angle-PI*8/5)*reductionRate,-8*sin(angle-PI*8/5));
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
    pushMatrix();
    translate(position.x, position.y);
    beginShape();
    vertex(8*cos(angle)*reductionRate,-8*sin(angle));
    vertex(4*cos(angle+PI/2)*reductionRate,-4*sin(angle+PI/2));
    vertex(24*cos(angle+PI)*reductionRate,-24*sin(angle+PI));
    vertex(4*cos(angle+PI*3/2)*reductionRate,-4*sin(angle+PI*3/2));
    endShape(CLOSE);
    popMatrix();
  }
}
