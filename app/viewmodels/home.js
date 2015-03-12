/**
 * Created by Alex_Bostic_prv on 3/9/2015.
 */
define(["esri/map",
    "esri/dijit/Search",
    "esri/InfoTemplate",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/Deferred",
    "dojo/DeferredList",
    "dojo/promise/all",
    "viewmodels/infowindow",
    "dojo/domReady!"], function (Map, Search,InfoTemplate,dom,domConstruct,Deferred,DeferredList,all,Infowindow) {
    var title = 'Home';


    var vm = {

        activate: activate,
        attached: attached

    };

    return vm;

    //#region External Methods

    function activate() {

    }

    function attached(){
        //create the custom info window specifying any input options
        var infoWindow = new Infowindow({
            domNode: domConstruct.create("div", { id: 'feature-explorer' }, dom.byId("map"))
        });

        var map = new Map("map", {
            basemap: "streets",
            center: [-120.435, 46.159], // lon, lat
            zoom: 7,
            infoWindow: infoWindow
        });

        map.infoWindow.on('itemtitleclick',function(data){
            alert('You clicked the tile ' + data.name + ' hooray!');
        });

        map.infoWindow.on('wtitemclick',function(data){
            window.open(data.site);
        });

        var s = new Search({
            map: map,
            enableInfoWindow:false
        }, "search");
        s.startup();

        s.on('search-results',function(response){



            if(response.results[0].length === 1){
                var def = new Deferred();
                var documentContent = {

                    workTypeName: 'Place of Interest',
                    workTypeInfo: { wt: null, name: response.results[0][0].name, id: 1, shortdescription: 'Things near the ' + response.results[0][0].name,wtArea:null },
                    hotelInfo: [],
                    restInfo: [],
                    parkInfo: [],
                    shopInfo: [],
                    reviewInfo: null,
                    hasAttachments: 0
                };


                map.infoWindow.setCustomDocumentContent(def);
                map.infoWindow.show(response.results[0][0].feature.geometry);

                all({
                    hotels: getHotels(),
                    res: getRestaurants(),
                    parks:getParks(),
                    shops:getShops()
                }).then(function(results){
                    var hotels = results.hotels;
                    var res = results.res;
                    var parks = results.parks;
                    var shops = results.shops;


                    documentContent.hotelInfo = hotels;
                    documentContent.resInfo = res;
                    documentContent.parkInfo = parks;
                    documentContent.shopInfo = shops;


                    def.resolve(documentContent);
                });

                //I guess Deferred List are old school, using all above, but left this here because.........idk
                /*var dl = new DeferredList([getHotels(),getRestaurants(),getParks(),getShops()]).then(function(results){
                 var hotels = results[0][1];
                 var res = results[1][1];
                 var parks = results[2][1];
                 var shops = results[3][1];


                 documentContent.hotelInfo = hotels;
                 documentContent.resInfo = res;
                 documentContent.parkInfo = parks;
                 documentContent.shopInfo = shops;


                 def.resolve(documentContent);
                 });*/
            }
            else{//set features

                for(var i=0; i < response.results[0].length; i++){
                    var template = new InfoTemplate();
                    template.setContent(getInfowindowContent);
                    response.results[0][i].feature.setInfoTemplate(template);


                }

                map.infoWindow.setFeatures(response.results[0]);
                map.infoWindow.show(response.results[0][0].feature.geometry);

            }







        })
    }

    function getHotels(){
        var def = new Deferred();

        var hotels = [{ name: 'Renaissance', lat:33.824683,lon:-116.538454,site: 'http://www.marriott.com/hotels/travel/pspbr-renaissance-palm-springs-hotel/' },
                      { name: 'Spa Casino Resort',lat:33.825499,lon:-116.542899, site: 'http://www.sparesortcasino.com/' },
                      { name: 'Hard Rock',lat:33.82213,lon:-116.545002, site: 'http://www.hardrockhotelpalmspring.com/' },
                      { name: 'Hotel California',lat:33.801557,lon:-116.54296, site: 'http://www.palmspringshotelcalifornia.com/' }];



        def.resolve(hotels);

        return def;

    }

    function getRestaurants(){
        var def = new Deferred();

        var res = [{ name: 'Margaritas',lat:33.823661,lon:-116.536392, site: 'http://www.margaritasrestaurant.net/' },
            { name: 'Chop House',lat:33.820185,lon:-116.546516, site: 'http://www.chophousepalmsprings.com/' },
            { name: 'Thai Smile', lat:33.822843,lon:-116.545337,site: 'http://www.thaismilepalmsprings.com/' },
            { name: 'Fisherman\'s Market & Grill',lat:33.820515,lon:-116.54582 , site: 'https://www.fishermans.com/' }];



        def.resolve(res);

        return def;

    }

    function getParks(){
        var def = new Deferred();

        var res = [{ name: 'Sunrise Park',lat:33.816973,lon:-116.526332, site: 'http://palmspringsca.gov/index.aspx?page=80' },
            { name: 'Baristo Park',lat:33.818625,lon:-116.542768, site: 'http://palmspringsca.gov/index.aspx?page=80' },
            { name: 'Ruth Hardy Park', lat:33.834999,lon:-116.53813,site: 'http://palmspringsca.gov/index.aspx?page=80' },
            { name: 'Palm Springs Dog Park' ,lat:33.824731,lon:-116.512392, site: 'http://palmspringsca.gov/index.aspx?page=80' },
            { name: 'Palm Springs Skate Park' ,lat:33.81634,lon:-116.524041, site: 'http://palmspringsca.gov/index.aspx?page=80' }];



        def.resolve(res);

        return def;

    }

    function getShops(){
        var def = new Deferred();

        var res = [{ name: 'My Little Flower Shop',lat:33.834704,lon:-116.547054, site: 'http://www.mylittleflowershop.com/' },
            { name: 'Dazzles',lat:33.836693,lon:-116.547251, site: null },
            { name: 'Just Fabulous',lat:33.830462,lon:-116.547057, site: 'http://www.bjustfabulous.com/' }];



        def.resolve(res);

        return def;

    }

    function getReviews(){
        var def = new Deferred();

        var res = [{ reviewId: 'Good Acoustics'},
            { reviewId: '1.5M Sq ft' },
            { reviewId: 'Cold' },{ reviewId: 'Not enough bathrooms' }];



        def.resolve(res);

        return def;

    }

    function getInfowindowContent(data){
        var def = new Deferred();

        var documentContent = {

            workTypeName: 'Place of Interest',
            workTypeInfo: { wt: null, name: data.name, id: 1, shortdescription: 'Things near the ' + data.name,wtArea:null },
            hotelInfo: [],
            restInfo: [],
            parkInfo: [],
            shopInfo: [],
            reviewInfo: null,
            hasAttachments: 0
        };




        all({
            hotels: getHotels(),
            res: getRestaurants(),
            parks:getParks(),
            shops:getShops()
        }).then(function(results) {
            var hotels = results.hotels;
            var res = results.res;
            var parks = results.parks;
            var shops = results.shops;


            documentContent.hotelInfo = hotels;
            documentContent.resInfo = res;
            documentContent.parkInfo = parks;
            documentContent.shopInfo = shops;


            def.resolve(documentContent);
        });

        return def;

    }

    //#endregion
});