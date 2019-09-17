"use strict"


/* 

    CloseButton

    TODO: make subclass of ButtonView
*/

window.CloseButton = DomView.newSubclassNamed("CloseButton").newSlots({ 
    isEnabled: true,
}).setSlots({

    init: function () {
        DomView.init.apply(this)

        this.turnOffUserSelect()

        this.setDivClassName("ImageCloseButton")
        this.setIconName("close-white")
        this.setBackgroundSizeWH(9, 9) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.makeBackgroundNoRepeat()
        this.setAction("close") //.setInnerHTML("&#10799;")

        this.addDefaultTapGesture()
        
        return this
    },

    setIconName: function(aString) {
        this.setBackgroundImageUrlPath(this.pathForIconName(aString))
        return this
    },

    // --- editable ---
    
    setIsEnabled: function(aBool) {
        if (this._isEnabled !== aBool) {
            this._isEnabled = aBool
            this.syncEnabled()
        }

        return this
    },

    syncEnabled: function() {
        if (this._isEnabled) {
            this.setDisplay("inline-block")
        } else {
            this.setDisplay("none")
        }
        return this
    },

    onTapComplete: function (aGesture) {
        //console.log(this.typeId() + ".onTapComplete()")
        if (!this.isEditable()) {
            DomView.sendActionToTarget.apply(this)
        }
        return false
    },
})
