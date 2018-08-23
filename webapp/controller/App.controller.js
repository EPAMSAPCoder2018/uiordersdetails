sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/epam/uiordersdetails/util/utils",
	"com/epam/uiordersdetails/model/models"
], function (Controller, Utils, models) {
	"use strict";

	return Controller.extend("com.epam.uiordersdetails.controller.App", {
		onInit: function () {
			var that = this;
			var component = that.getOwnerComponent();
			var navigationParameter = component.getComponentData();
			var orderIds = navigationParameter && navigationParameter.startupParameters.orderId;
			if (!component.getModel()) {
				component.setModel(models.createEmptyJSONModel());
			}
			var i18n = component.getModel("i18n"); 
			$.ajax({
				type: "GET",
				data: {
					orderId: orderIds
				},
				url: "/services/getOrders",
				async: false,
				success: function (data, textStatus, jqXHR) {
					var STATUSES_MAPPING = {
						"I": {
							color: "rgb(240,255,0)",
							state: "Warning",
							description: i18n.getProperty("order.status.I")
						},
						"D": {
							color: "rgb(0,255,0)",
							state: "Success",
							description: i18n.getProperty("order.status.D")
						},
						"P": {
							color: "rgb(152,152,152)",
							state: "None",
							description: i18n.getProperty("order.status.P")
						}
					};
					data.results.forEach(function (order, i) {
						order.index = i;
						order.state = STATUSES_MAPPING[order.status];
					});
					component.getModel().setData(data);
				},
				error: function (data, textStatus, jqXHR) {
					console.log("error to post " + textStatus, jqXHR, data);
				}
			});
			this._ordersLoadingTask = Utils.createPeriodicalyTask(function () {
				$.ajax({
					type: "GET",
					data: {
						orderId: orderIds
					},
					url: "/services/getOrders",
					success: function (data, textStatus, jqXHR) {
						var STATUSES_MAPPING = {
							"I": {
								color: "rgb(240,255,0)",
								state: "Warning",
								description: i18n.getProperty("order.status.I")
							},
							"D": {
								color: "rgb(0,255,0)",
								state: "Success",
								description: i18n.getProperty("order.status.D")
							},
							"P": {
								color: "rgb(152,152,152)",
								state: "None",
								description: i18n.getProperty("order.status.P")
							}
						};
						data.results.forEach(function (order, i) {
							order.index = i;
							order.state = STATUSES_MAPPING[order.status];
						});
						component.getModel().setData(data);
					},
					error: function (data, textStatus, jqXHR) {
						console.log("error to post " + textStatus, jqXHR, data);
					}
				});
			}, 15000);
			this._ordersLoadingTask.start();
		},
		
		onExit : function(){
			this._ordersLoadingTask.stop();
		}
	});
});