/* new TimedKML().init({
      map:{ center:{lat:90,lng:90}, zoom:7 },
      sequence:[
        {kml:'samples/1.kml',label:'1/1/11'},
        {kml:'samples/2.kml',label:'1/2/11'},
        {kml:'samples/3.kml',label:'1/3/11'}
      ]
    });
*/

function TimedKML(){}
TimedKML.prototype = {
    init:function(opts) {
        this.opts = opts;

        this.map = new OpenLayers.Map({
            div: opts.map.html_id,
            allOverlays: true
        });
        this.layers = [];
        //var osm = new OpenLayers.Layer.OSM();
        //layers.push(osm);
        var gmap;
        if (opts.map.mapping_service=='google') {
            this.bg_layer = new OpenLayers.Layer.Google("Google Streets", 
                                               {visibility: true});
        }
        this.addSequence(opts.sequence);
        this.createSlider(opts);
        // note that first layer must be visible
        this.map.addLayers([this.bg_layer]);
        this.map.addLayers(this.layers);

        //this.map.addControl(new OpenLayers.Control.LayerSwitcher());
        //this.map.zoomToMaxExtent();
        var center = opts.map.center;
        if (center) {
            console.log(center);
            this.map.setCenter(new OpenLayers.LonLat(center.lon, center.lat), 
                               opts.map.zoom );
        }
        this.next(0);
        return this;
    },
    play:function(reset,speed) {
        var self = this;
        this.keep_playing = true;
        speed = speed || 1000;
        var start = (reset) ? -1 : this.cur_index;
        var timedNext = function() {
            console.log(start);
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

