jQuery(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});


$(document).ready(function(){

	//ここにPOSTするようのデータを格納
	var GISdata = [];

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

	//ログ取得　ajaxで使うデータを格納
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
					GISdata.push([arr[i].lat(),arr[i].lng()]);
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

	$('#sendLog').click(function(){

		$.ajax({
	    url: "http://127.0.0.1:8000/touringApp/getGIS/",
	    type: "POST",
	    contentType: "application/json; charset=utf-8",
	    datatype: "json",
	    data: GISdata,
	    success: function(data) {
	        alert("送信成功");
	    },
	    error: function() {
	        alert("失敗");
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
		GISdata = [];
		markers = [];
		points = [];
		waypts = [];
		routeDisplay.setMap(null);
		//ログ消去
		$('#log').empty();
	});
});
