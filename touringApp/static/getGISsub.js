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

	var GISdata = [];

	//ログ取得　ajaxで使うデータを格納
	$('#getLog').click(function(){
    GISdata = [[241.11,63.22],[241.21,63.32],[241.31,63.42],[242.11,62.22],[242.31,62.32],[242.41,63.42],[243.01,64.02]];
    GISdata.push("testName");
  });

	$('#sendLog').click(function(){
		console.log(GISdata);    // [[123.11, 22.22],[123.11, 22.22],[123.11, 22.22]みたいな感じ
		$.ajax({
	    url: "http://127.0.0.1:8000/touringApp/getGIS/",
	    type: "POST",
	    contentType: "application/json; charset=utf-8",
	    datatype: "json",
	    data: JSON.stringify(GISdata),
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

		GISdata = [];
		routeDisplay.setMap(null);

	});
});
