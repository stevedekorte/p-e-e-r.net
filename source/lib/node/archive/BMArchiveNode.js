"use strict"

/*
    
    BMArchiveNode
    
	
*/

window.BMArchiveNode = BMFieldSetNode.extend().newSlots({
    type: "BMArchiveNode",
    key: null,
    didSetupFields: false,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
        this.setCanDelete(true)
        this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(300)
        this.setTitle("Archive")
    },

    subtitle: function() {
        if (this.value()) {
            const b = this.value().length
            return ByteFormatter.clone().setValue(b).formattedValue()
        }
        return "N/A"
    },

    prepareForFirstAccess: function () {
        this.addStoredField(BMTextAreaField.clone().setKey("data").setValueMethod("dataString").setValueIsEditable(false).setIsMono(true))
    },

    /*
	subtitle: function() {
		return this.value().length + " bytes"
	},

    escapeHtml: function(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    },
	*/

    value: function () {
        const s = ResourceLoader.archive()
        if (s) {
            return s.escapeHtml()
        }
        return null
    },

    dataString: function () {
        return this.value()
    },
})

