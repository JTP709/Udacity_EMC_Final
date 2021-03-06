/*
Emergency Event Manager
Jonathan Prell
https://github.com/JTP709/Udacity_EMC
*/

var app = app || {};

(function(){
    // Initial emergency event data to populate the application
    app.initialEvents = [
        {
            id: 1,
            location: {lat: 39.115406, lng: -84.519266},
            casualties: 2,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 39.116187, lng: -84.519295},
            com_post: {lat: 39.115317, lng: -84.519888},
            decon: null,
            radius: 50,
            clear: false,
            edit: false
        },
        {
            id: 2,
            location: {lat: 39.098819, lng: -84.508101},
            casualties: 0,
            type: 'HAZMAT',
            ppe: 'LEVEL A',
            assembly: {lat: 39.097056, lng: -84.516201},
            com_post: {lat: 39.097418, lng: -84.512824},
            decon: {lat: 39.098173, lng: -84.512069},
            radius: 150,
            clear: false,
            edit: false
        },
        {
            id: 3,
            location: {lat: 39.094211, lng: -84.547120},
            casualties: 4,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 39.094630, lng: -84.545832},
            com_post: {lat: 39.093918, lng: -84.546667},
            decon: null,
            radius: 40,
            clear: false,
            edit: false
        },
        {
            id: 4,
            location: {lat: 39.128099, lng: -84.518025},
            casualties: 2,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 39.128297, lng: -84.519331},
            com_post: {lat: 39.128191, lng: -84.516869},
            decon: null,
            radius: 70,
            clear: true,
            edit: false
        },
        {
            id: 5,
            location: {lat: 39.143471, lng: -84.519189},
            casualties: 0,
            type: 'HAZMAT',
            ppe: 'LEVEL B',
            assembly: {lat: 39.139577, lng: -84.521002},
            com_post: {lat: 39.143008, lng: -84.520830},
            decon: {lat: 39.142659, lng: -84.519460},
            radius: 75,
            clear: false,
            edit: false
        },
        {
            id: 6,
            location: {lat: 39.157816, lng: -84.539276},
            casualties: 3,
            type: 'HAZMAT',
            ppe: 'LEVEL C',
            assembly: {lat: 39.159318, lng: -84.537273},
            com_post: {lat: 39.159348, lng: -84.538333},
            decon: {lat: 39.158895, lng: -84.538553},
            radius: 150,
            clear: true,
            edit: false
        },
        {
            id: 7,
            location: {lat: 39.129595, lng: -84.476775},
            casualties: 3,
            type: 'VEHICULAR COLLISION',
            ppe: 'LEVEL D',
            assembly: {lat: 39.129372, lng: -84.476501},
            com_post: {lat: 39.129581, lng: -84.476442},
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        },
        {
            id: 8,
            location: {lat: 39.082263, lng: -84.509830},
            casualties: 2,
            type: 'VEHICULAR COLLISION',
            ppe: 'LEVEL D',
            assembly: {lat: 39.082499, lng: -84.510762},
            com_post: null,
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        },
        {
            id: 9,
            location: {lat: 39.147961, lng: -84.466707},
            casualties: 2,
            type: 'OTHER',
            ppe: 'LEVEL D',
            assembly: null,
            com_post: null,
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        },
        {
            id: 10,
            location: {lat: 39.035782, lng: -84.453419},
            casualties: 4,
            type: 'CONFINED SPACE RESCUE',
            ppe: 'LEVEL A',
            assembly: null,
            com_post: null,
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        },
        {
            id: 11,
            location: {lat: 39.034052, lng: -84.534343},
            casualties: 4,
            type: 'VEHICULAR COLLISION',
            ppe: 'Turnout',
            assembly: null,
            com_post: null,
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        }
    ];

    // Emergency Event Types/Categories
    app.typeList = [
        {
            type: 'HAZMAT'
        },
        {
            type: 'FIRE'
        },
        {
            type: 'CONFINED SPACE RESCUE'
        },
        {
            type: 'VEHICULAR COLLISION'
        },
        {
            type: 'OTHER'
        },
    ];

    // Create a type object
    app.typeFilter = function(x) {
        this.type = x.type;
        this.selected = ko.observable(false);
    };

    // Creats an event object
    app.EventListing = function(data) {
        var self = this;

        this.id = ko.observable(data.id);
        this.location = ko.observable(data.location);
        this.casualties = ko.observable(data.casualties);
        this.type = ko.observable(data.type);
        this.ppe = ko.observable(data.ppe);
        this.assembly = ko.observable(data.assembly);
        this.com_post = ko.observable(data.com_post);
        this.decon = ko.observable(data.decon);
        this.cas_level = ko.computed(function() {
            if (this.casualties() <= 0){
                return "Zero Casualties";
            }
            if (this.casualties() === 1){
                return "Single Casualty Event";
            }
            if (this.casualties() > 1 && this.casualties() < 4){
                return "Multiple Casualty Event";
            }
            if (this.casualties() >= 4){
                return "Mass Casualty Event";
            }
        }, this);
        this.radius = ko.observable(data.radius);
        this.clear = ko.observable(data.clear);
        this.clearOption = ko.computed(function(){
            if (self.clear() === false) {
                return true;
            } else {
                return false;
            }
        });
        this.edit = ko.observable(data.edit);
        this.editOption = ko.computed(function(){
            if (self.edit() === false) {
                return true;
            } else {
                return false;
            }
        });
        this.filters = app.typeList;

        // Establish weather observables
        this.weather_main = ko.observable();
        this.weather_temp = ko.observable();
        this.weather_icon = ko.observable();

        // Determine lat and lng types before passing to API call
        var lat = function() {
            if (typeof self.location().lat === 'function') {
                return self.location().lat();
            } else {
                return self.location().lat;
            }
        };
        var lng = function() {
            if (typeof self.location().lng === 'function') {
                return self.location().lng();
            } else {
                return self.location().lng;
            }
        };

        // Get weather using Open Weather API
        var api = 'http://api.openweathermap.org/data/2.5/weather?lat='+lat()+'&lon='+lng()+'&APPID=00b1eab8137a0b1d81025d667dbb2f17&units=imperial';
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", api, true);
        xhttp.send(null);
        xhttp.addEventListener('load', function() {
            if(xhttp.status >= 200 && xhttp.status <400) {
                var results = JSON.parse(xhttp.responseText);
                // Store the values from the API results
                self.weather_main(results.weather[0].main);
                self.weather_temp(results.main.temp);
                var weather_icon = results.weather[0].icon;
                self.weather_icon('http://openweathermap.org/img/w/' + weather_icon + '.png');
            } else {
                console.log('Error in network request ' + xhttp.statusText);
                self.weather_main('Error');
                self.weather_temp('Error');
                self.weather_icon('');
            }
        });
        xhttp.onerror = function() {
            console.log('Error in network request ' + xhttp.statusText);
            self.weather_main('Error');
            self.weather_temp('Error');
            self.weather_icon('');
        };

        /*
        content: '<div id="content">'+
                    '<label><b>' + data.type + ' EVENT</b></label>' +
                    '<p> Emergency Event #' + data.id + '</p>' +
                    '<p>' + self.cas_level() + '</p>' +
                    '<div class="button_div">' +
                    '<button class="event_button info_button" onClick="app.hotzoneEffectIW('+self.id()+')">HOTZONE<br>EFFECT</button>' +
                    '</div>' +
                    '<div class="button_div">' +
                    '<button class="event_button info_button" onClick="app.changeCenterIW('+self.id()+')">GO TO</button>' +
                    '</div>' +
                    '<div id="info_right_button" class="button_div">' +
                    '<button class="event_button info_button" onClick="app.eventFilterIW('+self.id()+')">EVENT<br>CARD</button>' +
                    '</div>' +
                    '</div>',
        */
        var objID = this.id();
        function indexNum(n) {
            return n -1;
        }
        var eventID = indexNum(objID);
        var content = document.getElementById('info_window_div').innerHTML;

        // Establish marker data for each type
        var markerData = [
            {
                title: data.type + ' EVENT',
                position: data.location,
                content: content,
                type: 'primary',
                icon: 'icon/' + data.type.replace(/\s+/g, "_") + '.png',
                eventID: eventID
            },
            {
                title: 'Command Post',
                position: data.com_post,
                content: '<div id="info_window_content_sub">'+
                    '<p><b>Command Post</b></p>' +
                    '<p> Emergency Event #' + data.id + '</p>' +
                    '</div>',
                type: 'secondary',
                icon: 'icon/' + 'com_post' + '.png'
            },
            {
                title: 'Assembly Point',
                position: data.assembly,
                content: '<div id="info_window_content_sub">'+
                    '<p><b>Assembly Point</b></p>' +
                    '<p> Emergency Event #' + data.id + '</p>' +
                    '<p>Casualties: ' + data.casualties + '</p>' +
                    '</div>',
                type: 'secondary',
                icon: 'icon/' + 'assembly' + '.png'
            },
            {
                title: 'Decontamination Point',
                position: data.decon,
                content: '<div id="info_window_content_sub">'+
                    '<p><b>Decontamination Point</b></p>' +
                    '<p> Emergency Event #' + data.id + '</p>' +
                    '</div>',
                type: 'secondary',
                icon: 'icon/' + 'decon' + '.png'
            }
        ];


        // Create markers with info windows
        var markerMaker = function(data) {
            var func = this;

            // Create the marker
            this.marker = new google.maps.Marker({
                    position: data.position,

                    title: data.title,
                    animation: google.maps.Animation.DROP,
                    map: app.map,
                    visible: false,
                    icon: data.icon
            });

            // Add the info window when clicked
            this.marker.addListener('click', function(){
                var mark = this;
                app.markerType(data.type);

                app.infoWindow.open(app.map, func.marker);
                app.infoWindow.setContent(data.content);

                var objID = data.eventID;
                app.setListingID(objID);

                this.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ mark.setAnimation(null); }, 700);

                var closeClick = google.maps.event.addListener(app.map, "click", function(event) {
                    var map = app.infoWindow.getMap();
                    if (map !== null && typeof map !== "undefined") {
                        app.infoWindow.close();
                    }
                    google.maps.event.removeListener(closeClick);
                });
            });
        };

        // Create a hotzone radius
        var hotzoneMaker = function(data) {
            this.hotzone = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.4,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.075,
                map: app.map,
                center: data.location,
                radius: parseFloat(data.radius)
            });
        };

        this.markers =[];
        markerData.forEach(function(data){
            if (data.position !== null) {
                self.markers.push(new markerMaker(data));
            }
        });

        this.hotzones = [];
        self.hotzones.push(new hotzoneMaker(data));
    };

})();