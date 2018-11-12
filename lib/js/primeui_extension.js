//Growl
(function ($) {
    var growl = $('#growl');
    var errorDialog = $('#errorDialog');
    var errorDialogContent = $('#errorDialogContent');
    function defineGrowl() {
        if (growl.length == 0) {
            growl = $('<div id="growl">');
            $('body').append(growl);
            growl.puigrowl();
        }
    }

    function defineErrorDialog() {
        if (errorDialog.length == 0) {
            errorDialog = $('<div id="errorDialog" title="...">');
            errorDialogContent = $('<div id="errorDialogContent">');
            errorDialog.appendTo('body');
            errorDialogContent.appendTo(errorDialog);
            errorDialog.puidialog({
                showEffect: 'fade',
                hideEffect: 'fade',
                minimizable: false,
                maximizable: false,
                closable: true,
                modal: true,
                buttons: [{
                    text: 'Ok',
                    icon: 'ui-icon-check',
                    click: function () {
                        errorDialog.puidialog('hide');
                    }
                }]
            });
        }
    }

    $.toast = $.toast || {};
    $.extend($.toast, {
        success: function () {
            defineGrowl();
            growl.puigrowl('show', [{ severity: 'success', summary: 'Success', detail: 'Operation success!' }]);
        },
        warn: function (title, message) {
            defineGrowl();
            growl.puigrowl('show', [{ severity: 'warn', summary: title, detail: message }]);
        },
        ExceptionMessage: function (response) {
            defineGrowl();
            if(response.responseJSON.ExceptionMessage != null)
                growl.puigrowl('show', [{ severity: 'error', summary: "Error!", detail: response.responseJSON.ExceptionMessage }]);
            else
                growl.puigrowl('show', [{ severity: 'error', summary: "Error!", detail: response.responseJSON.Message }]);
        },
        info: function (title, message) {
            defineGrowl();
            growl.puigrowl('show', [{ severity: 'info', summary: title, detail: message }]);
        },
        error: function (title, message) {
            defineGrowl();
            growl.puigrowl('show', [{ severity: 'error', summary: title, detail: message }]);
        },
        failure: function (message) {
            defineGrowl();
            growl.puigrowl('show', [{ severity: 'error', summary: 'Erro', detail: message }]);
        },
        errors: function (response) {
            defineGrowl();
            var res = response.responseJSON;
            var message = "";

            if (res && res.ModelState) {
                for (var key in res.ModelState) {
                    var s = res.ModelState[key];
                    message += s;
                }
            }

            growl.puigrowl('show', [{ severity: 'error', summary: 'Erro', detail: message }]);
        },
        displayErrors: function (response) {
            defineErrorDialog();
            errorDialogContent.empty();
            var res = response.responseJSON;
            var container = $('<p class="alert alert-danger">');
            if (res && res.ModelState) {
                for (var key in res.ModelState) {
                    var s = res.ModelState[key];
                    container.append(s);
                    container.append('<br/>');
                }
            }
            errorDialogContent.append(container);
            errorDialog.puidialog('show');

        },
    });
}(jQuery));

$(function () {
    /**
    Extensão para atualização da instância do paginador
    */
    $.widget("primeui.puipaginator", $.primeui.puipaginator, {
        updateInstance: function () {
            var newPageCount = this.getPageCount(),
            pageLinksElement = this.paginatorElements['{PageLinks}'].children(),
            oldPageCount = pageLinksElement.length;
            if (newPageCount !== oldPageCount) {
                this.options.page = this.options.page < newPageCount ? this.options.page : (newPageCount - 1);
                this.element.empty();
                this.element.removeClass('pui-paginator ui-widget-header');
                this._create();
            }
        }
    });
    /**
    Extensão para a atualização da fonte de dados
    do datatable
    */
    $.widget("primeui.puidatatable", $.primeui.puidatatable, {
        updateDataSource: function (dataSource) {
            $(this.element).empty();
            this._create();
            this._updateDatasource(dataSource);
        }
    });
    /**
    Extensão para a atualização do valor do spinner
    */
    $.widget('primeui.puispinner', $.primeui.puispinner, {
        updateInstance: function () {
            this._updateValue();
        }
    });
});

/**
 * Constrói um puidatatable
 * @param elementId from jquery selector
 * @param columns array of columns
 * @param initialDataSource
 */
function puidatatable(elementId, columns, datasource) {
    var _this = this;
    var _columns = columns;
    var element = $(elementId);
    var dataSource = datasource;
    var _selectionMode = 'single';
    if (!dataSource)
        dataSource = [];
    /**
    @param datasource Fonte de dados em forma de json array
    */
    this.updateDataSourceDraggable = function (dataSource) {
        element.puidatatable({
            columns: _columns,
            scrollable: true,
            scrollHeight: '300',
            datasource: dataSource,
            draggableRows: true,
            selectionMode: _selectionMode,
            rowSelect: function (e, data) {
                element.trigger('rowSelect', data);
            }
        });
        element.puidatatable('updateDataSource', dataSource);
        element.trigger('updateDataSource', dataSource);
    }
    this.updateDataSource = function (dataSource) {
        element.puidatatable({
            columns: _columns,

            datasource: dataSource,
            selectionMode: _selectionMode,
            rowSelect: function (e, data) {
                element.trigger('rowSelect', data);
            }
        });
        element.puidatatable('updateDataSource', dataSource);
        element.trigger('updateDataSource', dataSource);
    }

    /**
     * @param selectionMode: single, multiple
     */
    this.setSelectionMode = function (selectionMode) {
        _selectionMode = selectionMode;
    }

    /**
    Vincula um evento ao selecionar um registro.
    @param fn = function(e, data){}
    */
    this.onRowSelect = function (fn) {
        element.on('rowSelect', fn);
    }
    /*
    Atualiza a fonte de dados do datatable
    @param fn = function(e, datasource){}
    */
    this.onUpdateDataSource = function (fn) {
        element.on('updateDataSource', fn);
    }
    /*
    Obtém o registro selecionado da tabela.
    @return JSON
    */
    this.getSelection = function () {
        var selection = element.puidatatable('getSelection');
        if (selection.length > 0)
            return selection[0];
        return null;
    }

    this.getSelectedItems = function () {
        var selection = element.puidatatable('getSelection');
        return selection;
    }

    /*
    Executa uma iteração com todos os itens
    da tabela e seus respectivos elementos html.
    @param fn function(tr, data){}
    */
    this.forEach = function (fn) {
        if (typeof fn == "function") {
            var trs = element.find('tbody tr');
            for (var i = 0; i < trs.length; i++)
                fn.call(trs[i], dataSource[i]);
        }
    }

    this.selectRowByIndex = function (index) {
        var trs = element.find('tbody tr');
        for (var i = 0; i < trs.length; i++) {
            if (i == index)
                element.puidatatable('selectRow', $(trs[i]));
        }
    }

    this.selectAll = function () {
        var trs = element.find('tbody tr');
        for (var i = 0; i < trs.length; i++) {
            element.puidatatable('selectRow', $(trs[i]));
        }
    }

    this.unselectAll = function () {
        var trs = element.find('tbody tr');
        for (var i = 0; i < trs.length; i++) {
            element.puidatatable('unselectRow', $(trs[i]));
        }
    }

    this.updateDataSource([]);
    return this;
}


function dataDropdown(elementId, datasource, dataText, dataValue) {
    var _dataText = dataText;
    var _dataValue = dataValue;
    if (!_dataValue)
        _dataValue = 'Id';
    var element = $(elementId);
    for (var i = 0; i < datasource.length; i++) {
        var data = datasource[i];
        var value = data[_dataValue];
        var text = data[_dataText];
        if (!text)
            text = "Sem Valor";
        if (!value)
            value = "NotValue";
        element.append('<option value="' + value + '">' + text + '</option>');
    }


    element.dropdown({ allowAdditions: true });
    return element;

}

function sortpuidatatable(elementId, columns, datasource) {
    var _this = this;
    var _columns = columns;
    var element = $(elementId);
    var dataSource = datasource;
    var _selectionMode = 'single';
    if (!dataSource)
        dataSource = [];

    /**
    @param datasource Fonte de dados em forma de json array
    @param dataSourceCount Quantidade de itens retornados
    @param rows Quantidades de linhas por paginas (default = 5)
    **/
    this.updateDataSource = function (dataSource, dataSourceCount, rows, functionToCall) {
        if (!dataSource)
            return;
        if (!dataSourceCount)
            dataSourceCount = dataSource.length;
        if (!rows)
            rows = 3;
        element.puidatatable({
            columns: _columns,
            responsive: true,

            paginator: {
                rows: rows,
                totalRecords: dataSourceCount,
                paginate: functionToCall
            },
            datasource: dataSource,
            selectionMode: _selectionMode,
            rowSelect: function (e, data) {
                element.trigger('rowSelect', data);
            }
        });
        element.puidatatable('updateDataSource', dataSource);
        element.trigger('updateDataSource', dataSource);
    }

    /**
     * @param selectionMode: single, multiple
     */
    this.setSelectionMode = function (selectionMode) {
        _selectionMode = selectionMode;
    }

    /**
    Vincula um evento ao selecionar um registro.
    @param fn = function(e, data){}
    */
    this.onRowSelect = function (fn) {
        element.on('rowSelect', fn);
    }
    /*
    Atualiza a fonte de dados do datatable
    @param fn = function(e, datasource){}
    */
    this.onUpdateDataSource = function (fn) {
        element.on('updateDataSource', fn);
    }
    /*
    Obtém o registro selecionado da tabela.
    @return JSON
    */
    this.getSelection = function () {
        var selection = element.puidatatable('getSelection');
        if (selection.length > 0)
            return selection[0];
        return null;
    }

    this.getSelectedItems = function () {
        var selection = element.puidatatable('getSelection');
        return selection;
    }

    /*
    Executa uma iteração com todos os itens
    da tabela e seus respectivos elementos html.
    @param fn function(tr, data){}
    */
    this.forEach = function (fn) {
        if (typeof fn == "function") {
            var trs = element.find('tbody tr');
            for (var i = 0; i < trs.length; i++)
                fn.call(trs[i], dataSource[i]);
        }
    }

    this.selectRowByIndex = function (index) {
        var trs = element.find('tbody tr');
        for (var i = 0; i < trs.length; i++) {
            if (i == index)
                element.puidatatable('selectRow', $(trs[i]));
        }
    }

    this.selectAll = function () {
        var trs = element.find('tbody tr');
        for (var i = 0; i < trs.length; i++) {
            element.puidatatable('selectRow', $(trs[i]));
        }
    }

    this.unselectAll = function () {
        var trs = element.find('tbody tr');
        for (var i = 0; i < trs.length; i++) {
            element.puidatatable('unselectRow', $(trs[i]));
        }
    }

    this.updateDataSource([]);
    return this;
}


/**
Constrói um paginator.
@param elementId id do elemento paginado.
*/
function puipaginator(elementId) {
    var _this = this;
    var element = $(elementId);
    /**
    Vincula um evento a ser invocado quando o paginador mudar 
    a página.
    @param handler (function(event, state){}) event
    handler a ser executado ao paginar
    */
    this.onpaginate = function (handler) {
        element.on('paginate', handler);
    }
    /**
    Atualiza a instância do paginator.
    @param page integer página
    @param rows integer quantidade de linhas por página
    @param totalRecords integer quantidade total de registros do paginador
    */
    this.updateInstance = function (page, rows, totalRecords) {
        var totalPages = Math.ceil(totalRecords / rows);
        if (page + 1 > totalPages)
            page = parseInt(totalPages - 1);
        
        element.puipaginator({
            page: page,
            rows: rows,
            totalRecords: totalRecords,
            paginate: function (e, state) {
                element.trigger('paginate', state);
            }
        });
        element.puipaginator('updateInstance');
    }

    this.updateInstance(0, 0, 0);
    return this;
}
/**
Constrói um dialog padrão para salvamento
de dados.
@param elementId string id do elemento a ser definido como dialog
@param width integer largura da dialog
*/
function puisavedialog(elementId, width) {
    var _this = this;
    var element = $(elementId);
    element.hide();
    if (!width)
        width = 350;
    /**
    Evento ao salvar
    @param fn function(event){} função a ser executada
    quando o botão salvar for clicado
    */
    this.onsave = function (fn) {
        element.on('save', fn);
    }
    /**
    Evento ao cancelar
    @param fn function(event){} função a ser executada
    quando o botão cancelar for clicado
    */
    this.oncancel = function (fn) {
        element.on('cancel', fn);
    }
    /**
    Evento ao exibir dialog
    @param fn function(event){} função a ser executada
    quando o dialog for exibido
    */
    this.onShowDialog = function (fn) {
        element.on('showDialog', fn);
    }
    /**
    Evento ao ocultar dialog
    @param fn function(event){} função a ser executada
    quando o dialog for oculto
    */
    this.onHideDialog = function (fn) {
        element.on('hideDialog', fn);
    }
    /**
    Oculta o dialog
    */
    this.hideDialog = function () {
        element.puidialog('hide');
        element.trigger('hideDialog');
    }
    /**
    Exibe o dialog
    */
    this.showDialog = function () {
        element.puidialog('show');
        element.trigger('showDialog');
    }

    element.puidialog({
        draggable: false,
        resizable: false,
        location: 'center',
        width: width,
        modal: true,
        buttons: [
            {
                text: 'Salvar', icon: 'ui-icon-check', click: function () {
                    element.trigger('save');
                }
            },
            {
                text: 'Cancelar', icon: 'ui-icon-close', click: function () {
                    _this.hideDialog();
                    element.trigger('cancel');
                }
            }
        ]
    });
    return this;
}

/**
 * Constrói um dialog padrão com botões largura e botões personalizados
 * @param elementId string id do elemento a ser definido como dialog
 * @param width integer largura do dialog
 * @param buttons Array de { text: 'string',  icon: 'ui-icon', click: handler } para formação dos botões
 */
function puidialog(elementId, width, buttons, location) {
    var _this = this;
    var _width = 350;
    var _location = 'center';
    var element = $(elementId);

    if (width)
        _width = width;

    if (location)
        _location = location;

    element.puidialog({
        draggable: false,
        resizable: false,
        location: _location,
        width: _width,
        modal: true,
        buttons: buttons
    });

    /**
    Evento ao exibir dialog
    @param fn function(event){} função a ser executada
    quando o dialog for exibido
    */
    this.onShowDialog = function (fn) {
        element.on('showDialog', fn);
    }
    /**
    Evento ao ocultar dialog
    @param fn function(event){} função a ser executada
    quando o dialog for oculto
    */
    this.onHideDialog = function (fn) {
        element.on('hideDialog', fn);
    }
    /**
    Oculta o dialog
    */
    this.hideDialog = function () {
        element.puidialog('hide');
        element.trigger('hideDialog');
    }
    /**
    Exibe o dialog
    */
    this.showDialog = function () {
        element.puidialog('show');
        element.trigger('showDialog');
    }

    return this;
}

function puiconfirmdialog(elementId, confirmHandler) {
    var _this = this;
    var element = $(elementId);
    element.hide();
    var width;
    if (!width)
        width = 350;

    /**
    Evento ao confirmar o dialog.
    @param fn function(event){} função a ser executada
    quando o dialog form confirmado.
    */
    this.onConfirm = function (fn) {
        element.on('confirm', fn);
    }

    /**
    Evento ao exibir dialog
    @param fn function(event){} função a ser executada
    quando o dialog for exibido
    */
    this.onShowDialog = function (fn) {
        element.on('showDialog', fn);
    }
    /**
    Evento ao ocultar dialog
    @param fn function(event){} função a ser executada
    quando o dialog for oculto
    */
    this.onHideDialog = function (fn) {
        element.on('hideDialog', fn);
    }
    /**
    Oculta o dialog
    */
    this.hideDialog = function () {
        element.puidialog('hide');
        element.trigger('hideDialog');
    }
    /**
    Exibe o dialog
    */
    this.showDialog = function () {
        element.puidialog('show');
        element.trigger('showDialog');
    }

    if (confirmHandler) {
        this.onConfirm(confirmHandler);
    }

    element.puidialog({
        draggable: false,
        resizable: false,
        location: 'center',
        width: width,
        modal: true,
        buttons: [
            {
                text: 'Sim', icon: 'ui-icon-check', click: function () {
                    element.trigger('confirm');
                }
            },
            {
                text: 'Não', icon: 'ui-icon-close', click: function () {
                    _this.hideDialog();
                    element.trigger('cancel');
                }
            }
        ]
    });
    return this;
}


/**
Evento para crição de um cookie
@param name [string] (Nome do cookie)
@param value [string] (valor do cookie)
@param days [string] (total de dias para ser expirado, se não setado ele será permanente)
*/
function CreateCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}
/**
Evento para retornar o valor do cookie
Caso não for encontrado o retorno sera null
@param name [string] (Nome do cookie)

*/
function GetCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
Evento para deletar o cookie
@param name [string] (Nome do cookie)
*/
function DeleteCookie(name) {
    createCookie(name, "", -1);
}