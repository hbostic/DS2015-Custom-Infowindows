/**
 * Created by Alex_Bostic_prv on 3/9/2015.
 */
var dojoConfig = {
    baseUrl: './',
    async: true,
    tlmSiblingOfDojo: true,
    parseOnLoad: false,
    aliases: [['text', 'dojo/text']],
    packages: [
        { name: 'esri', location: '//js.arcgis.com/3.13/esri' },
        { name: 'dojo', location: '//js.arcgis.com/3.13/dojo' },
        { name: 'dojox', location: '//js.arcgis.com/3.13/dojox' },
        { name: 'dijit', location: '//js.arcgis.com/3.13/dijit' },
        { name: 'base', location: 'app' },
        { name: 'views', location: 'app/views' },
        { name: 'viewmodels', location: 'app/viewmodels' },
        { name: 'services', location: 'app/services' },
        { name: 'model', location: 'app/model' },
        { name: 'durandal', location: 'bower_components/durandal/js' },
        { name: 'plugins', location: 'bower_components/durandal/js/plugins' },
        { name: 'transitions', location: 'bower_components/durandal/js/transitions' },
        { name: 'knockout', location: 'bower_components/knockout.js', main: 'knockout' },
        { name: 'jquery', location: 'bower_components/jquery', main: 'jquery.min' }
    ]
};
