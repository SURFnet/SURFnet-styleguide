var app = app || {};

app.respond = function() {
    var menuSizeWatcher;


    var init = function() {
        setSizeWatcher();
    };


    var setSizeWatcher = function() {
        $('.primary-navigation').wrap('<div class="menu-respond-holder">');

        menuSizeWatcher = new SizeWatcher('body');

        menuSizeWatcher.breakpoint(0, 768, {
            className: 'condensed',
            enter: function() {
                $('.header').append('<a href="#" class="menu-trigger">Menu</a>').find('.menu-trigger').click(openMenu);
                $('.menu-respond-holder').addClass('hide');
            },
            leave: function() {
                $('.header .menu-trigger').remove();
                $('.menu-respond-holder').removeClass('hide');
            }
        });

        menuSizeWatcher.trigger();


        var columnSizeWatcher = new SizeWatcher('.has-left-right');

        columnSizeWatcher.breakpoint(0, 950, {
            className: 'narrow',
            order: ['.column-left', '.column-center', '.column-right']
        });

        columnSizeWatcher.breakpoint(950, Infinity, {
            order: ['.column-left', '.column-right', '.column-center']
        });
    };


    var openMenu = function(e) {
        e.preventDefault();

        $('.menu-respond-holder').toggleClass('hide');
    };


    return {
        init: init
    };
}();

app.register(app.respond);