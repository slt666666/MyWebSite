/*------------*/
/** Data Set **/
/*------------*/

var seaboard = [
    { "stop": "Washington",     "latitude": 38.895111, "longitude": -77.036667, "duration":  77, "offset": [-30,-10] },
    { "stop": "Fredericksburg", "latitude": 38.301806, "longitude": -77.470833, "duration":  89, "offset": [  6,  4] },
    { "stop": "Richmond",       "latitude": 37.533333, "longitude": -77.466667, "duration":  29, "offset": [  6,  4] },
    { "stop": "Petersburg",     "latitude": 37.21295,  "longitude": -77.400417, "duration":  93, "offset": [  6,  4] },
    { "stop": "Henderson",      "latitude": 36.324722, "longitude": -78.408611, "duration":  44, "offset": [  6,  4] },
    { "stop": "Raleigh",        "latitude": 35.818889, "longitude": -78.644722, "duration": 116, "offset": [  6,  4] },
    { "stop": "Hamlet",         "latitude": 34.888056, "longitude": -79.706111, "duration":  74, "offset": [  6,  6] },
    { "stop": "Monroe",         "latitude": 34.988889, "longitude": -80.549722, "duration":  58, "offset": [  6, -8] },
    { "stop": "Chester",        "latitude": 34.705556, "longitude": -81.211667, "duration":  54, "offset": [  6,  6] },
    { "stop": "Clinton",        "latitude": 34.471389, "longitude": -81.875,    "duration":  34, "offset": [  6,  6] },
    { "stop": "Greenwood",      "latitude": 34.189722, "longitude": -82.154722, "duration":  22, "offset": [ 10, -2] },
    { "stop": "Abbeville",      "latitude": 34.178611, "longitude": -82.379167, "duration":  39, "offset": [  4, 10] },
    { "stop": "Elberton",       "latitude": 34.109722, "longitude": -82.865556, "duration":  41, "offset": [  6, 10] },
    { "stop": "Athens",         "latitude": 33.95,     "longitude": -83.383333, "duration":  75, "offset": [  6,  6] },
    { "stop": "Emory",          "latitude": 33.791111, "longitude": -84.323333, "duration":  25, "offset": [ 10,  4] },
    { "stop": "Atlanta",        "latitude": 33.755,    "longitude": -84.39,     "duration":   0, "offset": [-21, 10] }
];

var mapFirstX = Math.min.apply(null,seaboard.map(function(pass){ return pass['latitude']; }) ); - 1;
var mapFirstY = Math.min.apply(null,seaboard.map(function(pass){ return pass['longitude']; }) ); - 1;
var mapLastX = Math.max.apply(null,seaboard.map(function(pass){ return pass['latitude']; }) ); + 1;
var mapLastY = Math.max.apply(null,seaboard.map(function(pass){ return pass['longitude']; }) ); + 1;

var map = L.map("map", {
  center: [(mapFirstX+mapLastX)/2, (mapFirstY+mapLastY)/2],
  maxBounds: [ [mapFirstX, mapFirstY], [mapLastX, mapLastY] ],
  zoom: 7,
  minZoom: 7,
  maxZoom: 7,
  dragging: false,
  zoomControl: false,
  touchZoom: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false
});


// タイルセットをベースに地図を描く
// http://leaflet-extras.github.io/leaflet-providers/preview/ 参照
L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/"+
            "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
            attribution: "Tiles &copy; Esri &mdash; Esri, Delorme, NAVTEQ",
            maxZom: 16
}).addTo(map);

//各地点の緯度経度を結び路線を表示
L.polyline(
  seaboard.map(function(stop){return [stop.latitude, stop.longitude]}),
  {color: "#106624", weight: 1, clickable: false}
).addTo(map);

// アニメーションコントロール
L.Control.Animate = L.Control.extend({
  // オプションの定義
  options: {
    position: "topleft",
    animateStartText: "▶︎",
    animateStartTitle: "Start Animation",
    animatePauseText: "■",
    animatePauseTitle: "Pause Animation",
    animateResumeText: "▶︎",
    animateResumeTitle: "Resume Animation",
    animateStartFn: null,
    animateStopFn: null
  },

  onAdd: function(map) {
    // div要素を作成し、leaflet-control-animateとleaflet-barクラスを与える
    var animateName = "leaflet-control-animate",
        container = L.DomUtil.create("div", animateName + " leaflet-bar"),
        options = this.options;

    // div要素内にボタン要素を作成
    this._button = this._createButton(
      this.options.animateStartText,
      this.options.animateStartTitle,
      animateName,
      container,
      this._clicked);

    return container;
  },

  _createButton: function(html, title, className, container, callback){

    // 指定したテキスト、タイトル、クラスを持つ<a>要素としてボタン作成
    var link = L.DomUtil.create("a", className, container);
      link.innerHTML = html,
      link.href = "#",
      link.title = title;

    // mousedown,dblclick無視　・・・APIよくわからない
    // クリックがドキュメントツリーの上位に伝播させない　・・・APIよくわからない
    // clickイベントに対するコールバック関数実行
    L.DomEvent
      .on(link, "mousedown dblclick", L.DomEvent.stopPropagation)
      .on(link, "click", L.DomEvent.stop)
      .on(link, "click", callback, this);

    return link;
  },

  // 現在動作中かどうかの状態変数、停止中から始める
  _running: false,

  //状態変数に応じて状態を変化させる
  _clicked: function() {
    if (this._running) {
      if (this.options.animateStopFn) {
        this.options.animateStopFn();
      }
      this._button.innerHTML = this.options.animateResumeText;
      this._button.title = this.options.animateResumeTitle;
    }else{
      if (this.options.animateStartFn) {
        this.options.animateStartFn();
      }
      this._button.innerHTML = this.options.animatePauseText;
      this._button.title = this.options.animatePauseTitle;
    }
    this._running = !this._running;
  },

  reset: function() {
    this._running = false;
    this._button.innerHTML = this.options.animateStartText;
    this._button.title = this.options.animateStartTitle;
  }
});

// L.controlオブジェクトに関数追加
L.control.animate = function(options){
  return new L.Control.Animate(options);
};


// Leaflet構文でコントロールを作成
//L.control.animate().addTo(map);

var buildAnimation = function(route, options){
  var animation = [];

  // 多角線を作成するコード
  for (var stopIdx=0, prevStops=[]; stopIdx < route.length-1; stopIdx++){
    // 現在の停車位置と次の停車位置間のステップを計算する
    var stop = route[stopIdx];
    var nextStop = route[stopIdx+1]
    prevStops.push([stop.latitude, stop.longitude]);

    for (var minutes = 1; minutes <= stop.duration; minutes++){
      var position = [
        stop.latitude + (nextStop.latitude - stop.latitude) * (minutes/stop.duration),
        stop.longitude + (nextStop.longitude - stop.longitude) * (minutes/stop.duration)
      ];
      animation.push(
        L.polyline(prevStops.concat([position]), options)
      );
    }
  }

  return animation;
}

// 路線を格納する配列
var routeAnimation = buildAnimation(seaboard,
    {clickable: false, color: "#88020B", weight: 8, opacity: 1.0}
  );


//ラベルオブジェクトを作成する
L.Label = L.Layer.extend({

  // LeafletのClassのinitialize()メソッド拡張
  initialize: function(latLng, label, options){
    this._latlng = latLng;
    this._label = label;
    L.Util.setOptions(this, options);
    this._status = "hidden";
  },

  // initializeメソッド内のL.Util.setOptions呼び出しと組み合わせ
  // Labelオブジェクト作成時に簡単にオーバーライドできるオフセットのデフォルト値指定
  options: {
    offset: new L.Point(0, 0)
  },

  onAdd: function(map){
    // leaflet-labelクラスを持つdiv要素作成
    this._container = L.DomUtil.create("div", "leaflet-label");
    // そのdiv要素の高さを0にし、位置計算での不測事態回避
    this._container.style.height = "0";
    // そのdiv要素のopacityを0にし、初期状態hiddenにあわせる
    this._container.style.opacity = "0";
    // この要素をmarkerPaneレイヤに追加・・・Paneがよくわからん
    map.getPanes().markerPane.appendChild(this._container);
    // 表示画像設定
    this._container.innerHTML = "<img src ='http://www.d3.dion.ne.jp/~tiyoko01/hyo/twin.jpg'>";
    // 緯度経度からラベルの位置を計算し、オフセット調整
    var position = map.latLngToLayerPoint(this._latlng);
    var op = new L.Point(
      position.x + this.options.offset.x,
      position.y + this.options.offset.y
    );
    //この要素を地図上に配置
    L.DomUtil.setPosition(this._container, op);
  },

  // ラベルの取得と設定
  getStatus: function(){
    return this._status;
  },
  setStatus: function(status){
    switch (status) {
      case "hidden":
        this._status = "hidden";
        this._container.style.opacity = "0";
        break;
      case "shown":
        this._status = "shown";
        this._container.style.opacity = "1";
        break;
      case "dimmed":
        this._status = "dimmed";
        this._container.style.opacity = "0.5";
        break;
      case "vanished":
        this._status = "vanished";
        this._container.style.opacity = "0";
    }
  }
});

var buildLabelAnimation = function(){
  var args = arguments[0].slice(0),
      labels = [];

  // ラベルアニメーション値を求める
  var minutes = 0;

  // 各停止位置を処理
  args.forEach(function(stop, idx){
      //最初か最後にはラベルはアニメーションしない
      if (idx !== 0 && idx < args.length-1){
        // Labelオブジェクト作成
        var label = new L.Label(
          [stop.latitude, stop.longitude],
          stop.stop,
          {offset: new L.Point(stop.offset[0], stop.offset[1])}
        );
        map.addLayer(label);
        // 到達時はshownとして追加
        labels.push(
          {minutes: minutes, label: label, status: "shown"}
        );
        // 通過後はdimmedとして追加
        labels.push(
          {minutes: minutes+25, label: label, status: "dimmed"}
        );
        // そして消える
        labels.push(
          {minutes: minutes+50, label: label, status: "vanished"}
        );
      }
      minutes += stop.duration;
  });
  // 配列を時間の順でソート
  labels.sort(function(a,b){return a.minutes - b.minutes;})

  return labels;
}

// 線をラベル化
var labels = buildLabelAnimation(seaboard);

//最初と最後は最初から表示
var start = seaboard[0];
var label = new L.Label(
  [start.latitude, start.longitude],
  start.stop,
  {offset: new L.Point(start.offset[0], start.offset[1])}
);
map.addLayer(label);
label.setStatus("shown");

var finish = seaboard[seaboard.length-1];
var label = new L.Label(
  [finish.latitude, finish.longitude],
  finish.stop,
  {offset: new L.Point(finish.offset[0], finish.offset[1])}
);
map.addLayer(label);
label.setStatus("shown");

// 線描写アニメのステップ総数を求める
var maxPathSteps = routeAnimation.length;
// ラベルのアニメーションが最後に起動するminutes
var maxLabelSteps = labels[labels.length-1].minutes;
// アニメーションステップのMax
var maxSteps = Math.max(maxPathSteps, maxLabelSteps);
// 元のデータを保持しつつ、アニメーション中の破棄を行う用に配列コピー
var labelAnimation = labels.slice(0);
console.log(labelAnimation);

var step = 0;

var animateStep = function() {
  // アニメーションの次のステップを描画する

  // 最初のステップじゃない時、先ほどのステップの線を消す
  if (step > 0 && step < maxPathSteps){
      map.removeLayer(routeAnimation[step-1]);
  }

  // 最後のステップの場合、最初に戻る
  if (step === maxSteps) {
    map.removeLayer(routeAnimation[maxPathSteps-1]);

    labelAnimation = labels.slice(0);
    labelAnimation.forEach(function(label){
      label.label.setStatus("hidden");
    });
    step = 0;
  }

  // 配列に最初の要素がある時、minutesに応じてラベル作成orStatus変更
  while (labelAnimation.length && step === labelAnimation[0].minutes){
    var label = labelAnimation[0].label;
    if (step < maxPathSteps || label.getStatus() === "shown"){
      // ここでlabelのopacityを変更
      label.setStatus(labelAnimation[0].status);
    }
    labelAnimation.shift();
  }

  // 現在のステップの線を描く
  if (step < maxPathSteps){
      map.addLayer(routeAnimation[step]);
  }

  // アニメーションの最後に達せばtrueを返す
  return ++step === maxSteps;
}

// 上記のステップ関数を繰り返し実行
var interval = null;

var animate = function(){
  // アニメーションが最後に達していたらインターバルを削除し、コントロールリセット
  interval = window.setInterval(function(){
    if (animateStep()){
      window.clearInterval(interval);
      control.reset();
    }
  }, 30);
}

// インターバルを停止する
var pause = function(){
  window.clearInterval(interval);
}

// コントロールオブジェクト作成
var control = L.control.animate({
  animateStartFn: animate,
  animateStopFn: pause
});

control.addTo(map);


// タイトル追加
L.Control.Title = L.Control.extend({
  options: {
    position: "topleft"
  },

  initialize: function(title, options){
    L.setOptions(this, options);
    this._title = title;
  },

  onAdd: function(map){
    var container = L.DomUtil.create("div", "leaflet-control-title");
    container.innerHTML = this._title;
    return container;
  }
});

L.control.title = function(title, options){
  return new L.Control.Title(title, options);
};

L.control.title("Geography as a Competitive Advantage").addTo(map);
