$(document).ready(function(){
	//google map作成
	var map = new google.maps.Map(document.getElementById("map"), {
    	zoom: 5,
    	scrollwheel: false,
			center: new google.maps.LatLng(39, 138),
    	mapTypeId: google.maps.MapTypeId.ROADMAP
	});

  //経路のポイントを保存する配列
  var points = [];
	var waypts = [];
	var markers = [];
	var routeDisplay = new google.maps.DirectionsRenderer();
	//clickイベントを取得するListener追加
	google.maps.event.addListener(map, 'click', clickEventFunc);

	//クリックによるイベント、座標取得、マーカー設置
	function clickEventFunc(event) {
		//座標保存
    var Lat = event.latLng.lat(),
				Lng = event.latLng.lng();
		points.push([Lat, Lng]);
		//マーカー保存
		marker = new google.maps.Marker({
	  	position: new google.maps.LatLng(Lat, Lng),
	  	map: map,
	  	title: "routePoint",
			label: points.length.toString()
    });
		markers.push(marker);
		//途中経路
		if (points.length > 2){
			for (var i = 1; i < points.length-1; i++){
				waypts.push({
						location: new google.maps.LatLng(points[i][0],points[i][1]),
						stopover: true
				});
			}
		}
	}

	//ログ取得
	$('#getLog').click(function(){
		//ルートを検索し、座標をテキストエリアに表示する
		new google.maps.DirectionsService().route({
	  	origin:      new google.maps.LatLng(points[0][0],points[0][1]),
	  	destination: new google.maps.LatLng(points[points.length-1][0],points[points.length-1][1]),
	  	waypoints: waypts,
	  	travelMode: google.maps.DirectionsTravelMode.DRIVING,
	  	avoidHighways: true,
	  	avoidTolls: true
		}, function(result, status) {
	  	if (status == google.maps.DirectionsStatus.OK) {
	  		var arr = result.routes[0].overview_path;
				for (var i = 0; i < arr.length; i++) {
	      	$('#log').append("緯度" + arr[i].lat() + "経度" + arr[i].lng());
	      }
	      routeDisplay = new google.maps.DirectionsRenderer({
	      	map: map,
	        suppressMarkers: true
	      });
				routeDisplay.setDirections(result);

	    } else if (status == google.maps.DirectionsStatus.INVALID_REQUEST) {
	    		alert("DirectionsRequestに問題アリ！渡している内容を確認せよ！！");
	  	} else if (status == google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED) {
	    		alert("DirectionsRequestのDirectionsWaypointsが多すぎ！");
	  	} else if (status == google.maps.DirectionsStatus.NOT_FOUND) {
	    		alert("DirectionsRequestのorigin,destination,waypointsのいずれかのジオコーディングに失敗！");
	  	} else if (status == google.maps.ElevationStatus.OVER_QUERY_LIMIT) {
	    		alert("短時間にDirectionsRequestクエリを送りすぎ！");
	  	} else if (status == google.maps.ElevationStatus.REQUEST_DENIED) {
	    		alert("このページでは DirectionsRequest の利用が許可されていない！");
	  	} else if (status == google.maps.ElevationStatus.UNKNOWN_ERROR) {
	    		alert("DirectionsServiceで原因不明のなんらかのトラブルが発生した模様。");
	  	} else if (status == google.maps.ElevationStatus.ZERO_RESULTS) {
	    		alert("DirectionsServiceでorigin,destinationを結ぶ経路が見つかりません。");
	  	} else {
	    		alert("DirectionsService バージョンアップ？");
	  	}
		});
	});

	//リセット
	$('#reset').click(function(){
		//描写物削除
		marker.setMap(null);
		for (var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		markers = [];
		points = [];
		waypts = [];
		routeDisplay.setMap(null);
		//ログ消去
		$('#log').empty();
	});
});
