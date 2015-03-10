/**
 * Created by Alex_Bostic_prv on 3/9/2015.
 */
define(["esri/map",
    "esri/dijit/Search",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/Deferred",
    "dojo/DeferredList",
    "viewmodels/infowindow",
    "dojo/domReady!"], function (Map, Search,dom,domConstruct,Deferred,DeferredList,Infowindow) {
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

        var s = new Search({
            map: map,
            enableInfoWindow:false
        }, "search");
        s.startup();

        s.on('search-results',function(response){
            var def = new Deferred();



            var documentContent = {

                workTypeName: 'Place of Interest',
                workTypeInfo: { wt: null, name: response.results[0][0].name, id: 1, shortdescription: 'some description',wtArea:null },
                hotelInfo: [],
                planInfo: [],
                surveyInfo: [],
                reportInfo: [],
                siteInfo: [],
                reviewInfo: null,
                hasAttachments: 0
            };


            map.infoWindow.setCustomDocumentContent(def);
            map.infoWindow.show(response.results[0][0].feature.geometry);

            var dl = new DeferredList([getHotels(),getRestaurants()]).then(function(results){
                var hotels = results[0][1];
                var res = results[1][1];

                def.resolve(documentContent);
            });



            console.log(response.value);
        })
    }

    function getHotels(){
        var def = new Deferred();

        var hotels = [];



        def.resolve(hotels);

        return def;

    }

    function getRestaurants(){
        var def = new Deferred();

        var res = [];



        def.resolve(res);

        return def;

    }

    //#endregion
});