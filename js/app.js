// DATA

// Data about the places that are going to be marked on the map. I could use Foursquare API instead, 
// but the Foursquare database was not exactly what I needed for my project.

var castlesData = [
    {
    position: {lat: 48.7801921, lng: 18.5752308},
    address: "Zámok a okolie 1, 972 01 Bojnice",
    name: "Bojnice Castle",    
    built: "12th century",
    },
    {
    position: {lat: 48.8942036, lng: 18.0425279},
    address: "Matúšova 19, 912 50 Trenčín",
    name: "Trencin Castle",    
    built: "11th century",    
    },
    {
    position: {lat: 48.9994743, lng: 20.765323},
    address: "Žehra",
    name: "Spis Castle",    
    built: "11-12th century",    
    },
    {
    position: {lat: 49.2618338, lng: 19.3563822},
    address: "027 41 Oravský Podzámok",
    name: "Orava Castle",    
    built: "13th century",    
    },
    {
    position: {lat: 48.1421086, lng: 17.0980461},
    address: "811 06 Bratislava",
    name: "Bratislava Castle",    
    built: "9-18th century"
    },
    {
    position: {lat: 48.3917921, lng: 17.3330405},
    address: "900 89 Častá-Červený Kameň",
    name: "Cerveny Kamen Castle",    
    built: "13th century"
    },
    {
    position: {lat: 48.4596195, lng: 18.8890215},
    address: "Starozámocká 11, 969 01 Banská Štiavnica",
    name: "Banska Stiavnica Old Castle",    
    built: "12th century"
    },
    {
    position: {lat: 49.3142865, lng: 20.6951514},
    address: "Zámocká, 064 01 Stará Ľubovňa",
    name: "Lubovna Castle",    
    built: "13th century"
    },
    {
    position: {lat: 48.6581363, lng: 20.5982546},
    address: "Slánska, 049 41 Krásnohorské Podhradie",
    name: "Krasna Horka Castle",    
    built: "14th century"
    },
    {
    position: {lat: 48.3631763, lng: 17.3939408},
    address: "Budmerice 679, 900 86 Budmerice",
    name: "Budmerice Manor House",    
    built: "19th century"
    },
    {
    position: {lat: 48.5136122, lng: 17.4302588},
    address: "Zámocká, 919 04 Smolenice",
    name: "Smolenice Castle",    
    built: "14th century"
    },
    {
    position: {lat: 48.421617, lng: 18.9403777},
    address: "969 72 Svätý Anton",
    name: "Saint Anton Manor House",    
    built: "18th century"
    },
    {
    position: {lat: 48.5733715, lng: 19.1258553},
    address: "Námestie SNP 1, 960 01 Zvolen",
    name: "Zvolen Castle",    
    built: "14th century"
    },
    {
    position: {lat: 49.1745155, lng: 18.8600067},
    address: "013 24 Strečno",
    name: "Strecno Castle",    
    built: "14th century"
    },
    {
    position: {lat: 48.6993232, lng: 20.4987001},
    address: "049 21 Betliar",
    name: "Betliar Manor House",    
    built: "18th century"
    },
    {
    position: {lat: 48.4215509, lng: 18.4107414},
    address: "Parková 1, 951 93 Topoľčianky",
    name: "Topolcianky Manor House",    
    built: "15th century"
    }
];

var map;

// google maps API source url
var googleApiData = {
    url: "https://maps.googleapis.com/maps/api/js?",
    version: 3,
    apiKey: "AIzaSyDCH6ocuk5bkxpZDaSjKmyTtFmNjWb4BcQ",
    callback: "initMap"
};

var mapWidth = ko.observable($(".map-container").outerWidth());

// set map zoom according to the map width
var mapZoom = ko.computed(function() {
    if(mapWidth() < 400 && $("#search").text() !== "Search") {
        return 6
    } else if(mapWidth() < 700) {
        return 7;
    } else {
        return 8;
    } 
});

// the map data
var mapData = {
    zoom: mapZoom(),
    center: {lat: 48.75, lng: 19.5},     
    streetViewControl: false,
    mapTypeControl: false,
    zoomControl: false    
};

// wikipedia API source url
var WikiUrl = function(string) {
      return 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + string 
      + '&format=json&callback=wikiCallback';
    };

// openweathermap API source url
var weatherUrl = function(castle) {
    this.url = "http://api.openweathermap.org/data/2.5/forecast/daily?";
    this.appid = "1eac2b17c6a0ead4bc5f3bb52fa61cdd"; // API key
    this.lat = castle.position.lat;
    this.lon = castle.position.lng;
    this.mode = "json";
    this.units = "metric"; // the temperature will be displayed in °C
    this.cnt = 4; // the number of days the weather forecast will be displayed for
    this.callback = "?";
    this.url = this.url + "APPID=" + this.appid + "&lat=" + this.lat + "&lon=" + this.lon + "&mode=" 
                + this.mode + "&units=" + this.units + "&cnt=" + this.cnt + "&callback=" + this.callback;
    return this.url; 
}

// save wikipedia articles, weather forecast data and open/close state of infowindows to castlesData
castlesData.forEach(function(castle) {

    // all infowindows are closed at the begining
    castle.isOpen = false;

    // wikipedia articles
    castle.wikiUrl = WikiUrl(castle.name);
    castle.wikiList = ko.observableArray();
    castle.wikiHTML = ko.observable("<ul class='wiki-links'>");
    var wikiRequestTimeout = setTimeout(function() {
      castle.wikiList().push({title: 'Failed to get wikipedia resources.', link: null});
    }, 8000);
    
    $.ajax({
      url: castle.wikiUrl,
      dataType: "jsonp",
      jsonp: "callback",
      success: function(data) {        
        var titles = data[1];
        var links = data[3];
        for(var i=0; i<titles.length; i++) {
          var item = {title: titles[i], link: links[i]}
          castle.wikiList().push(item);             
        }
        clearTimeout(wikiRequestTimeout);
        if(castle.wikiList().length === 0) {
          castle.wikiHTML("<p>No wikipedia articles in english available.</p>");
        } else {
        castle.wikiList().forEach(function(item) {
            castle.wikiHTML(castle.wikiHTML() + "<li><a href='" + item.link + "'>" + item.title + "</a></li>");
        });
        castle.wikiHTML(castle.wikiHTML() + "</ul>");
        }                                                
      }                      
    });

    // openWeatherMap.org weather forecast 
    castle.weatherHTML = "<p style='padding-bottom:0;margin-bottom:5px'><b>Weather Forecast:</b></p><div id='" 
                            + castle.name + "-weather' style='display: flex;'>";
    castle.weatherUrl = weatherUrl(castle);
    
    
    $.getJSON(castle.weatherUrl, function(result){
          
          for(i = 0; i < result.list.length; i++) {
            
            var date = new Date();
            date.setTime(result.list[i].dt*1000);            
            var day = String(date).slice(0,3).toUpperCase();
            
            castle.weatherHTML += "<div class='weather-container' style='text-align:center;" 
                                    + "margin-right: 5px; background-color: #DCDCDC; padding: 0 7px;'>" 
                                    + "<p style='margin-bottom: 0; margin-top: 5px;'>" + day + "</p>"; 
            castle.weatherHTML += "<img class='weather-icon' src='http://openweathermap.org/img/w/" 
                                    + result.list[i].weather[0].icon + ".png' alt='weather icon'>";         
            castle.weatherHTML += "<p style='font-size:small; margin-top:0; margin-bottom: 5px;'>" 
                                    + result.list[i].temp.max + "&deg;C</p></div>";
          }                             
          castle.weatherHTML += "</div>"
          

    }).error(function(e) {
        castle.weatherHTML = "Failed to get weather forecast.";
    });

});   

// MARKER AND INFOWINDOW CONSTRUCTORS

// consturctor for marker properties
var MarkerInfo = function(name, position) {
    this.position = position;
    this.map = map;
    this.title = name;     
};

// consturctor for infowindow properties
var InfoWindowHTML = function(name, address, built, wikiHTML, weatherHTML) {    
    this.content = "<div class='iw-content'><h2 class='castle-name'>" + name + "</h2>" 
                 + "<p><b>address: </b><i>" + address + "</i></p>"
                 + "<p><b>origin: </b><i>" + built + "</i></p>"
                 + "<p style='padding-bottom:0;margin-bottom:5px'><b>wikipedia articles:</b></p>" 
                 + wikiHTML + weatherHTML + "</div>";
};

// SCREEN PROPERTIES AND MAIN ELEMENTS PROPERTIES

// get the screen width and height
var screenHeight = ko.observable(window.innerHeight); 
var screenWidth = ko.observable(window.innerWidth);

// return true if the orientation is landscape and false if it is not
var isLandscape = ko.computed(function() {
    return screenHeight() < screenWidth();
});

// for small devices - detect if the search bar is open or not
var isSearchBar = function() {
    return $(".search-form").css("display") !== "none";
};

// get heights of the main elements except map
var bodyHeight = ko.observable($("body").outerHeight());
var mapTop = ko.observable($(".header").outerHeight());
var searchHeight = ko.observable($(".search-container").outerHeight());
var footerHeight = ko.observable($(".footer").outerHeight());

// calculate map height according to the actual sizes of other elements   
var mapHeight = ko.computed(function() {
    if(isLandscape()) {
        if ($(".footer").css("display") !== "none") {
            return bodyHeight() - mapTop() - footerHeight();
        } else {
            return bodyHeight() - mapTop();
        }
        
    } else {
        return bodyHeight() - mapTop() - searchHeight();
    }        
});

// for small devices - properties that have to be updated if orientation or layout changes
var elementSettings = function() {
    bodyHeight($("body").outerHeight());        
    mapTop($(".header").outerHeight());
    searchHeight($(".search-container").outerHeight());
    footerHeight($(".footer").outerHeight());
    mapWidth($(".map-container").outerWidth());

    $(".middle").height(mapHeight());
    google.maps.event.trigger(map, "resize");
    map.setZoom(mapZoom());
     
};

// for small devices - function that shows or hides the search bar 
var showHide = function(arrowText, arrowPadding, formDisplay, searchDisplay, 
    widthORheight, searchSize, mapSize) {
    $("#search").text(arrowText);
    $("#show-hide").css("padding", arrowPadding);
    $(".search-form").css("display", formDisplay);
    $(".search-results").css("display", searchDisplay);
    $(".search-container").css(widthORheight, searchSize);
    $(".map-container").css(widthORheight, mapSize);
};

// get map center
var mapCenter = function(castlesArray) {

    var openedInfowindows = 0;
    var lat;
    var lng;
    var bodyWidth = $("body").outerWidth();
    
    castlesArray.forEach(function(castle) {
        if(castle.isOpen) {
            openedInfowindows += 1;
            lat = castle.position.lat;
            lng = castle.position.lng;
        }
    });

    if(openedInfowindows > 0) {
        if(isLandscape()) {
            if(bodyWidth < 601) {
                lat += 1;
            } else if(bodyWidth >= 601 && bodyWidth < 900) {
                lat += 1.3;
            } else {
                lat += 0.5;
            }
        } else {
            lat += 1.3;
            $(".iw-content").css("min-height", "265px");
        }
                        
    } else {
        lng = 19.5;
        lat = 48.75;
    }

    return {lat: lat, lng: lng};
}

// =======================================================================================================

// VIEWMODEL

var viewModel = function() {    
    var self = this;

    // define src for google API script element
    this.googleApiSrc = googleApiData.url + "v=" + googleApiData.version + "&key=" 
                        + googleApiData.apiKey + "&callback=" + googleApiData.callback;
    
    // create an array of castles
    this.castleList = ko.observableArray(castlesData);
    this.visibleCastles = ko.observableArray(self.castleList());
    
    this.itemIsClicked = function(castle) {
    
        // marker of the clicked item will bounce ... 
        castle.marker.setAnimation(google.maps.Animation.BOUNCE);
        // but only for 1.5 seconds,
        setTimeout(function() {
            castle.marker.setAnimation(null);
        }, 1500);
        // infowindow about this item will open above the marker
        castle.infowindow().open(map, castle.marker);
        castle.isOpen = true;
        // and any other infowindow will close if is opened
        self.visibleCastles().forEach(function(castleItem) {
            if(castleItem !== castle) {
                castleItem.infowindow().close();
                castleItem.isOpen = false;
                var element = document.getElementById(castleItem.name)
                element.style.color = "black";
                element.style.fontWeight = "normal";
            }
        });

        // change color of clicked item
        var elem = document.getElementById(castle.name);
        elem.style.color = "blue";
        elem.style.fontWeight = "bold";

        // map center equal to the clicked location
        map.panTo(castle.position);
                 
    };
    // change font to bold
    this.boldFont = function(castle) {
        var elem = document.getElementById(castle.name);
        elem.style.fontWeight = "bold";
    };
    // change font to normal
    this.normalFont = function(castle) {
        var elem = document.getElementById(castle.name);
        if(elem.style.color !== "blue") {
            elem.style.fontWeight = "normal";
        }        
    };
    // the empty array of markers
    this.markerArray = [];
    this.markerArrayC = [];
    // the empty array of infowindows
    this.infowindowArray = ko.observableArray();

    this.searchString = ko.observable("");



    // show map
    this.initMap = function() {
        // create the map 
        map = new google.maps.Map(document.getElementById('map'), mapData);

        self.searchResults().forEach(function(castle) {

            // create marker, place marker and save it to data about the castle            
            castle.marker = new google.maps.Marker(new MarkerInfo(castle.name, castle.position));
            // add marker to the array of markers
            self.markerArray.push(castle.marker);         

            // create an infowindow 
            castle.infowindow = ko.computed(function() {
                return new google.maps.InfoWindow(new InfoWindowHTML(castle.name, castle.address, castle.built, castle.wikiHTML(), castle.weatherHTML));
            });         
            
            // add infowindow to the array of infowindows
            self.infowindowArray().push(castle.infowindow());

            // infowidow visible after clicking the marker
            castle.marker.addListener('click', (function(castleCopy) {
               // when marker is clicked, these things will happen
               return function() {
                    // marker will bounce ... 
                    castleCopy.marker.setAnimation(google.maps.Animation.BOUNCE);
                    // but only for 1.5 seconds,
                    setTimeout(function() {
                        castleCopy.marker.setAnimation(null);
                    }, 1500);
                    // infowindow about this marker will open
                    castleCopy.infowindow().open(map, castleCopy.marker);
                    castleCopy.isOpen = true;
                    // and any other infowindow will close if opened
                    self.searchResults().forEach(function(castleItem) {
                        if(castleItem !== castleCopy) {
                            castleItem.infowindow().close();
                            castleItem.isOpen = false;
                            var element = document.getElementById(castleItem.name)
                            element.style.color = "black";
                            element.style.fontWeight = "normal";
                        }
                    });
               };
            })(castle));

            castle.infowindow().addListener('closeclick', (function() {
                castle.isOpen = false;
            }));
        });
        
    };

    // the results of search
    this.searchResults = ko.computed(function() {
        
        if(self.searchString() === '') {
            
            self.visibleCastles(self.castleList());
            self.markerArray.forEach(function(marker) {
                marker.setMap(map);
            });
            self.infowindowArray().forEach(function(infowindow) {
                infowindow.close();
            });
        } else {
            self.visibleCastles([]);
            self.markerArray.forEach(function(marker) {
                
                marker.setMap(null);
                
            });
            self.castleList().forEach(function(castle) {
                if(castle.name.toLowerCase().indexOf(self.searchString().toLowerCase()) >= 0) {
                    self.visibleCastles().push(castle);
                    self.markerArray.forEach(function(marker) {
                        if(castle.name === marker.title) {
                            marker.setMap(map);
                        }
                    });
                    self.infowindowArray().forEach(function(infowindow) {
                        infowindow.close();
                    });
                }
            });
        }

        return self.visibleCastles();
             
    }, this);


    // set the map height according to actual layout 
    $(".middle").height(mapHeight());

    // change settings if orientation changes
    $(window).on('resize', function() {

        screenHeight(window.innerHeight); 
        screenWidth(window.innerWidth);

        
            if(isLandscape()) {

                $(".search-container").css("height", "100%");
                $(".map-container").css("height", "100%");

                if(isSearchBar()) {
                    showHide("Hide", "10px 15px 5px 0", "block", "block", "width", "35%", "65%");
                    $("#show-hide").css({"position": "static", "top": 0, "text-align": "right", "display": "block"});
                } else {
                    showHide("Search", "0", "none", "none", "width", "7%", "93%");
                    $("#search").css({"writing-mode": "vertical-rl", "order": -1});
                    $("#show-hide").css({"position": "fixed", "top": "calc(100vh/2 - 30px)", "display": "flex", "padding": 0});
                }

            } else {

                $(".search-container").css("width", "100%");
                $(".map-container").css("width", "100%");
                $("#search").css({"writing-mode": "horizontal-tb", "order": 1});
                $("#show-hide").css("text-align", "center");

                if(isSearchBar()) {
                    showHide("", "7px 15px 0 0", "block", "block", "height", "45%", "55%");
                } else {
                    showHide("Search", "0 15px 15px 0", "none", "none", "height", "7%", "93%");
                    $("#show-hide").css({"position": "static", "display": "block"});
                } 
            }

            elementSettings();
            self.chooseArrow();
            map.setCenter(mapCenter(self.visibleCastles()));
              
    });

    // for small devices - according to orientation, decide which arrow should be displayed in the search bar
    this.chooseArrow = ko.computed(function() {
        if(isLandscape()) {
            if(isSearchBar()) {
                return "&#12298;"
            } else {
                return "&#12299;"; 
            }       
                                
        } else {
            if(isSearchBar()) {
                return "&#65086;"
            } else {
                return "&#65085;";
            } 
        }
    });
    
    // function that determines what happens if the arrow of the search bar is clicked
    this.arrowClicked = function() {
       
        if(!isSearchBar()) {
            if(isLandscape()) {
                showHide("Hide", "10px 15px 5px 0", "block", "block", "width", "35%", "65%");
                                 
                $("#search").css({"writing-mode": "horizontal-tb", "order": 1});
                $("#arrow").css("order", 0)
                $("#show-hide").css({"top": 0, "position": "static", "text-align": "right", "display": "block"});                
            } else {
                showHide("", "7px 15px 0 0", "block", "block", "height", "45%", "55%");
            }
            
            elementSettings();
            map.setCenter({lat: 48.75, lng: 19.5});

            self.visibleCastles().forEach(function(castle) {
                castle.infowindow().close();
                castle.isOpen = false;
            });                                
            
        } else {
            
            if(isLandscape()) {
                showHide("Search", "0", "none", "none", "width", "7%", "93%");
                
                $("#search").css({"writing-mode": "vertical-rl", "order": -1});
                $("#show-hide").css({"position": "fixed", "top": "calc(100vh/2 - 30px)", "display": "flex", "padding": 0});
            } else {
                showHide("Search", "0 15px 15px 0", "none", "none", "height", "7%", "93%");
            }

            elementSettings();
            map.setCenter(mapCenter(self.visibleCastles()));              
        }
        self.chooseArrow();
    };
};

ko.applyBindings(viewModel);

