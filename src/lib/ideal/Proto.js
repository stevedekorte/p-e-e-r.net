"use strict"

window.ideal = {}


var Proto_constructor = new Function;



var Proto = new Object;
ideal.Proto = Proto

Proto.setSlot = function (name, value) {
    this[name] = value;

    return this;
};

Proto.setSlots = function (slots) {
    var self = this;
    Object.eachSlot(slots, function (name, initialValue) {
        self.setSlot(name, initialValue);
    });
    return this;
}

var uniqueIdCounter = 0;

var Object_hasProto = (Object.prototype.__proto__ !== undefined);
var Object_clone = Object.clone;

Proto.setSlots({
    extend: function () {
        var obj = Object_clone(this);
        if (!Object_hasProto) {
            obj.__proto__ = this;
        }
        obj._uniqueId = ++uniqueIdCounter;
        return obj;
    },

    uniqueId: function () {
        return this._uniqueId
    },

    typeId: function () {
        return this.type() + this.uniqueId()
    },

    subclass: function () {
        console.warn("subclass is deprecated in favor of extend");
        return this.extend.call(this);
    },

    clone: function () {
        var obj = this.extend();
        obj.init();

        return obj;
    },

    withSets: function (sets) {
        return this.clone().performSets(sets);
    },

    withSlots: function (slots) {
        return this.clone().setSlots(slots);
    },

    init: function () { },

    uniqueId: function () {
        return this._uniqueId;
    },

    toString: function () {
        return this._type;
    },

    setSlotsIfAbsent: function (slots) {
        var self = this;
        Object.eachSlot(slots, function (name, value) {
            if (!self[name]) {
                self.setSlot(name, value);
            }
        });
        return this;
    },

    newSlot: function (slotName, initialValue) {
        if (typeof (slotName) != "string") throw "name must be a string";

        if (initialValue === undefined) { initialValue = null };

        var privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        var setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                //this[privateName] = newValue;
                this.updateSlot(slotName, privateName, newValue);
                return this;
            }
        }

        /*
				this["addTo" + slotName.capitalized()] = function(amount)
				{
					this[privateName] = (this[privateName] || 0) + amount;
					return this;
				}
				*/

        return this;
    },

    updateSlot: function (slotName, privateName, newValue) {
        var oldValue = this[privateName];
        if (oldValue != newValue) {
            this[privateName] = newValue;
            this.didUpdateSlot(slotName, oldValue, newValue)
            //this.mySlotChanged(name, oldValue, newValue);
        }

        return this;
    },

    didUpdateSlot: function (slotName, oldValue, newValue) {
        // persistence system can hook this
    },

    mySlotChanged: function (slotName, oldValue, newValue) {
        this.perform(slotName + "SlotChanged", oldValue, newValue);
    },

    ownsSlot: function (name) {
        return this.hasOwnProperty(name);
    },

    aliasSlot: function (slotName, aliasName) {
        this[aliasName] = this[slotName];
        this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
        return this;
    },

    argsAsArray: function (args) {
        return Array.prototype.slice.call(args);
    },

    newSlots: function (slots) {
        var self = this;
        Object.eachSlot(slots, function (slotName, initialValue) {
            self.newSlot(slotName, initialValue);
        });

        return this;
    },

    canPerform: function (message) {
        return this[message] && typeof (this[message]) == "function";
    },

    performWithArgList: function (message, argList) {
        return this[message].apply(this, argList);
    },

    perform: function (message) {
        if (this[message] && this[message].apply) {
            return this[message].apply(this, this.argsAsArray(arguments).slice(1));
        }

        throw new Error(this, ".perform(" + message + ") missing method")

        return this;
    },

    _setterNameMap: {},

    setterNameForSlot: function (name) {
        // cache these as there aren't too many and it will avoid extra string operations
        var setter = this._setterNameMap[name]
        if (!setter) {
            setter = "set" + name.capitalized()
            this._setterNameMap[name] = setter
        }
        return setter
    },

    performSet: function (name, value) {
        return this.perform("set" + name.capitalized(), value);
    },

    performSets: function (slots) {
        var self = this;
        Object.eachSlot(slots, function (name, value) {
            self.perform("set" + name.capitalized(), value);
        });

        return this;
    },

    performGets: function (slots) {
        var self = this;
        var object = {};
        slots.forEach(function (slot) {
            object[slot] = self.perform(slot);
        });

        return object;
    }
});

Proto.toString = function () {
    return this.type() + "." + this.uniqueId();
}

Proto.newSlot("type", "ideal.Proto");

// Proto

ideal.Proto.isKindOf = function (aProto) {
    if (this.__proto__) {
        if (this.__proto__  === aProto) {
            return true
        }
		
        if (this.__proto__.isKindOf) {
            return this.__proto__.isKindOf(aProto)
        }
    }
    return false
}



/// Proto

ideal.Proto.uniqueId = function () {
    return this._uniqueId
}