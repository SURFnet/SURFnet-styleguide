var app = app || {};

app.secondarymenu = function() {
    var menuElm, currentActive, animating;

    var init  = function() {
        menuElm = $('.secondary-menu');
        if (!menuElm.length) {
           return;
        }
        bindEvents();
        foldInactive();
    };


    var bindEvents = function() {
        menuElm.on('click', 'a', toggleMenu);
    };


    var foldInactive = function() {
        var toFold = menuElm.find('> ul > li:not(.active)');
        toFold.find('ul').slideUp(0);
        currentActive = menuElm.find('.active');
    };



    var toggleMenu = function(e) {
        var tgt, toFold, ulElms;

        tgt = $(e.target);
        ulElms = tgt.parentsUntil('.secondary-menu', 'ul');

        if (ulElms.length !== 1) {
            return;
        }

        toFold = tgt.siblings('ul');

        if (!toFold.length) {
            return;
        }

        e.preventDefault();

        if (animating || $('body.condensed').length !== 0) {
            return;
        }

        animating = true;

        if (toFold.closest('li').hasClass('active')) {
            toFold.slideToggle(500, function() {
                animating = false;
            });
        } else {
            toFold.slideDown(500);
            currentActive.find('ul').slideUp(500, function() {
                currentActive.removeClass('active');
                currentActive = toFold.closest('li');
                currentActive.addClass('active');
                animating = false;
            });
        }
    };


    return {
        init: init
    };
}();

app.register(app.secondarymenu);