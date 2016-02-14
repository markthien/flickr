var bodyParser = require('body-parser'),
express = require("express"), 
app = express(),
Flickr = require("flickrapi"),
flickrOptions = {
  api_key: "e91a75d196042a2c25c368e17bf99cdd",
  secret: "562973a98fdb6fd0"
},flickr,
port=8009;
    
Flickr.tokenOnly(flickrOptions, function(error, _flickr) {
    
    if(!error) {
        
        flickr = _flickr;
        
        console.log('Flickr initialized');
        
    } else {

        console.dir(error);

        process.exit(1);

    }
    
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
	next();
};

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var server = app.listen(port, function () {

  console.log('Photos app listening at port %s', port);
  
});

app.post("/search-photo", function (req, res) {
    
    var searchText = req.body.searchText;

    flickr.photos.search({
        api_key:flickrOptions.api_key,
        text:searchText,
        page: 1,
        per_page: 10
    }, function(err, result) {

        if(!err) {

            var arr = [];

            for(var i=0;i<result.photos.photo.length;i++){

                arr.push(
                    getPhotoUrl(result.photos.photo[i].farm, 
                                result.photos.photo[i].server,
                                result.photos.photo[i].id,
                                result.photos.photo[i].secret)
                );

            }

            res.jsonp({status:200,object:arr});

        } else {
            
            console.log('Error : ');
            console.dir(err);

            res.jsonp({status:400,msg:err});

        }

    });      
    

});

app.get("/get-public-feed", function (req, res) {
    
    flickr.photos.getRecent({
        api_key:flickrOptions.api_key,
        page: 1,
        per_page: 10
    }, function(err, result) {

        if(!err) {

            var arr = [];

            for(var i=0;i<result.photos.photo.length;i++){

                arr.push(
                    getPhotoUrl(result.photos.photo[i].farm, 
                                result.photos.photo[i].server,
                                result.photos.photo[i].id,
                                result.photos.photo[i].secret)
                );

            }
            
            res.jsonp({status:200,object:arr});

        } else {
            
            console.log('Error : ');
            console.dir(err);

            res.jsonp({status:400,msg:err});

        }

    });   
    
});

function getPhotoUrl(farm, server, id, secret) {
    
    var url = 'https://farm';
    url = url + farm;
    url = url + '.staticflickr.com/';
    url = url + server;
    url = url + '/';
    url = url + id;
    url = url + '_';
    url = url + secret;
    url = url + '.jpg';
    
    return url;
    
}
