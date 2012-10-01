var app = app || {};

app.respond = function() {
    var menuSizeWatcher;


    var init = function() {
        setSizeWatcher();
        setNetworksMenu();
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

        $('.menu-respond-holder').stop().slideToggle(800);
    };


    var setNetworksMenu = function() {
        if (!('ontouchstart' in window)) {
            return;
        }

        $('.networks ul').click(function(e) {
            var tgt = $(e.target),
                elm = $(this);

            if ((tgt.is('a') && elm.hasClass('opened')) || $('body').hasClass('condensed')) {
                return;
            }

            e.preventDefault();

            elm.toggleClass('opened');
        });

        $('body').click(function(e) {
            var elm = $('.networks ul.opened'),
                tgt = $(e.target);

            if (elm.length === 1 && tgt.closest('.networks').length === 0) {
                elm.removeClass('opened');
            }
        });
    };


    return {
        init: init
    };
}();

app.register(app.respond);