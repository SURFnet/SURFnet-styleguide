var app = app || {};

app.respond = function() {
    var menuSizeWatcher;


    var init = function() {
        setSizeWatcher();
    };


    var setSizeWatcher = function() {
        $('.primary-navigation').wrap('<div class="menu-respond-holder">');

        menuSizeWatcher = new SizeWatcher('body');

        menuSizeWatcher.breakpoint(0, 767, {
            className: 'condensed',
            move: [
                {
                    selector: 'nav.secondary-menu',
                    to: '.menu-respond-holder',
                    after: '.primary-navigation'
                }
            ],
            enter: function() {
                $('.header').append('<a href="#" class="menu-trigger">Menu</a>').find('.menu-trigger').click(openMenu);
                $('.menu-respond-holder').stop().slideUp(0);
            },
            leave: function() {
                $('.header .menu-trigger').remove();
                $('.menu-respond-holder').stop().slideDown(0);
            }
        });

        menuSizeWatcher.breakpoint(767, Infinity, {
            move: [
                {
                    selector: 'nav.secondary-menu',
                    to: '.menu-holder'
                }
            ]
        });
    };


    var openMenu = function(e) {
        e.preventDefault();

        $('.menu-respond-holder').stop().slideToggle(800);
    };


    return {
        init: init
    };
}();

app.register(app.respond);