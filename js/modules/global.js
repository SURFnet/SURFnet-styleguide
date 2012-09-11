var app = app || {};

app.global = function() {

    var init = function() {

        initEventHandlers();
        initPlugins();
    };

    var initEventHandlers = function() {

        initUserSelection();
        initTextSearch();
    };

    var initPlugins = function() {

        initTooltips();
        initPopovers();
    };

    var initUserSelection = function() {
        var form = $('form.dropdown-menu');

        form.on('click', 'li', function(event) {

            var item = $(event.target).closest('li')[0], roleId = item
                    .getAttribute('data-roleId');

            $('<input>').attr({
                type : 'hidden',
                name : 'roleId',
                value : roleId
            }).appendTo(form);

            form[0].submit();
        });
    };

    var initTextSearch = function() {
        var searchButton = $('#sb_id');
        var searchInput = $('#si_id');

        searchButton.click(function(event){
            search(event); 
        });

        searchInput.keydown(function(event){
            if (event.which === 13) {
               search(event);
            }
        });
    }

    function search (event) {
        var searchButton = $('#sb_id');
        var searchInput = $('#si_id');
        var currentUrl = document.URL;
        var searchPart = "/search?search=";

        //Remove jsessionid, this mixes up the url mappings
        currentUrl = currentUrl.replace(/;jsessionid.*\//,"/");

        currentUrl = currentUrl.replace(window.location.search, "");
        // Is a search text entered?
        if (searchInput.val().length == 0) {
            // Remove from url
            currentUrl = currentUrl.replace("/search", "");
        } else {
            // Are we filtering?
            if (currentUrl.indexOf("filter") == -1) {
                // Add search url and param
                currentUrl = currentUrl + searchPart + searchInput.val();
                if (currentUrl.lastIndexOf("/search/search") != -1) {
                    currentUrl = currentUrl.replace("/search/search",
                            "/search");
                }
            } else {
                // Only add param
                currentUrl = currentUrl + "?search=" + searchInput.val();
            }
        }
        window.location.href = currentUrl;
    }

    var _placement = function(popup, element) {
        popup.setAttribute('data-type', element.getAttribute('data-type'));
        return 'top';
    };

    var initTooltips = function() {

        $('[rel="tooltip"]').tooltip({
            placement : _placement
        });

    };

    var initPopovers = function() {

        $('[rel="popover"]').popover({
            placement : _placement
        });

    };

    return {
        init : init
    };

}();

app.register(app.global);
