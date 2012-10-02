var app = app || {};

app.table = function(){

    var init = function() {
        initDataTable();
    };


    var initDataTable = function() {
        $('.table-sortable').each(function(index, table) {
            $(table).dataTable({
                bPaginate: false,
                bLengthChange: false,
                bAutoWidth: false,
                bInfo: false,
                oLanguage: {
                    sSearch: '_INPUT_'
                }
            });
        });
    };


    return {
        init: init
    };
}();

app.register(app.table);
