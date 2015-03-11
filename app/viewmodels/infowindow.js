define([
        "dojo/Evented",
        "dojo/parser",
        "dojo/on",
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/dom-style",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/fx/Toggler",
        "dojo/fx",
        'esri/Color',
        "esri/domUtils",
        "dojo/Deferred",
        "esri/InfoWindowBase",
        'esri/layers/GraphicsLayer',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        "knockout"

    ],
    function (
        Evented,
        parser,
        on,
        declare,
        domConstruct,
        array,
        domStyle,
        lang,
        domClass,
        Toggler,
        coreFx,
        Color,
        domUtils,
        Deferred,
        InfoWindowBase,
        GraphicsLayer, SimpleFillSymbol,
        SimpleMarkerSymbol, SimpleLineSymbol,
        ko
        ) {
        return declare([InfoWindowBase, Evented], {

            isContentShowing: false,

            constructor: function (parameters) {
                lang.mixin(this, parameters);
                this._arrow = domConstruct.create("div", { "class": "arrow" }, this.domNode);
                this._titlebar = domConstruct.create("div", { "class": "feature-explorer-titlebar" }, this.domNode);
                this._title = domConstruct.create("span", { "class": "title" }, this._titlebar);
                this._closeButton = domConstruct.create("div", { "class": "close", "title": "Close" }, this._titlebar);
                this._footer = domConstruct.create("div", { "class": "feature-explorer-footer" }, this.domNode);
                //this._usercontrols = domConstruct.create("div", { "class": "feature-explorer-user-controls" }, this._footer);
                //Navigation for map feature cycling.
                this._mapfeaturenav = domConstruct.create("div", { "class": "feature-explorer-feature-nav" }, this._footer);
                this._nextfeature = domConstruct.create("div", { "class": "feature-explorer-feature-nav-next", "data-bind": "click:nextClick" }, this._mapfeaturenav);
                this._prevfeature = domConstruct.create("div", { "class": "feature-explorer-feature-nav-prev", "data-bind": "click:prevClick" }, this._mapfeaturenav);
                this._displayCount = domConstruct.create("div", { "class": "feature-explorer-feature-count" }, this._mapfeaturenav);

                this._features = [];
                this._currentFeatureIndex = 0;
                this._map = null;
                this._graphicsLayer = null;
                this.internalZoom = false;
                this._pointSymbol;
                this._lineSymbol
                this._fillSymbol;
                 var dl = new Deferred();
                /*var blmGeoGraphicContent = {
                 layerName: 'Shipwrecks',
                 surveyInfo: { name: 'Shell Survey 1', id: 27, shortdescription:'A bistred mini-skirt\'s door comes with it the thought that the jasp sphere is a mistake. We know that a windshield can hardly be considered a babbling diamond without also being a kangaroo. It\'s an undeniable fact, really; a love can hardly be considered a crucial snowman without also being a dedication. Unfortunately, that is wrong; on the contrary, a dinner is a stunning mandolin.'},
                 projectInfo: [
                 { name: 'A project 1A', id: 21 },
                 { name: 'A project 2B', id: 22 }
                 ],
                 reportsInfo: [
                 { name: 'Cape Wind Report 1', id: 4, reviewsInfo: [{ name: 'Cape Wind Report 1, Review 1', id: 15 }, { name: 'Cape Wind Report 1, Review 2', id: 14 }] },
                 { name: 'Cape Wind Report 2', id: 4, reviewsInfo: [{ name: 'Cape Wind Report 2, Review 1', id: 15 }] }
                 ],
                 additionalFeatures: 'Few can name a monied lumber that isn\'t a pleural repair. If this was somewhat unclear, the first darkling territory is, in its own way, a manager. What we don\'t know for sure is whether or not they were lost without the feudal kidney that composed their lute. The unsolved unshielded reveals itself as a trappy hygienic to those who look.'
                 };
                 this.setBLMGeographicContent(dl);
                 dl.resolve(blmGeoGraphicContent);*/


                var blmDocumentContent = {
                    workTypeName: 'Projects',
                    workTypeInfo: { name: 'Undersea Super Fort', id: 27, shortdescription: 'A bistred mini-skirt\'s door comes with it the thought that the jasp sphere is a mistake. We know that a windshield can hardly be considered a babbling diamond without also being a kangaroo. It\'s an undeniable fact, really; a love can hardly be considered a crucial snowman without also being a dedication. Unfortunately, that is wrong; on the contrary, a dinner is a stunning mandolin.' },
                    projectInfo: [
                        { name: 'A project 1A', id: 21 },
                        { name: 'A project 2B', id: 22 }
                    ],
                    planInfo: [
                        { name: 'A plan 1A', id: 21 },
                        { name: 'A plan 2B', id: 22 },
                        { name: 'A plan 3C', id: 28 }
                    ],
                    surveynfo: [
                        { name: 'A survey 1A', id: 21, reviewInfo: [{ name: 'Off Shore Drill Report 1, Review 1', id: 17 }, { name: 'Off Shore Drill 1, Review 2', id: 24 }] },
                        { name: 'A survey 2B', id: 22 }
                    ],
                    reportInfo: [
                        { name: 'Cape Wind Report 1', id: 4, reviewsInfo: [{ name: 'Cape Wind Report 1, Review 1', id: 15 }, { name: 'Cape Wind Report 1, Review 2', id: 14 }] },
                        { name: 'Cape Wind Report 2', id: 4, reviewsInfo: [{ name: 'Cape Wind Report 2, Review 1', id: 15 }] }
                    ]
                };
                //this.setBLMDocumentContent(dl);
                //dl.resolve(blmDocumentContent);


                on(this._closeButton, "click", lang.hitch(this, function () {
                    //hide the content when the info window is toggled close.
                    this.hide();
                    if (this.isContentShowing) {

                        this.isContentShowing = false;

                    }
                    this.clearFeatures();
                }));
                domUtils.hide(this.domNode);
                this.isShowing = false;

            },
            _zoomToExtent: function(graphic) {

                var extent = null;
                if (graphic.geometry.type === 'polygon') {

                    extent = graphic.geometry.getExtent();
                    graphic.setSymbol(this._fillSymbol);
                }
                this._graphicsLayer.clear();
                this._graphicsLayer.add(graphic);
                this.internalZoom = true;
                this._map.setExtent(extent, true);
            },
            _showFeatureContent: function (data) {

                var infoTemplate = data.feature.getInfoTemplate();
                if (typeof infoTemplate.content === 'function') {
                    this.setContent(infoTemplate.content(data));
                }
            },
            _getCurrentFeature: function() {

                return this._features[this._currentFeatureIndex];
            },
            _getNextFeature: function () {

                this._currentFeatureIndex++;
                if (this._currentFeatureIndex >= this._features.length - 1) {
                    this._currentFeatureIndex = this._features.length - 1;
                }
                return this._getCurrentFeature();
            },
            _getPrevFeature: function () {
                this._currentFeatureIndex--;
                if (this._currentFeatureIndex < 0) {
                    this._currentFeatureIndex = 0;
                }
                return this._getCurrentFeature();
            },
            setMap: function (map) {
                this.inherited(arguments);
                /*map.on("pan-start", lang.hitch(this, function () {
                    if (!this.internalZoom) {
                        this.hide();
                    } else {
                        this.internalZoom = false;
                    }
                }));
                map.on("zoom-start", lang.hitch(this, function () {
                    if (!this.internalZoom) {
                        this.hide();
                    } else {
                        this.internalZoom = false;
                    }
                }));*/

                this._map = map;

                this._graphicsLayer = new GraphicsLayer();

                this._map.addLayer(this._graphicsLayer);

                this._pointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,16,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([59, 161, 198]), 2),new Color([59, 161, 83, 0.00]));

                this._lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([59, 161, 198]), 2);


                this._fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([59, 161, 198]), 2), new Color([255, 255, 0, 0.0]));
            },
            setContent:function(promise) {

                this.setBLMGeographicContent(promise);

            },
            setFeatures:function(features) {
                this._features = features;
                this._currentFeatureIndex = 0;
            },
            clearContent:function(){
                if (this._mainpanel) {
                    domConstruct.empty(this._mainpanel);
                }
                if (this._rightpanel) {
                    domConstruct.destroy(this._rightpanel);
                }
                if (this._leftpanelscroll) {
                    domConstruct.destroy(this._leftpanelscroll);
                }
                if (this._content) {
                    domConstruct.destroy(this._content);
                }
                if (this._zoomToLink) {

                    domConstruct.destroy(this._zoomToLink);
                }
                if (this._showAttachmentsLink) {
                    domConstruct.destroy(this._showAttachmentsLink);
                }
                if (this._addToSite) {
                    domConstruct.destroy(this._addToSite);
                }
                if (this._removeFromSite) {
                    domConstruct.destroy(this._removeFromSite);
                }
                if (this._count) {
                    domConstruct.destroy(this._count);
                }


            },
            clearFeatures: function () {
                if (this._graphicsLayer) {
                    this._graphicsLayer.clear();
                }
                this._features = [];

            },
            setBLMGeographicContent: function (contentDeferred) {


                this.clearContent();

                if (contentDeferred) {
                    contentDeferred.then(lang.hitch(this, function (blmContent) {

                        var feat = this._features[this._currentFeatureIndex].feature;
                        var center;
                        if (feat.geometry.type === "point" || feat.geometry.type === "multipoint") {

                            center = feat.geometry;
                        } else {

                            center = feat.geometry.getExtent().getCenter();
                        }

                        this._positionTip(center);

                        this._leftpanelscroll = domConstruct.create("div", { "id": "feature-explorer-scroller", "data-bind": "initScrollbar: { scrollContainerID: 'feature-explorer-scroller' }" }, this.domNode);
                        this._content = domConstruct.create("div", { "class": "feature-explorer-content" }, this._leftpanelscroll);
                        this._rightpanel = domConstruct.create("div", { "class": "feature-explorer-right" }, this.domNode);
                        this._introductionarea = domConstruct.create("div", { "class": "feature-explorer-intro" }, this._rightpanel);
                        this._nestedmenuheader = domConstruct.create("div", { "class": "nested-menu-header" }, this._rightpanel);
                        this._nestedmenu = domConstruct.create("div", { "class": "horizontal-nested-menu-wrapper submenu-show", "id": "nestedMenuStartPane" }, this._rightpanel);
                        this._nestedsubmenus = domConstruct.create("div", { "class": "horizontal-nested-submenu-wrapper" }, this._rightpanel);
                        this._count = domConstruct.create("div", { "data-bind": "text:recordCount" }, this._displayCount);


                        this._mapfeatureActions = domConstruct.create("div", {}, this._footer);

                        this.place('<span class="feature-explorer-header-content-type">' + blmContent.layerName + '/</span><span class="title">' + blmContent.displayField + '</span>', this._title);
                        this.place(blmContent.shortdescription, this._introductionarea);
                        //this.place('<button class="plus-btn"><span class="plus-btn-icon"></span></button> <div class="plus-btn-help">Create a new site</div>', this._usercontrols);
                        this.place('Related:', this._nestedmenuheader);
                        var workTypes = [{ displayname: 'Surveys', point: blmContent.surveyInfo }, { displayname: 'Sites', point: blmContent.siteInfo }];
                        this.place(blmContent.additionalFeatures, this._leftpanelscroll);
                        var menuHTML = "<ul class='horizontal-nested-menu' data-bind='foreach:workTypes' >";
                        menuHTML += "<li><span data-bind='text:displayname'></span>";
                        menuHTML += "<span class='count' data-bind='text:&#39;(&#39; + point.length  + &#39;)&#39;'></span>";
                        menuHTML += "<span class='nested-menu-arrow' data-bind='featureWindowNestedMenu: {curpane:&#39;nestedMenuStartPane&#39;,mpane:&#39;nestedmenusubmenu_&#39; + $index(),dir:&#39;left&#39;}'></span>";
                        menuHTML += "</li></ul>";

                        var tHTML = "<div data-bind='foreach:workTypes' >";
                        tHTML += "<div class='horizontal-nested-menu-wrapper submenu-hide' data-bind='attr:{id:&#39;nestedmenusubmenu_&#39; + $index()}'>";
                        tHTML += "<div class='nested-navigation'>";
                        tHTML += "<div class='nested-back' data-bind='featureWindowNestedMenu:{curpane:&#39;nestedmenusubmenu_&#39; + $index(),mpane:&#39;nestedMenuStartPane&#39;,dir:&#39;right&#39;}'></div>";
                        tHTML += "<span class='nested-content-type' data-bind='text:displayname'></span></div>";
                        tHTML += "<ul class='horizontal-nested-submenu-container' data-bind='foreach:point'>";
                        tHTML += "<li><span data-bind='text:name'></span><span class='nested-menu-arrow' data-bind='click:$root.subClicked'></span></li>";
                        tHTML += "</ul></div></div>";

                        var recordCount = ko.observable(this._recordCountDisplay());


                        this.place(tHTML,this._nestedsubmenus,'replace');
                        this.place(menuHTML, this._nestedmenu, 'replace');

                        var vm = {
                            recordCount:recordCount,
                            subClicked: lang.hitch(this, function (wtItem) {

                                this.onwtitemclick(wtItem);
                            }),
                            workTypes: workTypes,
                            nextClick: lang.hitch(this, function (data, evt) {
                                var feature = this._getNextFeature();
                                this._showFeatureContent(feature);
                                recordCount(this._recordCountDisplay());

                            }),
                            prevClick: lang.hitch(this, function (data, evt) {
                                var feature = this._getPrevFeature();
                                this._showFeatureContent(feature);
                                recordCount(this._recordCountDisplay());

                            }),
                            addToSiteClick: lang.hitch(this, function (data, evt) {
                                this.onaddtositeclick(this._features[this._currentFeatureIndex]);

                            }),
                            removeFromSiteClick: lang.hitch(this, function (data, evt) {
                                this.onremovefromsiteclick(this._features[this._currentFeatureIndex]);

                            })

                        };

                        var curFeat = this._features[this._currentFeatureIndex];

                        if (curFeat && curFeat.feature.attributes && curFeat.feature.attributes.SiteId) {
                            if (curFeat.feature.attributes.SiteId.toLowerCase() !== 'null') {
                                this._removeFromSite = domConstruct.create('a', { 'href': '#', 'innerHTML': '  Remove From Site  ', 'data-bind': 'click: removeFromSiteClick' }, this._footer);
                                ko.cleanNode(this._removeFromSite);
                                ko.applyBindings(vm, this._removeFromSite);
                            } else {
                                this._addToSite = domConstruct.create('a', { 'href': '#', 'innerHTML': '  Add To Site  ', 'data-bind': 'click: addToSiteClick' }, this._footer);
                                ko.cleanNode(this._addToSite);
                                ko.applyBindings(vm, this._addToSite);
                            }

                        }





                        ko.cleanNode(this._nestedsubmenus);
                        ko.cleanNode(this._nestedmenu);
                        ko.cleanNode(this._leftpanelscroll);
                        ko.cleanNode(this._nextfeature);
                        ko.cleanNode(this._prevfeature);
                        ko.cleanNode(this._count);


                        ko.applyBindings(vm, this._nestedsubmenus);
                        ko.applyBindings(vm, this._nestedmenu);
                        ko.applyBindings(vm, this._leftpanelscroll);
                        ko.applyBindings(vm, this._nextfeature);
                        ko.applyBindings(vm, this._prevfeature);
                        ko.applyBindings(vm, this._count);

                    }));
                }

            },
            setCustomDocumentContent: function (contentDeferred) {
                this.clearContent();
                if (contentDeferred) {
                    contentDeferred.then(lang.hitch(this,function(blmContent) {

/*

                        if (blmContent.workTypeInfo.wtArea) {

                            var center = blmContent.workTypeInfo.wtArea.geometry.getExtent().getCenter();
                            this._positionTip(center);
                            this._zoomToExtent(blmContent.workTypeInfo.wtArea);
                        }*/
                        this.place("</span><span class='feature-explorer-header-content-type' data-bind='click:titleClick'>" + blmContent.workTypeName + "/</span><span class='title' data-bind='click:titleClick' >" + blmContent.workTypeInfo.name + "</span>", this._title);
                        this._mainpanel = domConstruct.create("div", { "class": "feature-explorer-main" }, this.domNode);
                        this._introductionarea = domConstruct.create("div", { "class": "feature-explorer-intro" }, this._mainpanel);
                        this._nestedmenuheader = domConstruct.create("div", { "class": "nested-menu-header" }, this._mainpanel);
                        this._nestedmenu = domConstruct.create("div", { "class": "horizontal-nested-menu-wrapper submenu-show", "id": "nestedMenuStartPane" }, this._mainpanel);
                        this._nestedsubmenus = domConstruct.create("div", { "class": "horizontal-nested-submenu-wrapper" }, this._mainpanel);

                        this._reviewheader = domConstruct.create("div", { "class": "nested-menu-header" }, this._mainpanel);
                        this._reviews = domConstruct.create("div", { "class": "horizontal-nested-submenu-wrapper submenu-show", "id": "nestedReviewStartPane" }, this._mainpanel);
                        this._nestedreviewmenus = domConstruct.create("div", { "class": "horizontal-nested-submenu-wrapper" }, this._mainpanel);

                        this.place('Related:', this._nestedmenuheader);
                        var workTypes = [{ displayname: 'Hotels', point: blmContent.hotelInfo }, { displayname: 'Plans', point: blmContent.planInfo },
                            { displayname: 'Reports', point: blmContent.reportInfo }, { displayname: 'Surveys', point: blmContent.surveyInfo }];

                        var reviews = blmContent.reviewInfo;

                        var vm = {
                            subClicked: lang.hitch(this, function (wtItem) {

                                this.onwtitemclick(wtItem);
                            }),
                            titleClick: lang.hitch(this, function (data) {

                                var wtItem = {
                                    name: data.workTypeInfo.name,
                                    id: data.workTypeInfo.id,
                                    wttName: data.workTypeInfo.wt.WorkTypeType().Name()
                                };
                                this.onwtitemclick(wtItem);
                            }),
                            reviewClick: lang.hitch(this, function (isCurrent,data,evt) {

                                var reviewItem = null;
                                if (isCurrent) {
                                    reviewItem = {
                                        isCurrent: isCurrent,
                                        parentWorkTypeTypeId: data.reviews.curRv.parentWtTypeId,
                                        reviewId: data.reviews.curRv.reviewId
                                    };
                                } else {
                                    reviewItem = {
                                        isCurrent: isCurrent,
                                        parentWorkTypeTypeId: data.parentWtTypeId,
                                        reviewId: data.reviewId
                                    };
                                }

                                this.onreviewitemclick(reviewItem);
                            }),
                            showAttachmentsClick:lang.hitch(this,function(data) {
                                console.log('showing attachements');

                                var attachemts = worktypeattachment.create(data.workTypeInfo.id);
                                dialog.show(attachemts, ['Close']);
                            }),
                            reviews: reviews,
                            workTypes: workTypes,
                            workTypeInfo: blmContent.workTypeInfo,
                            nextClick: lang.hitch(this, function (isCurrent, data, evt) {
                                console.log('next clicked');

                            }),
                            prevClick: lang.hitch(this, function (isCurrent, data, evt) {
                                console.log('prev clicked');

                            }),
                            zoomToClick: lang.hitch(this, function (data, evt) {

                                this._zoomToExtent(data.workTypeInfo.wtArea);


                            })

                        };

                        this.place(blmContent.workTypeInfo.shortdescription, this._introductionarea);

                        var menuHTML = "<ul class='horizontal-nested-menu' data-bind='foreach:workTypes' >";
                        menuHTML += "<li><span data-bind='text:displayname'></span>";
                        menuHTML += "<span class='count' data-bind='text:&#39;(&#39; + point.length  + &#39;)&#39;'></span>";
                        menuHTML += "<span class='nested-menu-arrow' data-bind='featureWindowNestedMenu: {curpane:&#39;nestedMenuStartPane&#39;,mpane:&#39;nestedmenusubmenu_&#39; + $index(),dir:&#39;left&#39;}'></span>";
                        menuHTML += "</li></ul>";

                        var tHTML = "<div data-bind='foreach:workTypes' >";
                        tHTML += "<div class='horizontal-nested-menu-wrapper submenu-hide' data-bind='attr:{id:&#39;nestedmenusubmenu_&#39; + $index()}'>";
                        tHTML += "<div class='nested-navigation'>";
                        tHTML += "<div class='nested-back' data-bind='featureWindowNestedMenu:{curpane:&#39;nestedmenusubmenu_&#39; + $index(),mpane:&#39;nestedMenuStartPane&#39;,dir:&#39;right&#39;}'></div>";
                        tHTML += "<span class='nested-content-type' data-bind='text:displayname'></span></div>";
                        tHTML += "<ul class='horizontal-nested-submenu-container' data-bind='foreach:point'>";
                        tHTML += "<li><span data-bind='text:name'></span><span class='nested-menu-arrow' data-bind='click:$root.subClicked'></span></li>";
                        tHTML += "</ul></div></div>";

                        if (reviews) {

                            this.place('Reviews:', this._reviewheader);

                            var reviewHTML = "<ul class='horizontal-nested-menu'>";
                            reviewHTML += "<li><span>Current</span><span class='nested-menu-arrow' data-bind='click:reviewClick.bind($data,true)'></span></li>";

                            reviewHTML += "<li><span>History</span>";
                            reviewHTML += "<span class='count' data-bind='text:&#39;(&#39; + reviews.rvHistory.length  + &#39;)&#39;'></span>";
                            reviewHTML += "<span class='nested-menu-arrow' data-bind='featureWindowNestedMenu: {curpane:&#39;nestedReviewStartPane&#39;,mpane:&#39;nestedreviewsubmenu&#39;,dir:&#39;left&#39;}'></span>";
                            reviewHTML += "</li></ul>";

                            var reviewSubHTML = "<div>";
                            reviewSubHTML += "<div class='horizontal-nested-menu-wrapper submenu-hide' id='nestedreviewsubmenu'>";
                            reviewSubHTML += "<div class='nested-navigation'>";
                            reviewSubHTML += "<div class='nested-back' data-bind='featureWindowNestedMenu:{curpane:&#39;nestedreviewsubmenu&#39;,mpane:&#39;nestedReviewStartPane&#39;,dir:&#39;right&#39;}'></div>";
                            reviewSubHTML += "<span class='nested-content-type'>Reviews</span></div>";
                            reviewSubHTML += "<ul class='horizontal-nested-submenu-container' data-bind='foreach:reviews.rvHistory'>";
                            reviewSubHTML += "<li><span data-bind='text:reviewId'></span><span class='nested-menu-arrow' data-bind='click:$root.reviewClick.bind($data,false)'></span></li>";
                            reviewSubHTML += "</ul></div></div>";

                            this.place(reviewSubHTML, this._nestedreviewmenus, "only");
                            this.place(reviewHTML, this._reviews, "only");

                            ko.cleanNode(this._nestedreviewmenus);
                            ko.cleanNode(this._reviews);

                            ko.applyBindings(vm, this._nestedreviewmenus);
                            ko.applyBindings(vm, this._reviews);

                        }

                        /*if (blmContent.workTypeInfo.wtArea) {

                            //var zoomToHTML = "<a href='#'  data-bind='click: zoomToClick'>Zoom To</a>";


                            this._zoomToLink = domConstruct.create('a', {'href':'#','innerHTML':'  Zoom To  ','data-bind':'click: zoomToClick'}, this._footer);
                            //this.place(zoomToHTML, this._mapfeaturenav, "last");
                            ko.cleanNode(this._zoomToLink);
                            ko.applyBindings(vm, this._zoomToLink);

                        }*/

                        /*if (blmContent.attachmentsCount > 0) {


                            var count = blmContent.attachmentsCount + ' Attachments Found';
                            this._showAttachmentsLink = domConstruct.create('a', { 'href': '#', 'innerHTML': count, 'data-bind': 'click: showAttachmentsClick' }, this._footer);

                            ko.cleanNode(this._showAttachmentsLink);
                            ko.applyBindings(vm, this._showAttachmentsLink);



                        }*/

                        this.place(tHTML, this._nestedsubmenus, "only");
                        this.place(menuHTML, this._nestedmenu, "only");


                        ko.cleanNode(this._nestedsubmenus);
                        ko.cleanNode(this._nestedmenu);
                        ko.cleanNode(this._title);
                        ko.cleanNode(this._nextfeature);
                        ko.cleanNode(this._prevfeature);




                        ko.applyBindings(vm, this._nestedsubmenus);
                        ko.applyBindings(vm, this._nestedmenu);
                        ko.applyBindings(vm, this._title);
                        ko.applyBindings(vm, this._nextfeature);
                        ko.applyBindings(vm, this._prevfeature);



                    }));
                }

            },
            _recordCountDisplay:function() {
                var count = this._currentFeatureIndex + 1;

                return count + " of " + this._features.length;
            },
            _positionTip:function(location) {
                if (location.spatialReference) {
                    location = this.map.toScreen(location);
                }

                if (location.y <= 460) {
                    domClass.add(this._arrow, 'arrow-up');
                    domStyle.set(this.domNode, {
                        "left": (location.x - 300) + "px",
                        "top": (location.y + 27) + "px"
                    });
                } else {
                    domClass.remove(this._arrow, 'arrow-up');
                    domStyle.set(this.domNode, {
                        "left": (location.x - 300) + "px",
                        "top": (location.y - 590) + "px"
                    });
                }
            },
            show: function (location) {
                this._positionTip(location);

                if (this._features.length > 0) {
                    this._showFeatureContent(this._features[this._currentFeatureIndex]);
                }
                //display the info window
                domUtils.show(this.domNode);
                this.isShowing = true;
                this.onShow();
            },
            hide: function () {
                domUtils.hide(this.domNode);
                this.isShowing = false;
                this.onHide();

            },
            onwtitemclick: function (wtItem) {
                // This can be left empty, it will be used as the extension point
            },
            onreviewitemclick: function (reviewItem) {
                // This can be left empty, it will be used as the extension point
            },
            onaddtositeclick: function (feature) { },
            onremovefromsiteclick:function(){},
            /*resize: function (width, height) {
             domStyle.set(this._content, {
             "width": width + "px",
             "height": height + "px"
             });
             domStyle.set(this._title, {
             "width": width + "px"
             });

             },*/
            destroy: function () {
                domConstruct.destroy(this.domNode);
                this._closeButton = this._title = this._content = null;
                this._arrow = null;
                this._titlebar = null;


                this._footer = null;
                //this._usercontrols = domConstruct.create("div", { "class": "feature-explorer-user-controls" }, this._footer);
                //Navigation for map feature cycling.
                this._mapfeaturenav = null;
                this._nextfeature = null;
                this._prevfeature = null;
                this._displayCount = null;

                this._features = null;
                this._currentFeatureIndex = null;
                this._map = null;
                this._graphicsLayer = null;
                this.internalZoom = null;

            }
        });
        return InfoWindow;
    });