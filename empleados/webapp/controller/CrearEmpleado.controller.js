// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/library",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     * @param {typeof sap.ui.core.library} coreLibrary
	 */
    function (Controller, JSONModel, MessageBox, UploadCollectionParameter, coreLibrary) {
        "use strict";

        var ValueState = coreLibrary.ValueState;

        return Controller.extend("logaligroup.empleados.controller.CrearEmpleado", {

            onBeforeRendering: function () {

                //Variables locales de controller
                this._wizard = this.getView().byId("wizardEmpleado");
                this._oNavContainer = this.getView().byId("wizardNavContainer");
                this._modelWizard = new JSONModel({});
                this.getView().setModel(this._modelWizard);

                //Reinicializar Wizard
                var oStep1 = this._wizard.getSteps()[0];
                this._wizard.discardProgress(oStep1);
                this._wizard.goToStep(oStep1);
                oStep1.setValidated(false);

            },

            onInit: function () {

            },

            _handleNavigationToStep: function (iStepNumber) {
                var fnAfterNavigate = function () {
                    this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
                    this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);

                this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
                this._oNavContainer.back();
            },

            callPaso2: function (oEvent) {

                var step1 = this.getView().byId("step1");
                var step2 = this.getView().byId("step2");

                //Obtener valor del CustomData asociado al botón seleccionado
                var botonSeleccionado = oEvent.getSource();
                var tipoEmpleado = botonSeleccionado.data("tipoEmpleado");

                if (tipoEmpleado === "interno") {
                    this._modelWizard.setData({
                        tipo: tipoEmpleado,
                        codigoTipoEmpleado: "0",
                        salario: 24000
                    });
                } else if (tipoEmpleado === "autonomo") {
                    this._modelWizard.setData({
                        tipo: tipoEmpleado,
                        codigoTipoEmpleado: "1",
                        salario: 400
                    });
                } else {
                    this._modelWizard.setData({
                        tipo: tipoEmpleado,
                        codigoTipoEmpleado: "2",
                        salario: 70000
                    });
                }

                if (this._wizard.getCurrentStep() === step1.getId()) {
                    this._wizard.nextStep();
                } else {
                    this._wizard.goToStep(step2);
                }
            },

            handleWizardCancel: function () {
                var mensajeCancelar = this.getView().getModel("i18n").getResourceBundle().getText("mensajeCancelar");
                sap.m.MessageBox.confirm(mensajeCancelar, {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("Menu", {}, true);
                        }
                    }.bind(this)
                });
            },

            wizardCompletedHandler: function (oEvent) {

                this.validacionEmpleado(oEvent, function (isValid) {

                    //todos los datos validos -> ir a fragmento de Revisión
                    if (isValid) {

                        this._oNavContainer.to(this.getView().byId("resumen"));

                        var uploadCollection = this.getView().byId("uploadCollection");
                        var itemsArchivos = uploadCollection.getItems();
                        var contadorArchivos = uploadCollection.getItems().length;

                        this._modelWizard.setProperty("/contadorArchivos", contadorArchivos);
                        if (contadorArchivos > 0) {
                            var arrayArchivos = [];
                            for (var i in itemsArchivos) {
                                arrayArchivos.push({
                                    DocName: itemsArchivos[i].getFileName(),
                                    MimeType: itemsArchivos[i].getMimeType()
                                });
                            }
                            this._modelWizard.setProperty("/archivos", arrayArchivos);
                        } else {
                            this._modelWizard.setProperty("/archivos", []);
                        }
                        //Algun campo inválido --> se devuelve al paso 2 (único paso donde puede tener datos inválidos)
                    } else {
                        this._wizard.goToStep(this.getView().byId("step2"));
                    }
                }.bind(this));
            },

            validarDNI: function (oEvent) {

                var tipoEmpleado = this._modelWizard.getProperty("tipoEmpleado");

                if (tipoEmpleado !== "autonomo") {

                    var dni = oEvent.getParameter("value");
                    var number;
                    var letter;
                    var letterList;
                    var regularExp = /^\d{8}[a-zA-Z]$/;

                    //Se comprueba que el formato es válido
                    if (regularExp.test(dni) === true) {
                        //Número
                        number = dni.substr(0, dni.length - 1);
                        //Letra
                        letter = dni.substr(dni.length - 1, 1);
                        number = number % 23;
                        letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                        letterList = letterList.substring(number, number + 1);
                        if (letterList !== letter.toUpperCase()) {
                            this._modelWizard.setProperty("/dniState", "Error");
                        } else {
                            this._modelWizard.setProperty("/dniState", "None");
                            this.validacionEmpleado();
                        }
                    } else {
                        this._modelWizard.setProperty("/dniState", "Error");
                    }
                }
            },

            validacionEmpleado: function (oEvent, callback) {

                var valido = true;
                var oModelData = this._modelWizard.getData();

                //Nombre
                if (!oModelData.nombre) {
                    oModelData.nombreState = "Error";
                    valido = false;
                } else {
                    oModelData.nombreState = "None";
                }

                //Apellidos
                if (!oModelData.apellidos) {
                    oModelData.apellidosState = "Error";
                    valido = false;
                } else {
                    oModelData.apellidosState = "None";
                }

                //DNI
                if (!oModelData.dni) {
                    oModelData.dniState = "Error";
                    valido = false;
                } else {
                    oModelData.dniState = "None";
                }

                //Fecha Incorporación
                if (!oModelData.fechaIncorporacion) {
                    oModelData.fechaIncorporacionState = "Error";
                    valido = false;
                } else {
                    oModelData.fechaIncorporacionState = "None";
                }

                if (valido) {
                    this._wizard.validateStep(this.byId("step2"));
                } else {
                    this._wizard.invalidateStep(this.byId("step2"));
                }

                if (callback) {
                    callback(valido);
                }
            },

            editarPaso1: function (oEvent) {
                this._handleNavigationToStep.bind(this)(0);
            },

            editarPaso2: function (oEvent) {
                this._handleNavigationToStep.bind(this)(1);
            },

            editarPaso3: function (oEvent) {
                this._handleNavigationToStep.bind(this)(2);
            },

            grabarEmpleado: function () {

                var json = this.getView().getModel().getData();
                var body = {};

                //Datos para crear usuario
                body.Type = json.codigoTipoEmpleado;
                body.SapId = this.getOwnerComponent().SapId;
                body.FirstName = json.nombre;
                body.LastName = json.apellidos;
                body.Dni = json.dni;
                body.CreationDate = json.fechaIncorporacion;
                body.Comments = json.comentario;
                body.UserToSalary = [{
                    Ammount: parseFloat(json.salario).toString(),
                    Comments: json.comentario,
                    Waers: "EUR"
                }];

                this.getView().setBusy(true);
                this.getView().getModel("employeesModel").create("/Users", body, {
                    success: function (data) {
                        this.getView().setBusy(false);
                        //Se almacena el nuevo usuario
                        this.usuarioCreado = data.EmployeeId;
                        var textoNuevoEmpleado = this.getView().getModel("i18n").getResourceBundle().getText("nuevoEmpleado");
                        sap.m.MessageBox.information(textoNuevoEmpleado + ": " + this.usuarioCreado, {
                            onClose: function () {
                                var wizardNavContainer = this.getView().byId("wizardNavContainer");
                                wizardNavContainer.back();
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                oRouter.navTo("Menu", {}, true);
                            }.bind(this)
                        });
                        //Cargar Archivos
                        this.onStartUpload();
                    }.bind(this),
                    error: function () {
                        this.getView().setBusy(false);
                    }.bind(this)
                });

            },

            onFileChange: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                var oCustomerHeaderToken = new UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: this.getView().getModel("employeesModel").getSecurityToken()
                });
                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
            },

            onBeforeUploadStarts: function (oEvent) {
                var oCustomerHeaderSlug = new UploadCollectionParameter({
                    name: "slug",
                    value: this.getOwnerComponent().SapId + ";" + this.usuarioCreado + ";" + oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            },

            onStartUpload: function (oEvent) {
                var that = this;
                var oUploadCollection = that.byId("uploadCollection");
                oUploadCollection.upload();
            },

            onHandleLiveChangeTextArea: function (oEvent) {
                var oTextArea = oEvent.getSource();
                var iValueLength = oTextArea.getValue().length;
                var iMaxLength = oTextArea.getMaxLength();
                var sState = iValueLength > iMaxLength ? ValueState.Warning : ValueState.None;
                oTextArea.setValueState(sState);
            }
        });
    });