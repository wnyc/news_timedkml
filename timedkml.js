/* new TimedKML().init({
      map:{ center:{lat:90,lng:90}, zoom:7 },
      sequence:[
        {kml:'samples/1.kml',label:'1/1/11'},
        {kml:'samples/2.kml',label:'1/2/11'},
        {kml:'samples/3.kml',label:'1/3/11'}
      ]
    });
http://maps.google.com/maps/ms?msid=213867976129542294923.0004afaf419d3f7e22e86&msa=0&ll=48.864715,-116.191406&spn=27.590947,62.929688
*/

function TimedKML(){}
TimedKML.prototype = {
    init:function(opts) {
        this.opts = opts;

        this.map = new OpenLayers.Map({
            div: opts.map.html_id,
            allOverlays: true,
//projection: new OpenLayers.Projection("EPSG:900913"),
  displayProjection: new OpenLayers.Projection("EPSG:4326")
        });
        this.layers = [];
        //var osm = new OpenLayers.Layer.OSM();
        //layers.push(osm);
        var gmap;
        if (opts.map.mapping_service=='google') {
            this.bg_layer = new OpenLayers.Layer.Google(
                "Google Streets", 
                {visibility: true
                });
        }

        this.addSequence(opts.sequence);
        this.createSlider(opts);
        // note that first layer must be visible
        this.map.addLayers([this.bg_layer]);
        this.map.addLayers(this.layers);

        //this.map.addControl(new OpenLayers.Control.LayerSwitcher());
	this.map.addControl(new OpenLayers.Control.MousePosition());

        var center = opts.map.center;
        if (center) {
            this.setCenterLonLat(center.lon,center.lat,opts.map.zoom);
        }

        this.next(0);
        return this;
    },
    setCenterLonLat:function(lon,lat,zoom) {
        //http://docs.openlayers.org/library/spherical_mercator.html
        var proj = new OpenLayers.Projection("EPSG:4326");
        var point = new OpenLayers.LonLat(lon, lat);
        var tp = point.transform(proj, this.map.getProjectionObject());
        this.map.setCenter(tp,zoom);
    },
    play:function(reset,speed) {
        var self = this;
        this.keep_playing = true;
        speed = speed || 1000;
        var start = (reset) ? -1 : this.cur_index;
        var timedNext = function() {
            if (self.keep_playing && start<self.layers.length-1) {
                self.next(++start);
                setTimeout(timedNext,speed);
            }
        }
        timedNext();
    },
    next:function(ind) {
        ind = ind || 0;
        if (this.current_layer) {
            this.current_layer.setVisibility(false);
        }
        this.cur_index = ind;
        this.current_layer = this.layers[ind];
        this.current_layer.setVisibility(true);
        this.slider.slider('value',ind);
    },
    createSlider:function(opts) {
        var self = this;
        this.slider = $('#'+opts.slider.html_id).slider({
	    'min':0, 'max':opts.sequence.length-1, 'value':0,
	    slide: function( event, ui ) {
                self.keep_playing = false;
                self.next(ui.value);
	    }
	});
        if (opts.slider.play_button_id) {
            $('#'+opts.slider.play_button_id).click(function() {
                self.play(true);
            });
        }
    },
    addSequence:function(seq) {
        for (var i=0,l=seq.length;i<l;i++) {
            var layer = new OpenLayers.Layer.Vector("KML", {
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: seq[i].kml,
                    format: new OpenLayers.Format.KML({
                        extractStyles: true, 
                        extractAttributes: true,
                        maxDepth: 2
                    })
                }),
                visibility:false
            });
            this.layers.push(layer);
        }
    }
}

