/**
 * Created by Alex_Bostic_prv on 3/9/2015.
 */
define(["esri/map",
    "esri/dijit/Search",
    "dojo/dom",
    "dojo/dom-construct",
    "viewmodels/infowindow",
    "dojo/domReady!"], function (Map, Search,dom,domConstruct,Infowindow) {
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
        var infoWindow = new InfoWindow({
            domNode: domConstruct.create("div", { id: 'feature-explorer' }, dom.byId("map")),
        });

        var map = new Map("map", {
            basemap: "gray",
            center: [-120.435, 46.159], // lon, lat
            zoom: 7
        });

        var s = new Search({
            map: map
        }, "search");
        s.startup();
    }

    //#endregion
});