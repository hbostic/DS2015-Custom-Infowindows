/**
 * Created by Alex_Bostic_prv on 3/9/2015.
 */
define([
        'knockout',
        'durandal/system',
        'plugins/router',
        'durandal/app',
        'base/appconfig'],
    function (ko, system,router, app,config) {




        var shell = {
            activate: activate,
            deactivate:deactivate
        };

        return shell;

        function activate() {


            return boot();;
        }
        function deactivate() {

        }

        function boot() {
            //log('Shell Loaded!', null, true);

            return router.makeRelative({ moduleId: 'viewmodels' }) // router will look here for viewmodels by convention
                .map(config.applicationroutes)            // Map the routes
                .buildNavigationModel() // Finds all nav routes and readies them
                .activate();            // Activate the router



        }


    });