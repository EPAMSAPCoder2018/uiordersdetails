sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/epam/uiordersdetails/controller/base.controller",
	'sap/m/Text',
	"com/epam/uiordersdetails/model/models"
], function (Controller, BaseController, Text, Models) {
	"use strict";

	return BaseController.extend("com.epam.uiordersdetails.controller.Detail", {
		onInit: function () {
			var i18n = this.getOwnerComponent().getModel("i18n");
			this.STATUSES_MAPPING = function () {
				return {
					GPS: {
						color: "rgb(0,255,215)",
						state: null,
						description: i18n.getProperty("detail.infoTab.stage.status.GPS")
					},
					SNOWPLOW: {
						color: "rgb(0,128,255)",
						state: null,
						description: i18n.getProperty("detail.infoTab.stage.status.SNOWPLOW")
					},
					SALT_SPREADER: {
						color: "rgb(255,0,255)",
						state: null,
						description: i18n.getProperty("detail.infoTab.stage.status.SALT_SPREADER")
					},
					BRUSH: {
						color: "rgb(255,128,0)",
						state: null,
						description: i18n.getProperty("detail.infoTab.stage.status.BRUSH")
					},
					I: {
						color: "rgb(240,255,0)",
						state: "Warning",
						description: i18n.getProperty("detail.infoTab.stage.status.I")
					},
					D: {
						color: "rgb(0,255,0)",
						state: "Success",
						description: i18n.getProperty("detail.infoTab.stage.status.D")
					},
					P: {
						color: "rgb(152,152,152)",
						state: "None",
						description: i18n.getProperty("detail.infoTab.stage.status.P")
					},
					O: {
						color: "rgb(152,152,152)",
						state: "None",
						description: i18n.getProperty("detail.infoTab.stage.status.P")
					},
					A: {
						color: null,
						state: "Success",
						description: i18n.getProperty("detail.carsTab.car.status.active")
					},
					B: {
						color: null,
						state: "Error",
						description: i18n.getProperty("detail.carsTab.car.status.broken")
					},
					N: {
						color: null,
						state: "Warning",
						description: i18n.getProperty("detail.carsTab.car.status.notAvailable")
					}
				};
			};
			this.MODELS = {
				"routesFiltersModel": Models.createRoutesFiltersModel(),
				"requestsModel": Models.createRoutesFiltersModel(),
				"technicalModel": Models.createEmptyJSONModel(),
				"orderModel": Models.createEmptyJSONModel(),
				"carModel": Models.createEmptyJSONModel()
			};
			this.MODELS.technicalModel.setProperty("/lineWidth", 6);
			this.MODELS.technicalModel.setProperty("/legendVisible", false);
			this.MODELS.technicalModel.setProperty("/selectedTab", "stages");
			this.MODELS.technicalModel.setProperty("/legend", [
				{
					color: "rgb(240,255,0)",
					state: "Warning",
					description: i18n.getProperty("detail.infoTab.stage.status.I")
				},
				{
					color: "rgb(0,255,0)",
					state: "Success",
					description: i18n.getProperty("detail.infoTab.stage.status.D")
				},
				{
					color: "rgb(152,152,152)",
					state: "None",
					description: i18n.getProperty("detail.infoTab.stage.status.P")
				},{
					color: "rgb(0,255,215)",
					state: null,
					description: i18n.getProperty("detail.infoTab.stage.status.GPS")
				},
				{
					color: "rgb(0,128,255)",
					state: null,
					description: i18n.getProperty("detail.infoTab.stage.status.SNOWPLOW")
				},
				{
					color: "rgb(255,0,255)",
					state: null,
					description: i18n.getProperty("detail.infoTab.stage.status.SALT_SPREADER")
				},
				{
					color: "rgb(255,128,0)",
					state: null,
					description: i18n.getProperty("detail.infoTab.stage.status.BRUSH")
				}
			])
			this.MODELS.orderModel.setData({
				routes: [{
					isStage: true,
					routes: []
				}, {
					isStage: true,
					routes: []
				}, {
					isSpot: true,
					spots: []
				}]
			});
			BaseController.prototype.onInit.apply(this, arguments);
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this._filters = {
				status: [new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "I"), new sap.ui.model.Filter("status", sap.ui
					.model.FilterOperator.EQ, "D"), new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "P")],
				device: [new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "BRUSH"), new sap.ui.model.Filter("status", sap.ui
						.model.FilterOperator.EQ, "SALT_SPREADER"), new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "SNOWPLOW"), new sap
					.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "GPS")
				]
			};
		},

		onAfterRendering: function () {
			BaseController.prototype.onAfterRendering.apply(this, arguments);
		},

		onExit: function () {
			this._devicesLoadingTask.stop();
			this._devicesStatisticsLoadingTask.stop();
			this._stagesLoadingTask.stop();
			this._carsLoadingTask.stop();
			this._requestsLoadingTask.stop();
		},

		onClickRoute: function (evt) {

		},

		onLegendItemClick: function (evt) {
			var context = evt.getSource().getBindingContext("orderModel");
			var data = context.getProperty();
			var colorPath = context.getPath() + "/state/color";
			var color = data.state.color;
			var colorHighlighter = function (counter, enableHighlighting) {
				if (counter < 6) {
					setTimeout(function () {
						if (enableHighlighting) {
							context.getModel().setProperty(colorPath, "RGB(51;255;255)");
						} else {
							context.getModel().setProperty(colorPath, color);
						}
						counter++;
						colorHighlighter(counter, !enableHighlighting);
					}, 600);
				}
			};
			colorHighlighter(0, true);
		},

		onFiltersChanged: function (evt) {
			var oMap = this.getMapControl();
			var oMapLegend = this.getMapLegend();
			var binding = oMap.getAggregation("vos")[0].getBinding("items");
			var key = evt.getParameters().selectedItem.getKey();
			var filters = [];
			if (key === "All") {
				filters = [
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "I"),
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "D"),
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "P")
				];
			} else {
				filters = [
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, key)
				];
			}
			this._filters.status = filters;
			binding.filter([new sap.ui.model.Filter({
				filters: filters.concat(this._filters.device),
				and: false
			})]);
			oMapLegend.getBinding("items").filter([new sap.ui.model.Filter({
				filters: filters,
				and: false
			})]);
		},

		onDevicesFiltersChanged: function (evt) {
			var oMap = this.getMapControl();
			var binding = oMap.getAggregation("vos")[1].getBinding("items");
			var key = evt.getParameters().selectedItem.getKey();
			var filters = [];
			if (key === "All") {
				filters = [
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "BRUSH"),
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "SALT_SPREADER"),
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "SNOWPLOW"),
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "GPS")
				];
			} else if (key === "NA") {
				filters = [];
			} else {
				filters = [
					new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, key)
				];
			}
			this._filters.device = filters;
			binding.filter([new sap.ui.model.Filter({
				filters: filters,
				and: false
			})]);
		},

		onZoomChanged: function (evt) {
			BaseController.prototype.onZoomChanged.apply(this, arguments);
			var zoomLevel = parseInt(evt.getParameter("zoomLevel"), 10);
			zoomLevel = zoomLevel > 15 ? zoomLevel : zoomLevel - 6;
			this.MODELS.technicalModel.setProperty("/lineWidth", zoomLevel);
		},

		vosFactoryFunction: function (sId, oContext) {
			var currentObject = oContext.getProperty();
			var routes = null;
			if (currentObject.isStage) {
				routes = new sap.ui.vbm.Routes({
					items: {
						path: "orderModel>routes",
						template: new sap.ui.vbm.Route({
							colorBorder: "rgb(255,255,255)",
							linewidth: "{= ${orderModel>lineWidth} !== undefined ? ${orderModel>lineWidth} : ${technicalModel>/lineWidth}}",
							position: "{orderModel>coordinates}",
							tooltip: "{orderModel>description}",
							end: "0",
							start: "0",
							color: "{orderModel>state/color}",
							click: [this.onClickRoute, this]
						})
					}
				});
			} else if (currentObject.isSpot) {
				routes = new sap.ui.vbm.Spots({
					items: {
						path: "orderModel>spots",
						template: new sap.ui.vbm.Spot({
							tooltip: "{= ${orderModel>carName} + ' ' + ${orderModel>carModel} + ' ' + ${orderModel>VIN}}",
							text: "{orderModel>index}",
							position: "{orderModel>coordinates}",
							state: "Error",
							contentColor: "{orderModel>state/color}",
							type: "{orderModel>state/state}"
						})
					}
				});
			}
			return routes;
		},

		// legendFactoryFunction: function (sId, oContext) {
		// 	return new sap.ui.vbm.LegendItem(sId, {
		// 		text: "{= ${i18n>stage.title} + ' ' + ${orderModel>index} + ': ' + ${orderModel>geoFromName} + '-' + ${orderModel>geoToName} }",
		// 		color: "{orderModel>state/color}",
		// 		click: [this.onLegendItemClick, this]
		// 	});
		// },
		legendFactoryFunction: function (sId, oContext) {
			return new sap.ui.vbm.LegendItem(sId, {
				text: "{technicalModel>description}",
				color: "{technicalModel>color}"
			});
		},

		onChartClick: function (evt) {
			this.MODELS.routesFiltersModel.setProperty("/selectedDeviceKey", evt.getSource().data("name"));
			this.onDevicesFiltersChanged({
				getParameters: function () {
					return {
						selectedItem: {
							getKey: function () {
								return evt.getSource().data("name");
							}
						}
					};
				}
			});
		},

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		_onObjectMatched: function (e) {
			var that = this;
			var oArgs = e.getParameter("arguments");
			var orderId = oArgs.objectId;
			var index = oArgs.index;
			if (this._carsLoadingTask) {
				this._carsLoadingTask.stop();
				delete this._carsLoadingTask;
			}
			if (this._stagesLoadingTask) {
				this._stagesLoadingTask.stop();
				delete this._stagesLoadingTask;
			}
			if (this._devicesLoadingTask) {
				this._devicesLoadingTask.stop();
				delete this._devicesLoadingTask;
			}
			if (that._requestsLoadingTask) {
				that._requestsLoadingTask.stop();
				delete that._requestsLoadingTask;
			}
			if (that._devicesStatisticsLoadingTask) {
				that._devicesStatisticsLoadingTask.stop();
				delete that._devicesStatisticsLoadingTask;
			}

			that.MODELS.orderModel.setProperty("/statistics", {});
			this._stagesLoadingTask = this.createPeriodicalyTask(function () {
				$.ajax({
					type: "GET",
					url: "/services/getStagesByOrder?orderId=" + orderId,
					// ifModified : true,
					success: function (data, textStatus, jqXHR) {
						// if(jqXHR.status === 200){
						if (data && data.results) {
							data.results.forEach(function (stage, index) {
								stage.index = index + 1;
								stage.state = that.STATUSES_MAPPING()[stage.status];
							});
							that.MODELS.orderModel.setProperty("/routes/0/routes", data.results);
						}
						// }
					},
					error: function (data, textStatus, jqXHR) {
						console.log("error to post " + textStatus, jqXHR, data);
					}
				});
			}, 15000);

			this._devicesLoadingTask = this.createPeriodicalyTask(function () {
				$.ajax({
					type: "GET",
					url: "/services/getDevicesStatisticsByOrder?orderId=" + orderId,
					// ifModified : true,
					success: function (data, textStatus, jqXHR) {
						// if(jqXHR.status === 200){
						if (data && data.results) {
							data.results.forEach(function (stage, index) {
								stage.index = index + 1;
								stage.state = that.STATUSES_MAPPING()[stage.status];
							});
							that.MODELS.orderModel.setProperty("/routes/1/routes", data.results);
						}
						// }
					},
					error: function (data, textStatus, jqXHR) {
						console.log("error to post " + textStatus, jqXHR, data);
					}
				});
			}, 13000);

			this._devicesStatisticsLoadingTask = this.createPeriodicalyTask(function () {
				$.ajax({
					type: "GET",
					url: "/services/getDevicesStatisticsByOrder?withStatistics=true&orderId=" + orderId,
					success: function (data, textStatus, jqXHR) {
						if (data && data.statistics) {
							that.MODELS.orderModel.setProperty("/statistics", data.statistics);
						}
					},
					error: function (data, textStatus, jqXHR) {
						console.log("error to post " + textStatus, jqXHR, data);
					}
				});
			}, 13000);

			this._carsLoadingTask = this.createPeriodicalyTask(function () {
				$.ajax({
					type: "GET",
					url: "/services/getCarsCurrentPositions?orderId=" + orderId,
					// ifModified: true,
					success: function (data, textStatus, jqXHR) {
						// if(jqXHR.status === 200){
						if (data && data.results) {
							data.results.forEach(function (car, index) {
								car.index = index + 1;
								car.coordinates = car.location;
								car.state = that.STATUSES_MAPPING()[car.status];
								delete car.location;
							});
							that.MODELS.carModel.setData(data);
							that.MODELS.orderModel.setProperty("/routes/2/spots", data.results);
						}
						// }
					},
					error: function (data, textStatus, jqXHR) {
						console.log("error to post " + textStatus, jqXHR, data);
					}
				});
			}, 5000);

			this._requestsLoadingTask = this.createPeriodicalyTask(function () {
				$.ajax({
					type: "GET",
					url: "/services/getCustomersRequests?orderId=" + orderId,
					// ifModified : true,
					success: function (data, textStatus, jqXHR) {
						// if(jqXHR.status === 200){
						if (data && data.result) {
							data.result.forEach(function (request, index) {
								request.index = index + 1;
								request.coordinates = request.location;
								request.state = that.STATUSES_MAPPING()[request.status];
								delete request.location;
							});
							that.MODELS.requestsModel.setData(data);
						}
						// }
					},
					error: function (data, textStatus, jqXHR) {
						console.log("error to post " + textStatus, jqXHR, data);
					}
				});
			}, 25000);
			that._carsLoadingTask.start();
			that._stagesLoadingTask.start();
			that._devicesLoadingTask.start();
			that._devicesStatisticsLoadingTask.start();
			that._requestsLoadingTask.start();
			var sObjectPath = "/results/" + index;
			this._bindView(sObjectPath);
		},

		_bindView: function (sObjectPath) {
			var oView = this.getView();
			oView.setBusy(false);
			oView.bindElement({
				path: sObjectPath,
				// parameters: {
				// 	expand: "Connections"
				// },
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oView.setBusy(true);
					},
					dataReceived: function () {
						oView.setBusy(false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oElementBinding = this.getView().getElementBinding();
			if (oElementBinding && (!oElementBinding.getBoundContext() || !oElementBinding.getBoundContext().getProperty())) {
				this.getRouter().getTargets().display("notFound");
				//this.getOwnerComponent().oListSelector.clearMasterListSelection();
			} else {
				var sPath = oElementBinding.getPath();
				this.getOwnerComponent().oListSelector.selectListItem(sPath);
			}
		},

		onNavBack: function () {
			var sPreviousHash = sap.ui.core.routing.History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var bReplace = true; //Otherwise  we go backward with a forward history
				this.getRouter().navTo("master", {}, bReplace);
			}
		},

		onCarTableCellClick: function (evt) {
			var carId = evt.getParameter("listItem").getBindingContext("carModel").getProperty("carId");
			var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "uitechnics",
					action: "Display"
				},
				params: {
					"carId": carId
				}
			});
		},

		onRequestTableCellClick: function (evt) {
			var requestId = evt.getParameter("listItem").getBindingContext("requestsModel").getProperty("id");
			var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "uirequests",
					action: "Display"
				},
				params: {
					"requestId": requestId
				}
			});
		},
	});

});