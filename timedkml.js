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
        return this;
    },
    
}

