sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        return Controller.extend("logaligroup.empleados.controller.Menu", {

            onInit: function () {

            },

            onAfterRendering: function(){
			    var genericTileFirmarPedido = this.byId("linkFirmarPedido");
		        var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
		        jQuery("#"+idGenericTileFirmarPedido)[0].id = "";
	        },

            fCrearEmpleado: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CrearEmpleado", {
                });
            },

            fVerEmpleado: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("VerEmpleados", {
                });
            }
        });
    });