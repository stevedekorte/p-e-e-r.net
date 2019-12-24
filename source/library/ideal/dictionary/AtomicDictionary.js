"use strict"

/*

    AtomicDictionary

    TODO: map dictionary operators to methods or raise exceptions?

*/

window.ideal.AtomicDictionary = class AtomicDictionary extends ideal.Dictionary {

    initPrototype () {
        this.newSlot("hasBegun", false) // private method
        this.newSlot("oldVersion", null) // private method
        this.newSlot("isOpen", true) // private method
        this.newSlot("keysAndValuesAreStrings", true) // private method
    }

    init () {
        super.init()
    }

    open () {
        this.setIsOpen(true)
        return this
    }

    assertOpen () {
        assert(this.isOpen())
    }

    asyncOpen (callback) {
        this.setIsOpen(true)
        callback()
    }

    close () {
        this.setIsOpen(false)
        return this
    }

    begin () {
        this.assertAccessible()
        this.assertNotInTx()
        this.setOldVersion(this.jsDict().shallowCopy()) // so no one else has a reference to our copy
        this.setHasBegun(true)
        return this
    }

    revert() {
        this.assertInTx()
        // replace dict with old version
        this.setJsDict(this.oldVersion()) 
        this.setOldVersion(null)
        this.setHasBegun(false)
        return this
    }

    commit () {
        this.assertInTx()
        // erase old version
        this.setOldVersion(null) 
        this.setHasBegun(false)
        return this
    }

    changeEntries () {
        // format: ["key", "insert/update/delet", newValue]
        const entries = []

        const d1 = this.oldVersion()
        const d2 = this.jsDict()

        const k1 = Object.keys(d1).asSet()
        const k2 = Object.keys(d2).asSet()

        const keys = k1.union(k2)

        keys.forEach((k) => {
            const v1 = d1[k]
            const v2 = d2[k]

            if (v1 !== v2) {
                if (Type.isUndefined(v2)) {
                    entries.push([k]) // removeAt(k)
                } else if (Type.isUndefined(v1)) {
                    entries.push([k, v2]) // atPut(k, v2)
                }
            }
        })

        return entries
    }

    commitApplyChangeEntries (entries) {
        this.begin()

        entries.forEach((entry) => {
            const k = entry[1]
            const v = entry[2]

            if (Type.isUndefined(v)) {
                this.removeAt(k)
            } else {
                this.atPut(k, v)
            }
        })
        
        this.commit()
    }

    // just need to make sure writes happen within a transaction

    assertInTx () { // private
	    assert(this.hasBegun())
    }

    assertNotInTx () { // private
	    assert(!this.hasBegun())
    }

    atPut (k, v) {
        if (this.keysAndValuesAreStrings()) {
            assert(Type.isString(k))
            assert(Type.isString(v))
        }

        this.assertAccessible()
        this.assertInTx()
        return super.atPut(k, v)
    }

    removeKey (k) {        
        if (this.keysAndValuesAreStrings()) {
            assert(Type.isString(k))
        }

        this.assertAccessible()
        this.assertInTx()
        return super.removeKey(k)
    }

    // extras 

    assertAccessible () {
        this.assertOpen()
    }

    keys () {
        this.assertAccessible()
        return Object.keys(this.jsDict());
    }
	
    values () {
        this.assertAccessible()
        return Object.values(this.jsDict());
    }

    size () {
        this.assertAccessible()
        return this.keys().length
    }	

    asJsonString () {
        this.assertAccessible()
        // WARNING: this can be slow for a big store!
        return this.jsDict()
    }

    totalBytes () {
        this.assertAccessible()
        let byteCount = 0
        this.jsDict().ownForEachKV((k, v) => {
            byteCount += k.length + v.length
        })
        return byteCount
    }

    // test

    test () {

    }
}.initThisClass()

