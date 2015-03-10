/**
 * Created by Alex_Bostic_prv on 3/9/2015.
 */
define([], function () {


    var geometryService = 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer';


    //application routes
    var applicationroutes = [

        { route: '', moduleId: 'home', title: 'Home', nav: true }


    ];

    var appconfig = {

        applicationroutes: applicationroutes


    };
    return appconfig;
});