sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/Text',
	"com/epam/uiordersdetails/util/utils",
], function (Controller, Text, Utils) {
	"use strict";
	return Controller.extend("com.epam.uiordersdetails.controller.base", {
		onInit: function () {
			var oMap = this.getMapControl();
			var oMapConfig = {
				"MapProvider": [{
					"name": "GMAP",
					"Source": [{
						"id": "s1",
						"url": "https://mt.google.com/vt/lyrs=m&x={X}&y={Y}&z={LOD}"
					}]
				}],
				"MapLayerStacks": [{
					"name": "DEFAULT",
					"MapLayer": {
						"name": "layer1",
						"refMapProvider": "GMAP",
						"opacity": "1",
						"colBkgnd": "RGB(255,255,255)"
					}
				}]
			};
			oMap.setMapConfiguration(oMapConfig);
			oMap.setRefMapLayerStack("DEFAULT");
			if(this.MODELS){
				var modelsNames = Object.keys(this.MODELS);
				for(var i=0; i < modelsNames.length; i++){
					this.getView().setModel(this.MODELS[modelsNames[i]], modelsNames[i]);
				}
			}
		},

		onAfterRendering: function () {
		
		},

		onZoomChanged: function (evt) {
			
		},

		onExit: function () {
			
		},
		
		onHideView : function(evt){
		},

		getMapControl: function () {
			return this.getView().byId("vbi");
		},

		getMapLegend: function () {
			return this.getMapControl().getLegend();
		},

		onLegendItemClick: function (evt) {

		},

		createPeriodicalyTask: Utils.createPeriodicalyTask
	});
});