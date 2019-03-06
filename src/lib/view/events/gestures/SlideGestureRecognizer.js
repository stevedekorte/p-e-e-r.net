"use strict"

/*

    SlideGestureRecognizer

    This gets tricky as we need to follow movement outside the view.
    To do this, we add special event move and up handlers to the document after getting
    a down event and then remove them after the up event. 
    
    We ignore the view's own move and up events.

    Delegate messages :

        onSlideBegin
        onSlideMove
        onSlideComplete
        onSlideCancelled
    
    Gesture state info methods:

        direction()
        distance() 
        downPosInView()

    TODO

        make multitouch

        optimization: floor the move event points and only send delegate messages if
        new position is different from last?

*/


window.SlideGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "SlideGestureRecognizer",
    isPressing: false,

    direction: "left", 
    validDirectionsDict: { left: 1, right: 2, up: 3, down: 4 },
    numberOfFingerRequired: 1,
    minDistToBegin: 10,
    maxPerpendicularDistToBegin: 10, // will not begin if this is exceeded
    //downPositionInTarget: null,
}).setSlots({
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        //this.setIsDebugging(true)
        return this
    },

    setDirection: function(directionName) {
        assert(directionName in this.validDirectionsDict());
        this._direction = directionName
        return this
    },

    setNumberOfTouchesRequired: function(n) {
        assert(n == 1) // need to add multi-touch support
        this._numberOfTouchesRequired = n
        return this
    },

    // --- events --------------------------------------------------------------------

    onDown: function (event) {
        console.log(this.type() + ".onDown()")

        if (this.isPressing()) {
            console.warn(this.type() + ".onDown() isPressing")
        }

        if (this.isActive()) {
            console.warn(this.type() + ".onDown() isActive")
        }

        if (!this.isPressing()) {
            this.setCurrentEvent(event)
            if (this.currentFingersDown() >= this.numberOfFingerRequired()) {
                this.setIsPressing(true)
                this.setBeginEvent(event)
                this.startDocListeners()
            }
        }
    },

    onMove: function(event) {
        if (this.isPressing()) {
            this.setCurrentEvent(event)

            if (this.hasMovedTooMuchPerpendicular()) {
                this.cancel()
                return this
            }

            if (!this.isActive() && this.hasMovedEnough()) {
                let vt = this.viewTarget()
                let r = vt.requestActiveGesture(this)
                if(r) {
                    this.setIsActive(true)
                    this.setBeginEvent(event)
                    this.sendDelegateMessage("onSlideBegin")
                }
            }
        
            if (this.isActive()) {
                this.sendDelegateMessage("onSlideMove")
            }
        }
    },

    // -----------

    onUp: function (event) {
        if (this.isPressing()) {
            this.setIsPressing(false)
            this.setCurrentEvent(event)
            if (this.isActive()) {
                this.sendDelegateMessage("onSlideComplete")
            }
            this.finish()
        }

        return true
    },

    cancel: function() {
        if (this.isActive()) {
            this.sendDelegateMessage("onSlideCancelled")
        }
        this.finish()
        return this
    },

    finish: function() {
        //console.log(this.type() + ".finish()")
        this.setIsPressing(false)
        this.setIsActive(false)
        this.stopDocListeners()
        this.didFinish()
        return this
    },

    // ----------------------------------

    hasMovedTooMuchPerpendicular: function() {
        let m = this.maxPerpendicularDistToBegin()
        let dp = this.diffPos()

        let funcs = {
            left:  (dx, dy) => dy,
            right: (dx, dy) => dy,
            up:    (dx, dy) => dx,
            down:  (dx, dy) => dx
        }

        let r = Math.abs(funcs[this.direction()](dp.x(), dp.y())) > m
        return r
    },

    hasMovedEnough: function() {
        let m = this.minDistToBegin()
        let dp = this.diffPos()

        let funcs = {
            left:  (dx, dy) => -dx,
            right: (dx, dy) =>  dx,
            up:    (dx, dy) =>  dy,
            down:  (dx, dy) => -dy
        }

        let r = funcs[this.direction()](dp.x(), dp.y()) > m
        return r
    },

    // --- helpers ----

    diffPos: function() {
        let p = this.currentPosition().subtract(this.beginPosition()).floorInPlace() // floor here?
        let dx = p.x()
        let dy = p.y()
        let funcs = {
            left:  (p) => p.setX(Math.min(dx, 0)),
            right: (p) => p.setX(Math.max(dx, 0)),
            up:    (p) => p.setY(Math.max(dy, 0)),
            down:  (p) => p.setY(Math.min(dy, 0))
        }

        funcs[this.direction()](p)
        return p
    },

    distance: function() {
        let p = this.diffPos()
        let dx = p.x()
        let dy = p.y()
        let funcs = {
            left:  (dx, dy) => dx,
            right: (dx, dy) => dx,
            up:    (dx, dy) => dy,
            down:  (dx, dy) => dy
        }
        return Math.abs(funcs[this.direction()](dx, dy))
    },

})
