var app = app || {};

app.appgrid = function() {
    var gridElm;

    var init  = function() {
        gridElm = $('.app-grid');

        if (gridElm.length === 0) {
            return;
        }

        gridElm.addClass('app-grid-js');

        setHover();
    };


    var setHover = function() {
        gridElm.find('li').click(function(e) {
            var elm = $(this),
                target = $(e.target);

            if (target.is('a')) {
                return;
            }

            e.preventDefault();

            var link = elm.find('h2 a');

            location.href = link.attr('href');
        });
    };


    return {
        init: init
    };
}();

app.register(app.appgrid);