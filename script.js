//Setting up var using ID's to call up in the function
var city = "";
var searchCity = $("#cityName");
var searchBtn = $("#searchBtn");
var currentDate = $("#currDate")
var clearButton = $("#clear-history"); 
var currentCity = $("#currCity");
var currentTemp = $("#temp");
var currentWindSpeed = $("#wind");
var currentHumidity = $("#humidity");
var currentUVindex = $("#uvIndex");

var weatherContent = $("#current-weather");

var APIkey = "e61ee89c8bef2648fe613f794c094ffa";

var cityList = [];

function find(c){
    for (var i=0; i<cityList.length; i++){
        if(c.toUpperCase()===cityList[i]){
            return -1;
        }
    }
    return 1;
}

function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
        
    }
}
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIkey  + "&units=metric";
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        console.log(response);
 
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        
        var date=new Date(response.dt*1000).toLocaleDateString();
        
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
      

        var tempF = (response.main.temp);
        $(currentTemp).html((tempF).toFixed(2));
        $(currentHumidity).html(response.main.humidity);

        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWindSpeed).html(windsmph);
        console.log(response.wind.speed);
        
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            cityList=JSON.parse(localStorage.getItem("cityname"));
            console.log(cityList);
            if (cityList==null){
                cityList=[];
                cityList.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(cityList));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    cityList.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(cityList));
                    addToList(city);
                }
            }
        }

    });
}

function UVIndex(ln,lt){

    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIkey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUVindex).html(response.value);

                if (response.value < 5) {
                    $("#uvIndex").attr("class", "btn btn-success");
                  } else if (response.value >= 5 && response.value <= 10) {
                    $("#uvIndex").attr("class", "btn btn-warning");
                  } else if (response.value > 10 ) {
                    $("#uvIndex").attr("class", "btn btn-danger");
                  }
            });
}

function forecast(cityid){
    var dayover= false;
    var queryforecastURL="https://api.openweathermap.org/data/2.5/forecast/?id="+cityid+"&appid="+APIkey +"&units=metric";
    $.ajax({
        url:queryforecastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=((tempK).toFixed(2));
            var humidity= response.list[((i+1)*8)-1].main.humidity;
            var wind= response.list[i].wind.speed;
           
        
        
            $("#date"+i).html(date);
            $("#img"+i).html("<img src="+iconurl+">");
            $("#temp"+i).html(tempF);
            $("#humidity"+i).html(humidity);
            $("#wind"+i).html(wind);
            
        }
        
    });
}
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}
function loadlastCity(){
    $("ul").empty();
    var cityList = JSON.parse(localStorage.getItem("cityname"));
    if(cityList!==null){
        cityList=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<cityList.length;i++){
            addToList(cityList[i]);
        }
        city=cityList[i-1];
        currentWeather(city);
    }

}
function clearHistory(event){
    event.preventDefault();
    cityListy=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}

$("#searchBtn").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);