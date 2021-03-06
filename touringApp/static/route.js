var seaboard = []

for (var i = 0; i < allPass.length; i++) {
  if (i != 1 && i != 5) {
    Array.prototype.push.apply(seaboard, allPass[i]);
  }
}

var mapFirstX = Math.min.apply(null,seaboard.map(function(pass){ return pass['latitude']; }) ); - 1;
var mapFirstY = Math.min.apply(null,seaboard.map(function(pass){ return pass['longitude']; }) ); - 1;
var mapLastX = Math.max.apply(null,seaboard.map(function(pass){ return pass['latitude']; }) ); + 1;
var mapLastY = Math.max.apply(null,seaboard.map(function(pass){ return pass['longitude']; }) ); + 1;

var map = L.map("map", {
  center: [(mapFirstX+mapLastX)/2, (mapFirstY+mapLastY)/2],
  maxBounds: [ [mapFirstX, mapFirstY], [mapLastX, mapLastY] ],
  dragging: false, zoomControl: false, touchZoom: false,
  scrollWheelZoom: false, doubleClickZoom: false,
  boxZoom: false, keyboard: false
});
var bounds = L.latLngBounds([(mapFirstX+mapLastX)/2, (mapFirstY+mapLastY)/2]);
   bounds.extend([mapFirstX, mapFirstY]);
   bounds.extend([mapLastX, mapLastY]);
   map.fitBounds(bounds);

// http://leaflet-extras.github.io/leaflet-providers/preview/ 参照
L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19}).addTo(map);
  // これもいい
  // L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  // 	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  // }).addTo(map);
  // L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  // 	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  // }).addTo(map);

//各地点の緯度経度を結び路線を表示
for (var i = 0; i < allPass.length; i++) {
  L.polyline(
    allPass[i].map(function(stop){return [stop.latitude, stop.longitude]}),
    {color: "orange", weight: 4, clickable: false}
  ).addTo(map);
};

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
    animateStartFn: animate,
    animateStopFn: null
  },

  onAdd: function(map) {
    // div要素を作成し、leaflet-control-animateとleaflet-barクラスを与える
    var animateName = "leaflet-control-animate",
        container = L.DomUtil.create("div", animateName + " leaflet-bar"),
        options = this.options;

    // div要素内にボタン要素を作成
    this._button = this._createButton(
      this.options.animatePauseText,
      this.options.animatePauseTitle,
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

    // clickイベントに対するコールバック関数実行
    L.DomEvent
      .on(link, "mousedown dblclick", L.DomEvent.stopPropagation)
      .on(link, "click", L.DomEvent.stop)
      .on(link, "click", callback, this);

    return link;
  },

  _running: true,  //停止中から

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

// 画像表示部分
L.Control.Picture = L.Control.extend({
  options: {
    position: "topleft"
  },

  initialize: function(picture, options){
    L.setOptions(this, options);
    this._picture = picture;
  },

  onAdd: function(map){
    var container = L.DomUtil.create("div", "leaflet-control-picture");
    container.innerHTML = this._picture
    //container.innerHTML = "<img src ='http://xxxxx.jpg'>";
    return container;
  }
});

L.control.picture = function(picture, options){
    return new L.Control.Picture(picture, options);
};

var showPicture = L.control.picture("http://xxxxx.jpg");


// L.controlオブジェクトに関数追加
L.control.animate = function(options){
  return new L.Control.Animate(options);
};

// Leaflet構文でコントロールを作成
var buildAnimation = function(route, options){
  var animation = [];

  // 多角線を作成するコード
  for (var stopIdx=0, prevStops=[]; stopIdx < route.length-1; stopIdx++){
    // 現在の停車位置と次の停車位置間のステップを計算する
    var stop = route[stopIdx];
    var nextStop = route[stopIdx+1]
    prevStops.push([stop.latitude, stop.longitude]);

    for (var minutes = 1; minutes <= 2; minutes++){
      var position = [
        stop.latitude + (nextStop.latitude - stop.latitude) * (minutes/2),
        stop.longitude + (nextStop.longitude - stop.longitude) * (minutes/2)
      ];
      animation.push(
        L.polyline(prevStops.concat([position]), options)
      );
    }
  }
  return animation;
}

// アニメ線を格納する配列
var routeAnimations = [];
for (var i = 0; i < allPass.length; i++) {
  var animation = buildAnimation(allPass[i],
    {clickable: false, color: "red", weight: 8, opacity: 1.0}
  );
  routeAnimations.push(animation);
};
//ラベルオブジェクトを作成する
L.Label = L.Layer.extend({
  // LeafletのClassのinitialize()メソッド拡張
  initialize: function(latLng, label, options){
    this._latlng = latLng;
    this._label = label; // ここにリンク先をはると良いかな？<a>のサイズ要変更
    this._status = "hidden";
  },

  onAdd: function(map){
    this._container = L.DomUtil.create("div", "leaflet-label"); // leaflet-labelクラスを持つdiv要素作成
    this._container.style.height = "0"; // そのdiv要素の高さを0にし、位置計算での不測事態回避
    this._container.style.opacity = "0"; // そのdiv要素のopacityを0にし、初期状態hiddenにあわせる
    map.getPanes().markerPane.appendChild(this._container); // この要素をmarkerPaneレイヤに追加・・・Paneがよくわからん
    //this._container.innerHTML = "<img src ='http://xxxxx.jpg'>"; // 表示画像設定
    this._container.innerHTML = "<a>●</a>"; // 表示画像設定
    var position = map.latLngToLayerPoint(this._latlng); // 緯度経度からラベルの位置を計算し、オフセット調整
    var op = new L.Point(position.x, position.y);
    L.DomUtil.setPosition(this._container, op); //この要素を地図上に配置
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
    }
  }
});

var buildLabelAnimation = function(allPass){
  var labels = [];
  allPass.forEach(function(route){
    var minutes = 0; // ラベルアニメーション値を求める

    // 各停止位置を処理
    route.forEach(function(stop, idx){
        //最初か最後にはラベルはアニメーションしない
        if (idx !== 0 && idx < route.length-1){
          // Labelオブジェクト作成
          var label = new L.Label(
            [stop.latitude, stop.longitude],
            stop.latitude
            //stop.stop
          );
          map.addLayer(label);
          labels.push( {minutes: minutes, label: label, status: "shown"} ); // 到達時
          //labels.push( {minutes: minutes+5, label: label, status: "dimmed"} ); // 通過後
          labels.push( {minutes: minutes+2, label: label, status: "hidden"} ); //消える
        }
        minutes += 2;
    });
  });
  // 配列を時間の順でソート
  labels.sort(function(a,b){return a.minutes - b.minutes;})
  return labels;
}

// 線をラベル化
var labels = buildLabelAnimation(allPass);
var maxPathSteps = Math.max.apply(null,   // 線描写アニメのステップ総数を求める
  routeAnimations.map(function(animation){
    return animation.length;
  })
);
var maxLabelSteps = labels[labels.length-1].minutes; // ラベルのアニメーションが最後に起動するminutes
var maxSteps = Math.max(maxPathSteps, maxLabelSteps); // アニメーションステップのMax
var labelAnimation = labels.slice(0); // 元のデータを保持しつつ、アニメーション中の破棄を行う用に配列コピー

var step = 0;

var animateStep = function() {
  // アニメーションの次のステップを描画する
  // 最初のステップじゃない時、先ほどのステップの線を消す
  if (step > 0 && step < maxPathSteps){
    routeAnimations.forEach(function(animation){
      if (animation.length > step) {
        map.removeLayer(animation[step-1]);
      };
    });
  }
  // 最後のステップの場合、最初に戻る
  if (step === maxSteps) {
    routeAnimations.forEach(function(animation){
      map.removeLayer(animation[animation.length-1]);
    });
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
      label.setStatus(labelAnimation[0].status); // ここでlabelのopacityを変更
      // ここで画像を表示させられる？？
      showPicture._picture = label._label;
      showPicture.addTo(map);
    }
    labelAnimation.shift();
  }

  // 現在のステップの線を描く
  if (step < maxPathSteps){
    routeAnimations.forEach(function(animation){
      if (animation.length > step) {
        map.addLayer(animation[step]);
      };
    });
  }

  return ++step === maxSteps;  // アニメーションの最後に達せばtrueを返す
}

var interval = null; // 上記のステップ関数を繰り返し実行

var animate = function(){
  // アニメーションが最後に達していたらインターバルを削除し、コントロールリセット
  interval = window.setInterval(function(){
    if (animateStep()){
      window.clearInterval(interval);
      control.reset();
    }
  }, 1);
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

L.control.title("route test").addTo(map);

animate();
