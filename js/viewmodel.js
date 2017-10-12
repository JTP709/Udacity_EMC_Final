var app = app || {};

(function() {
    app.ViewModel = function() {
        var self = this;

        /*
        Navigation Bar Function
        */

        var new_tab = document.getElementById('new_tab');
        var map_tab = document.getElementById('map_tab');
        new_tab.style.display = 'none';
        this.nav = function(z) {
            self.newEventMsg(false);
            self.errorForm(false);
            var x = new_tab;
            var y = map_tab;
            if (z === 'new_tab') {
                x.style.display = 'block';
                y.style.display = 'none';
            };
            if (z === 'map_tab') {
                x.style.display = 'none';
                y.style.display = 'block';
            };
        };

        // Resets the map to overview of Cincinnati
        this.reset = function() {
            app.map.setCenter({lat: 39.106171, lng: -84.515712});
            app.map.setZoom(10);
        };

        /*
        Initial Setup and basic functions
        */

        // Create an observable array and populate with Emergency Events
        this.initialList = ko.observableArray([]);
        app.initialEmergency.forEach(function(item){
            self.initialList.push(new app.EventListing(item));
        });

        // Flash message hidden initially
        this.newEventMsg = ko.observable(false);
        this.errorForm = ko.observable(false);
        this.errorHotzonePreview = ko.observable(false);

        // Highlight a marker when hovering over list div element
        this.highlightedIcon = app.makeMarkerIcon('FFFF24');
        this.defaultIcon = app.makeMarkerIcon('ff0000');
        this.highlightMarker = function(data) {
            this.markers[0].marker.setIcon(self.highlightedIcon);
        };
        this.defaultMarker = function(data) {
            this.markers[0].marker.setIcon(self.defaultIcon);
        }

        // Center and Zoom on selected Emergency Event
        this.changeCenter = function(data) {
            app.map.setCenter(data.location());
            app.map.setZoom(17);
        };

        // Sets Emergency Event to "all clear" and removes from active list
        this.allClear = function(data) {
            this.clear(true);
        };

        /*
        Filter Function
        */

        // Create an array of filters
        this.checkbox = function(x) {
            this.type = x;
            this.selected = ko.observable(false);
        };
        this.filters = [
            new this.checkbox('HAZMAT'),
            new this.checkbox('FIRE'),
            new this.checkbox('CONFINED SPACE RESCUE'),
            new this.checkbox('VEHICULAR COLLISION'),
            new this.checkbox('OTHER')
        ];

        // Variable to check if old events are filtered; false indicates unchecked/unselected
        this.clearEvents = ko.observable(false);

        // Fliter the list based on filter check boxes
        this.filteredList = ko.computed(function(){
            var selectedEvents = ko.utils.arrayFilter(self.filters, function(p){
                return p.selected();
            });
            // Set all markers to invisible
            self.initialList().forEach(function(mark){
                mark.markers.forEach(function(marks){
                    marks.marker.setVisible(false);
                });
                mark.hotzones.forEach(function(marks){
                    marks.hotzone.setVisible(false);
                });
            });
            // Return the entire list of no checkboxes are checked
            if (selectedEvents.length == 0) {
                var x = ko.utils.arrayFilter(self.initialList(), function(item){
                    return item.clear() == self.clearEvents()
                });
                return x;
            } else {
                var x = ko.utils.arrayFilter(self.initialList(), function(item){
                    return ko.utils.arrayFilter(selectedEvents, function(p) {
                        return p.type == item.type() && item.clear() == self.clearEvents()
                    }).length > 0;
                });
                return x;
            };
        });

        // Filter the markers based on the filtered list
        this.filteredMarkers = ko.computed(function(){
            // Get the filtered list
            this.filteredList = self.filteredList()
            // Set only the filtered markers to visible
            this.filteredList.forEach(function(mark){
                var zoom = app.map.getZoom();
                if (zoom >= 14) {
                    // Set all markers to visible if zoomed in
                    mark.markers.forEach(function(marks){
                        marks.marker.setVisible(true);
                    });
                    mark.hotzones.forEach(function(marks){
                        marks.hotzone.setVisible(true);
                    });
                } else {
                    // Only set even marker to visible if zoomed out
                    mark.markers[0].marker.setVisible(true);
                };
                // Add google maps listener to change visiblity based on zoom level
                google.maps.event.addListener(app.map, 'zoom_changed', function() {
                    var zoom = app.map.getZoom();
                    // If there is more than one marker set for the event, set those to show only when zoomed in
                    if (mark.markers.length > 1) {
                        for (i=1; i < mark.markers.length; i++) {
                            mark.markers[i].marker.setVisible(zoom >= 14);
                        };
                    };
                    // If there is a hotzone set for the event, set those to show only when zoomed in
                    if (mark.hotzones.length >0) {
                        for (i=0; i < mark.hotzones.length; i++) {
                            mark.hotzones[i].hotzone.setVisible(zoom >= 14);
                        };
                    };
                });
            });
        })

        /*
        Create a new Emergency Event
        */
        
        // Set observables for marker lat-long data
        this.tempLocMarker = ko.observable(null);
        this.tempAssemblyMarker = ko.observable(null);
        this.tempComPostMarker = ko.observable(null);
        this.tempDeconMarker = ko.observable(null);

        // Set empty arrays for temp markers and temp hotzones
        this.tempHotzones = [];
        this.tempMarkers = [];

        // Number Dropdown for New Emergency Event menu
        var $select = $(".numDropDownMenu");
        for (i=0;i<=500;i++){
            $select.append($('<option></option>').val(i).html(i))
        };

        // Create a new event
        this.newEvent = function(){
            // Check to make sure the form is filled out
            var typeCheck = document.querySelector('input[name = "type"]:checked');
            var ppeCheck = document.querySelector('input[name = "ppe"]:checked');
            /*
            var locCheck = self.tempLocMarker();
            || locCheck == null
            */
            if (typeCheck == null || ppeCheck == null || self.tempLocMarker() == null){
                self.errorForm(true);
                self.newEventMsg(false);
            } else {
                // Counts current number of events in the list
                var event_num = self.initialList().length;

                // Pull the data from the form input
                this.id = event_num + 1;
                this.location = self.tempLocMarker();
                this.cas = document.getElementById("new_cas").value;
                this.rad = document.getElementById("new_rad").value;
                this.type = document.querySelector('input[name = "type"]:checked').value;
                this.ppe = document.querySelector('input[name = "ppe"]:checked').value;
                this.assembly = self.tempAssemblyMarker();
                this.com_post = self.tempComPostMarker();
                this.decon = self.tempDeconMarker();
                
                // Populate a new array with the data
                this.newData = [
                    {
                        id: this.id,
                        location: this.location,
                        casualties: this.cas,
                        type: this.type,
                        ppe: this.ppe,
                        assembly: this.assembly,
                        com_post: this.com_post,
                        decon: this.decon,
                        radius: this.rad,
                        clear: false
                    }
                ];

                // Add the data to our model
                this.newData.forEach(function(item){
                    self.initialList.push(new app.EventListing(item));
                });

                // Show the flash message indicating a new event was added
                self.newEventMsg(true);

                // Reset the temp marker observables and array
                this.tempLocMarker = ko.observable(null);
                this.tempAssemblyMarker = ko.observable(null);
                this.tempComPostMarker = ko.observable(null);
                this.tempDeconMarker = ko.observable(null);
                for (var i = 0; i < self.tempMarkers.length; i++) {
                  self.tempMarkers[i].setMap(null);
                };
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                };
                self.tempMarkers = [];
                self.tempHotzones = [];

                // Reset the form
                this.cas_reset = document.getElementById("new_cas");
                this.rad_reset = document.getElementById("new_rad");
                this.type_reset = document.querySelector('input[name = "type"]:checked');
                this.ppe_reset = document.querySelector('input[name = "ppe"]:checked');
                this.type_reset.checked = false;
                this.ppe_reset.checked = false;
                this.cas_reset.selectedIndex = 0;
                this.rad_reset.selectedIndex = 0;
                self.errorForm(false);
                this.errorHotzonePreview(false);
            };
        };

        // Creats a temporary marker and captures lat-long data for later
        this.tempMarkerButton = ko.observable();
        this.newTempMarker = function(x){
            var func = this;
            self.tempMarkerButton(x);
            this.clicker = google.maps.event.addListener(app.map,'click', function(event){
                self.placeMarker(event.latLng);
                if (self.tempMarkerButton() == 'location') {
                    self.tempLocMarker(event.latLng);
                };
                if (self.tempMarkerButton() == 'assembly') {
                    self.tempAssemblyMarker(event.latLng);
                };
                if (self.tempMarkerButton() == 'com_post') {
                    self.tempComPostMarker(event.latLng);
                };
                if (self.tempMarkerButton() == 'decon') {
                    self.tempDeconMarker(event.latLng);
                };
                google.maps.event.removeListener(func.clicker);
            });
        };

        // Creats a temporary hotzone and captures lat-long data for later
        this.newHotzone = function(){
            if (self.tempLocMarker() == null) {
                this.errorHotzonePreview(true);
            } else {
                var func = this;
                // Remove previous Hotzone previews
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                };
                self.tempHotzones = [];
                // Establish radius and center
                var radius = parseFloat(document.getElementById('new_rad').value);
                var center = self.tempLocMarker();
                // Create the new hotzone preview
                this.hotzone = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.4,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.075,
                    map: app.map,
                    center: center,
                    radius: radius
                });
                // Push the temp hotzone to the array
                self.tempHotzones.push(this.hotzone);
                // Remove the error message
                self.errorHotzonePreview(false);
            };
        };
        
        // Creats a temporary marker
        this.placeMarker = function(location) {
            this.marker = new google.maps.Marker({
                position: location,
                map: app.map
            });
            self.tempMarkers.push(this.marker);
        };

        // Reset Map after markers have been placed
        this.reset();
    };
})();