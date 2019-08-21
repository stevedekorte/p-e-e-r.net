"use strict"

/*

    BMViewStyle

    Representation of a single style state (a example of a state is "selected").

    See BMViewStyles for docs.

*/

ideal.Proto.newSubclassNamed("BMViewStyle").newSlots({
    name: "",

    // use same names as css style, nulls aren't applied
	
    color: null,
    backgroundColor: null,
    opacity: null,
    borderLeft: null,
    borderRight: null,
    borderTop: null,
    borderBottom: null,
	
    // margin, padding, border,...
    // fontSize, fontFamily, fontStyle
	
    styleNames: ["color", "backgroundColor", "opacity", "borderLeft", "borderRight", "borderTop", "borderBottom"]
}).setSlots({
    init: function () {
        return this
    },

    isEmpty: function() {
        return this.styleNames().detect(s => s != null) === null
    },

    description: function() {
        const parts = []
		
        this.styleNames().forEach( (name) => { 
            const v = this[name].apply(this)
            if (v != null) {
                parts.push(name + ":" + v)
            }
        })	
		
        return "{" + parts.join(", ") + "}"	
    },
	
    copyFrom: function(aViewStyle) {
        aViewStyle.applyToView(this) // we're not a view but this works since we use the same methods/protocol
        return this
    },
	
    applyToView: function(aView) {		
        this.styleNames().forEach( (name) => { 
            const v = this[name].apply(this)
            if (v != null) {
                aView[aView.setterNameForSlot(name)].apply(aView, [v])
            }
        })
		
        return this
    },
})