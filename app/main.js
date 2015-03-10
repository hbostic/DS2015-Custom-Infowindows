
//needed for jQuery inject else $ no work
define.amd.jQuery = true;
require(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'jquery'],
    function (system, app, viewLocator, bindings) {
        system.debug(true);

        app.title = 'DS 2015 Custom Infowindows';

        app.configurePlugins({
            router: true,
            dialog: false
        });


        //bindings.init();
        app.start().then(function () {
            viewLocator.useConvention();
            app.setRoot('viewmodels/shell');
        });
    }
);