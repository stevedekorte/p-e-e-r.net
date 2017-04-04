

SyncDB = ideal.Proto.extend().newSlots({
    type: "SyncDB",
    idb: null,
    cache: null,
	isOpen: false,
}).setSlots({
    init: function () {
		this.setCache({})
		this.setIdb(IndexedDBFolder.clone().setPath("SyncDB"))
		//this.asyncOpen()
    },

	// open

	asyncOpen: function(callback) {
		//console.log("SyncDB asyncOpen()")
		var self = this
		this.idb().asyncOpenIfNeeded(function () { self.didOpen(callback) })
		return this
	},
	
	didOpen: function(callback) {
		// load the cache
		//console.log("SyncDB didOpen() - loading cache")
		
		var self = this
		this.idb().asyncAsJson(function (dict) {
		//	console.log("SyncDB didOpen() - loaded cache")
			self._cache = dict
			self.setIsOpen(true)
			if (callback) {
				callback()
			}
		//	self.verifySync()
		})
	},
	
	assertOpen: function() {
		assert(this.isOpen())
		return this
	},
	
	// read
	
	hasKey: function(key) {
		this.assertOpen()
		return key in this._cache;
	},
	
	at: function(key) {
		this.assertOpen()
		return this._cache[key]
	},

	keys: function() {
		this.assertOpen()
		
		var obj = this._cache
		var keys = []
		for (var k in obj)
		{
			if (obj.hasOwnProperty(k))
			{
				keys.push(k)
			}
		}
				
		return keys;
	},
	
	values: function() {
		this.assertOpen()
		
		var obj = this._cache
		var values = []
		for (var k in obj)
		{
			if (obj.hasOwnProperty(k))
			{
				values.push(obj[k])
			}
		}

		return values;
	},
	
	size: function() {
		this.assertOpen()
		var count = 0;
		var dict = this._cache
		for (var i in dict) {
		   if (dict.hasOwnProperty(i)) {
				count++;
			}
		}
		return size
	},	
	
	// write (and async write to idb)
	
	atPut: function(key, value) {
		this.assertOpen()
		this._cache[key] = value
		//console.log("atPut(" + key + ", " + JSON.
		this.idb().asyncAtPut(key, value)
	},
	
	removeAt: function(key) {
		this.assertOpen()
		if (key in this._cache) {
			delete this._cache[key]
			this.idb().asyncRemoveAt(key)
		}
	},
	
	clear: function() {
		throw new Error("SyncDB clear")
		this._cache = {}
		this.idb().asyncClear()
	},
	
	asJson: function() {
		// WARNING: bad performance if called frequently
		var s = JSON.stringify(this._cache)
		return JSON.parse(this._cache)
	},
	
	verifySync: function() {
		var self = this
		var cache = this._cache
		this.idb().asyncAsJson(function (json) {
			var hasError = false
			
			for (k in json) {
				if (!(k in cache)) {
					//console.log("syncdb not in sync with idb - sdb missing key " + k)
					hasError = true
				} else if (json[k] != cache[k]) {
					//console.log("syncdb not in sync with idb - diff values for key " + k )
					hasError = true
				}
			}
			
			
			for (k in cache) {
				if (!(k in json)) {
					//console.log("syncdb not in sync with idb - idb missing key " + k)
					hasError = true
				} else if (json[k] != cache[k]) {
					//console.log("syncdb not in sync with idb - diff values for key " + k )
					hasError = true
				}
			}
			
			if (hasError) {
				//console.log("adding sync timeout")
				setTimeout(function () {
					self.verifySync()
				}, 1000)
				console.log("idb/sdb SYNCING")
			} else {
				console.log("idb/sdb SYNCED")
				
			}
			
			/*
			if(JSON.stableStringify(json) == JSON.stableStringify(self._cache)) {
				console.log("syncdb in sync with idb")
			} else {
				console.log("---- out of sync ---")
				console.log("idb: " + JSON.stableStringify(json))
				console.log("sdb: " + JSON.stableStringify(self._cache))
				throw new Error("syncdb not in sync with idb")
			}
			*/
		})
	},
	
})
	