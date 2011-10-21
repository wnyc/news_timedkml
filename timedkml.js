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
        this.bg_layers = [];
        this.layers = [];
        //var osm = new OpenLayers.Layer.OSM();
        //layers.push(osm);
        var gmap;
        if (opts.map.mapping_service=='google') {
            gmap = new OpenLayers.Layer.Google("Google Streets", 
                                               {visibility: true});
            this.bg_layers.push(gmap);
        }
        this.addSequence(opts.sequence);
        this.createSlider(opts);
        // note that first layer must be visible
        this.map.addLayers(this.bg_layers);
        this.map.addLayers(this.layers);

        //this.map.addControl(new OpenLayers.Control.LayerSwitcher());
        this.map.zoomToMaxExtent();

        return this;
    },
    createSlider:function(opts) {
        var self = this;
        var slider = $('#'+opts.slider.html_id).slider({
	    'min':0, 'max':opts.sequence.length-1, 'value':0,
	    slide: function( event, ui ) {
                //hide current layer
                //show
                if (self.current_layer) {
                    self.current_layer.setVisibility(false);
                }
                self.current_layer = self.layers[ui.value];
                self.current_layer.setVisibility(true);
	    }
	});
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

