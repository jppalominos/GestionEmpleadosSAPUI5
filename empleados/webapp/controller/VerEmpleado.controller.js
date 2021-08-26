// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
	 */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("logaligroup.empleados.controller.VerEmpleado", {

            onInit: function () {

            },

            volver: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Menu", {}, true);
            },

            buscarEmpleado: function (oEvent) {

                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
				    var filter = new Filter("FirstName", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                } 

                var filter2 = new Filter("SapId", FilterOperator.EQ, "juan.palominos@gmail.com");
                aFilters.push(filter2);
                
                // update list binding
			    var oList = this.byId("listaEmpleados");
			    var oBinding = oList.getBinding("items");
			    oBinding.filter(aFilters, "Application");

            },

            seleccionEmpleado: function (oEvent) {
                this.getView().byId("splitAppEmpleado").to(this.createId("detalleEmpleado"));
                var context = oEvent.getParameter("listItem").getBindingContext("employeesModel");
                this.employeeId = context.getProperty("EmployeeId");
                this.getView().byId("detalleEmpleado").bindElement("employeesModel>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");
            },

            onChangeFiles: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: this.getView().getModel("employeesModel").getSecurityToken()
                });
                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
            },

            onBeforeUploadStart: function (oEvent) {
                var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            },

            onUploadComplete: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                oUploadCollection.getBinding("items").refresh();
            },

            onFileDeleted: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                var sPath = oEvent.getParameter("item").getBindingContext("employeesModel").getPath();
                this.getView().getModel("employeesModel").remove(sPath, {
                    success: function () {
                        oUploadCollection.getBinding("items").refresh();
                    },
                    error: function () {

                    }
                });
            },

            descargarFichero: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext("odataModel").getPath();
                window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
            },

            darDeBaja: function () {

                var mensajeEliminar = this.getView().getModel("i18n").getResourceBundle().getText("mensajeEliminar");
                var tituloEliminar = this.getView().getModel("i18n").getResourceBundle().getText("confirmar");

                sap.m.MessageBox.confirm(mensajeEliminar, {
                    title: tituloEliminar,
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            this.getView().getModel("employeesModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                                success: function (data) {
                                    var mensajeOk = this.getView().getModel("i18n").getResourceBundle().getText("eliminado");
                                    sap.m.MessageToast.show(mensajeOk);
                                    this.getView().byId("splitAppEmpleado").to(this.createId("detalleSeleccionEmpleados"));
                                }.bind(this),
                                error: function (e) {
                                    var mensajeNoOk = this.getView().getModel("i18n").getResourceBundle().getText("noOk");
                                    sap.m.MessageBox(mensajeNoOk)
                                }.bind(this)
                            });
                        }
                    }.bind(this)
                });
            },

            ascender: function () {

                if (!this.fragmentoAscender) {
                    this.fragmentoAscender = sap.ui.xmlfragment("logaligroup/empleados/fragment/Ascender", this);
                    this.getView().addDependent(this.fragmentoAscender);
                }

                this.fragmentoAscender.setModel(new sap.ui.model.json.JSONModel({}), "jsonModelAscender");
                this.fragmentoAscender.open();
            },

            ascenderEmpleado: function () {
                
                var oDataAscender = this.fragmentoAscender.getModel("jsonModelAscender").getData();
                var SapId = this.getOwnerComponent().SapId; 
                
                var body = {
                    SapId: SapId,
                    EmployeeId: this.employeeId,
                    Ammount: oDataAscender.salario,
                    CreationDate: oDataAscender.fecha,
                    Comments: oDataAscender.comentario
                };

                this.getView().getModel("employeesModel").create("/Salaries", body, {
                    success: function () {
                        var ascensoOk = this.getView().getModel("i18n").getResourceBundle().getText("ascensoOk");
                        sap.m.MessageToast.show(ascensoOk);
                        this.fragmentoAscender.close();
                    }.bind(this),
                    error: function () {
                        var ascensoNoOk = this.getView().getModel("i18n").getResourceBundle().getText("ascensoNoOk");
                        sap.m.MessageToast.show(ascensoNoOk);
                    }.bind(this)
                });
            },

            cerrarFragmentoAscender: function () {
                this.fragmentoAscender.close();
            }
        });
    });
