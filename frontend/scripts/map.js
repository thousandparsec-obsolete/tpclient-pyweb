Map = ( function() {

    var MapCreator = function() {};

    MapCreator.prototype.init = function(target, x, y) {
        this.map = $(target);

        // Create viewport
        this.viewport = $(document.createElement('div')).attr('id', 'map-viewport')
            .css({'position': 'relative', 'overflow': 'hidden', 'height': ($(window).height() - parseInt(this.map.offset().top, 10))+'px'});
        this.map.append(this.viewport);

        // Create scroll
        this.scroll = $(document.createElement('div')).attr('id', 'map-scroll')
            .css({'position': 'absolute', 'top': '0px', 'left': '0px'});
        this.viewport.append(this.scroll);

        // Create canvas
        this.canvas = $(document.createElement('div')).attr('id', 'map-canvas')
            .css({'position': 'absolute', 'top': '0px', 'left': '0px', 'zIndex': '5'});
        this.scroll.append(this.canvas);

        // If possible at this stage, center map on x,y coordinates
        if(x !== undefined && y !== undefined) {
            this.scroll.css('top', (((this.map.height()/2) + y))+'px');
            this.scroll.css('left', ((this.map.width()/2) + -x)+'px');
        }

        // Setup event handlers
        $(this.viewport).bind("mousedown", this, this.down);
        $(document).bind("mousemove", this, this.move);
        $(document).bind("mouseup", this, this.up);
        $(window).bind("resize", this, this.resize);
    };

    MapCreator.prototype.down = function(e) {
        e.data.mapOffset = e.data.map.offset();
        var page = [e.pageX - e.data.mapOffset.left, e.pageY - e.data.mapOffset.top];

        var xpos = page[0] - parseInt(e.data.scroll.css('left'), 10);
        var ypos = parseInt(e.data.scroll.css('top'), 10) - page[1];

        if(!e.data.moving) {
            e.data.posx = page[0];
            e.data.posy = page[1];
            e.data.moving = true;
        }
        return false;
    };

    MapCreator.prototype.move = function(e) {
        if(e.data.moving) {
            var cposx = e.pageX - e.data.mapOffset.left;
            var cposy = e.pageY - e.data.mapOffset.top;
            e.data.scroll.css('top', (parseInt(e.data.scroll.css('top'), 10) + (cposy - e.data.posy))+'px');
            e.data.scroll.css('left', (parseInt(e.data.scroll.css('left'), 10) + (cposx - e.data.posx))+'px');
            e.data.posx = cposx;
            e.data.posy = cposy;
        }
        return false;

    };

    MapCreator.prototype.up = function(e) {
        if(e.data.moving) {
            e.data.moving = false;
        }
        return false;
    };

    MapCreator.prototype.resize = function(e) {
        e.data.viewport.css('height', ($(window).height() - parseInt(e.data.map.offset().top, 10))+'px');
    };

    MapCreator.prototype.addObjects = function(objects) {
        this.objects = objects;
    };

    MapCreator.prototype.draw = function() {
        if(this.objects) {
            universe = this.objects[0];
            for(var i in universe.contains) {
                galaxy = this.objects[universe.contains[i]];
                for(var j in galaxy.contains) {
                    obj = this.objects[galaxy.contains[j]];
                    var x = (obj.pos[0] / universe.size) * 120000;
                    var y = (obj.pos[1] / universe.size) * 120000;
                    if(obj.type == 'Star System') {
                        this.drawstarsystem(x, y, obj.id);
                    } else if(obj.type == 'Fleet') {
                        this.drawfleet(x, y, obj.id);
                    }
                }
            }
        }
    };

    MapCreator.prototype.drawstarsystem = function(x, y, id) {
        var test = $(document.createElement('div'));
        test.attr('id', id).attr('class', 'starsystem');
        test.css({'position': 'absolute', 'top': -y+'px', 'left': x+'px', 'background-color': 'red', 
                'width': '10px', 'height': '10px', 'font-size': '8px', 'z-index': '100'});
        this.canvas.append(test);
    };

    MapCreator.prototype.drawfleet = function(x, y, id) {
        var test = $(document.createElement('div'));
        test.attr('id', id).attr('class', 'fleet');
        test.css({'position': 'absolute', 'top': -y+'px', 'left': x+'px', 'background-color': 'green', 
                'width': '10px', 'height': '10px', 'font-size': '8px', 'z-index': '100'});
        this.canvas.append(test);
    };

    return new MapCreator();
} )();

Logger = ( function() {
    var LoggerClass = function(){};

    var container = null;
    var content = null;
    var active = false;

    LoggerClass.prototype.info = function(message) {
        if(active) {
            var d = new Date();
            var date = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();
            message = date + ' ' + message + "\n";
            if(window.console) {
                console.info(message);
            } else {
                $('pre', content).prepend(message);
            }
        }
    };

    LoggerClass.prototype.setup = function() {
        active = true;

        if(!window.console) {
            container = $(document.createElement('div'));
            container.attr('id', 'log-container').css({
                'position': 'absolute',
                'bottom': '3em',
                'right': '3em',
                'width': '400px',
                'height': '150px',
                'background-color': 'red'
            });
            content = $(document.createElement('div'));
            content.attr('id', 'log-content').css({
                'width': '380px',
                'height': '130px',
                'margin': '10px',
                'overflow': 'auto'
            }).html("<pre style=\"margin: 0;\"></pre>");
            container.append(content);
            $('body').append(container);
        }

        this.info('Starting Logger');
    };

    return new LoggerClass();
} )();

/**
 * A simple Event handler
 * Following the subscribe and publish pattern
 */
EventHandler = ( function(jQuery) {
    var EventHandlerClass = function(){};

    /**
     * Handler can be:
     *  - a function
     *  - an array [object, method, arg]
     */
    EventHandlerClass.prototype.subscribe = function(eventName, handler, data) {
        if(jQuery.isArray(handler)) {
            newhandler = function(event, data) {
                return handler[0][handler[1]](handler[2], data);
            }
            jQuery(document).bind(eventName, data, newhandler);
        } else {
            jQuery(document).bind(eventName, data, handler);
        }
        return this;
    };

    EventHandlerClass.prototype.subscribeOnce = function(eventName, handler, data) {
         if(jQuery.isArray(handler)) {
            newhandler = function(event, data) {
                return handler[0][handler[1]](handler[2], data);
            }
            jQuery(document).one(eventName, data, newhandler);
        } else {
            jQuery(document).one(eventName, data, handler);
        }
        return this;
    };      

    EventHandlerClass.prototype.unsubscribe = function(eventName) {
        jQuery(document).unbind(eventName);
        return this;
    };

    EventHandlerClass.prototype.notify = function(eventName, data) {
        Logger.info("Triggered event: " + eventName);
        jQuery(document).trigger(eventName, data);
        return this;
    };

    return new EventHandlerClass();
} )(jQuery);

UserInterface = ( function() {
    /**
     * User Interface Lock
     */
    var UILock = ( function() {

        var UILockClass = function(){};

        var active = false;

        UILockClass.prototype.create = function() {
            if(active === false) {
                this.lock = $(document.createElement('div')).attr('id', 'uilock').addClass('transparent');
                this.content = $(document.createElement('div')).attr('id', 'uilock-content');
                $("body").append(this.lock).append(this.content);
                active = true;
            }
            return this;
        };

        UILockClass.prototype.clear = function(e) {
            if(this.lock) { this.lock.remove(); }
            if(this.content) { this.content.remove(); }
            active = false;
        };

        UILockClass.prototype.text = function(text, remove) {
            if(active === false) {
                this.create();
            }
            if(remove === true) {
                this.lock.one("click", this, function(e) { e.data.clear(); });
                this.content.one("click", this, function(e) { e.data.clear(); });
                text = text + " Click anywhere to go back.";
            }
            this.content.html(text);
        };

        UILockClass.prototype.error = function(error, remove) {
            this.content.attr('class', 'error');
            this.text(error, remove);
        };

        UILockClass.prototype.notice = function(notice, remove) {
            this.content.attr('class', 'notice');
            this.text(notice, remove);
        };

        return new UILockClass();

    } )();


    /**
     * End of Turn Handler
     */
    var TurnHandler = ( function() {
        var TurnHandler = function(){};
        var timeleft = 0;
        TurnHandler.prototype.setup = function(time, turn) {
            timeleft = parseInt(time);
            $(".turn-component").html('Turn <span class="turn">'+turn+'</span> will end in <span class="timeleft">'+timeleft+'</span> s');

            $(window).stopTime("turntimer");
            $(window).oneTime(timeleft * 1000, "turntimer", function() {
                //$("#turn-component .counter").text("Downloading the new Universe...");
                UserInterface.cache_update(function() {
                    //$("#turn-component .info").text("Finished downloading the Universe, click here if you want the change!");
                    /*$("#turn-component .info").one("click", function(e) {
                        $("#turn-component .info").text("");
                        UserInterface.drawUI();
                    });*/
                });
            });
            $(window).everyTime("1s", "turntimer", function() {
                $(".turn-component .timeleft").text(--timeleft);
            }, timeleft);
        };
        return new TurnHandler();
    } )();


    /**
     * Login handler
     */
    var login = function(e) {
        UILock.create().notice('Please wait while connecting to host <img src="/images/loading.gif" />');

        var host = $("input[name='tphost']", this).val();
        var user = $("input[name='tpuser']", this).val();
        var pass = $("input[name='tppass']", this).val();

        if(host == '' || user == '' || pass == '') {
            UILock.error('No empty fields are allowed.', true);
        } else {
            $.ajax({type: "POST", dataType: 'json', data: {'host': host, 'user': user, 'pass': pass}, url: "/json/login/", 
                error: function(req, textstatus) { 
                    UILock.error('Something went wrong, contact administrator or try again later.', true);
                }, 
                success: function(data, textstatus) { 
                    if(data.auth === true) {
                        UILock.notice('Please wait while loading user interface <img src="/images/loading.gif" />');
                        UserInterface.cache_update(function(data) {
                            UserInterface.drawUI();
                        });
                    } else {
                        UILock.error(data.error, true);
                    }
                }
            });
        }
        return false;
    };

    /**
     * Logout handler
     */
    var logout = function(e) {
        $.ajax({type: "GET", dataType: "json", url: "/json/logout/",
            complete: function() {
                $.cookies.del('tpclient-pyweb');
                window.location.reload();
            }
        });
        return false;
    };

    var ObjectHandler = ( function() {
        var ObjectHandlerClass = function(){};
        var objects = null;
        ObjectHandlerClass.prototype.load = function() {
            $.ajax({type: "GET", dataType: 'json', url: "/json/get_objects/", 
                error: function(data, textstatus) { }, 
                success: function(data, textstatus) {
                    if(data.auth === true) {
                        TurnHandler.setup(data.turn.time, data.turn.current);
                        objects = data.objects;
                        UILock.clear();
                    } else {
                        this.logout();
                    }
                }
            });
        };
        return new ObjectHandlerClass();
    } )();

    /**
     * Store all objects
     */
    var objects = null;

    var constructor = function(){};

    constructor.prototype.drawUI = function() {
        UILock.create().notice('Please wait while loading user interface <img src="/images/loading.gif" />');
        $('#loginbox').hide();
        $('#ui').show();
        UserInterface.getObjects(function(data) {
            Map.addObjects(data.objects);
            Map.draw();
            jQuery('#overlay-content').css('height', (jQuery(window).height() - jQuery('#overlay-content').offset().top));
            jQuery('#overlay-content').css('width', jQuery(window).width());
            UILock.clear();
        });
    };

    constructor.prototype.getObjects = function(callback) {
        $.ajax({async: false, type: "GET", dataType: 'json', url: "/json/get_objects/", 
            error: function(data, textstatus) { }, 
            success: function(data, textstatus) {
                if(data.auth === true) {
                    callback(data);
                    TurnHandler.setup(data.turn.time, data.turn.current);
                    objects = data.objects;
                } else {
                    this.logout();
                }
            }
        });
    };

    constructor.prototype.isLoggedin = function() {
        if($.cookies.get('tpclient-pyweb') == null) {
            return false;
        } else { 
            return true;
        }
    };

    constructor.prototype.cache_update = function(callback) {
        $.ajax({type: "GET", dataType: 'json', url: "/json/cache_update/", 
            error: function(data, textstatus) { 
                this.logout();
            }, 
            success: function(data, textstatus) {
                if(data.auth === true && data.cache === true) {
                    callback(data);
                    TurnHandler.setup(data.turn.time, data.turn.current);
                 } else {
                    this.logout();
                }
            }
        });
    };

    constructor.prototype.objclicked = function(e) {
        id = parseInt(e.target.id);
        object = objects[id];

        infoComponent = $("#info-component-content").html("");
        h4 = $(document.createElement("h4")).text(object.name);
        dl = $(document.createElement("dl"));
        infoComponent.append(h4).append(dl);

        base = {'name': 'Name', 'id': 'Id', 'parent': 'Parent', 'pos': 'Position', 'vel': 'Velocity', 'size': 'Size'}
        for(var attr in base) {
            dt = $(document.createElement('dt')).text(base[attr]);
            if(attr == 'parent') {
                o = objects[object[attr]];
                if(o.id > 0) {
                    a = $(document.createElement('a')).attr({'href': '#info/' + o.id, 'id': o.id}).text(o.name);
                    a.one('click', UserInterface.objclicked);
                    dd = $(document.createElement('dd')).append(a);
                } else {
                    dd = $(document.createElement('dd')).text(o.name);
                }
            } else {
                dd = $(document.createElement('dd')).text(object[attr].toString());
            }
            dl.append(dt).append(dd);
        }

        // What objects are contained inside this object
        if(object.contains.length > 0) {
            dt = $(document.createElement('dt')).text('Contains');
            dd = $(document.createElement('dd'));
            ul = $(document.createElement('ul'));
            for(var i in object.contains) {
                toplevel = objects[object.contains[i]];
                li = $(document.createElement('li'));
                a = $(document.createElement('a')).attr({'href': '#info/' + toplevel.id, 'id': toplevel.id}).text(toplevel.name);
                a.one('click', UserInterface.objclicked);
                ul.append(li.append(a));
                if(toplevel.contains.length > 0) {
                    subul = $(document.createElement('ul'));
                    li.append(subul);
                    for(var j in toplevel.contains) {
                        sublevel = objects[toplevel.contains[j]];
                        subli = $(document.createElement('li'));
                        a = $(document.createElement('a')).attr({'href': '#info/' + sublevel.id, 'id': sublevel.id}).text(sublevel.name);
                        a.one('click', UserInterface.objclicked);
                        subul.append(subli.append(a));
                    }
                }
            }
            dl.append(dt).append(dd.append(ul));
        }
        return false;
    };

    constructor.prototype.setup = function() {
    
        // Hack (fix later)
        $("#ui").show();
        Map.init("#mapdiv", 0, 0);
        $("#ui").hide();

        // Sets width and height correctly on resize
        jQuery(window).bind('resize', function(e) {
            jQuery('#overlay-content').css('height', (jQuery(window).height() - jQuery('#overlay-content').offset().top));
            jQuery('#overlay-content').css('width', jQuery(window).width());       
        });

        // Setup draggables
        jQuery('#order-component').draggable({
            containment: '#overlay-content',
            handle: 'h3',
            cursor: 'move',
            stack: { group: '.component', min: 50 }
        });

        jQuery('#message-component').draggable({
            containment: '#overlay-content',
            handle: 'h3',
            cursor: 'move',
            stack: { group: '.component', min: 50 }
        });

        jQuery('#info-component').draggable({
            containment: '#overlay-content',
            handle: 'h3',
            cursor: 'move',
            stack: { group: '.component', min: 50 }
        });

        $('#logout').bind("click", this, logout);
        $('#loginform').bind("submit", this, login);
        $('.starsystem, .fleet').live("click", this.objclicked);
    };

    return new constructor();
} )();
