
BrowserColumn = NodeView.extend().newSlots({
    type: "BrowserColumn",
    rows: null,
    node: null,
    selectionColor: "#aaa",
    allowsCursorNavigation: true,
	debug: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BrowserColumn")
        this.setItemProto(BrowserRow)
        this.setOwnsView(false)
        this.registerForKeyboard(true)
        return this
    },
    
    setNode: function(aNode) {
        NodeView.setNode.apply(this, [aNode])
        if (aNode) {
            var itemProto = aNode.nodeRowViewClass()
            if (itemProto) {
                //console.log("set itemProto ", itemProto)
                this.setItemProto(itemProto)
            } else {
                this.setItemProto(BrowserRow)
            }
        }
        return this
    },
    
    title: function() {
        return this.node() ? this.node().title() : ""
    },

    browser: function() {
        return this.columnGroup().browser()
    },
    
    columnGroup: function () {
        return this.parentItem()
    },

    rows: function() {
        return this.items()
    },

    addRow: function(v) {
        return this.addItem(v)
    },

    removeItem: function(v) {
        var r = NodeView.removeItem.apply(this, [v])
        return r       
    },
    
    removeRow: function(v) {
        return this.removeItem(v)
    },

	// selection


    rowClicked: function(clickedRow) {
        var rows = this.rows()
        rows.forEach(function(row) {
            if (row != clickedRow) {
                row.unselect()
            }
        })
        this.browser().selectColumn(this)
        //this.focus()
        return true
    },
    
    selectedRows: function() {
        return this.items().filter(function (row) { return row.isSelected(); })
    },

    selectedRow: function() {
        return this.selectedRows()[0]
    },
    
    selectedNode: function() {
        var row = this.selectedRow()
        return row ? row.node() : null
    },
    
    selectedRowIndex: function() {
        return this.rows().indexOf(this.selectedRow())
    },
    
    setSelectedRowIndex: function(index) {
        var oldIndex = this.selectedRowIndex()
        if (index != oldIndex) {
            var rows = this.rows()
            if(index < rows.length && index > -1) {
                var row = rows[index]
                row.select()
                this.rowClicked(row)
            }
        }
        return this
    },
  
     indexOfRowWithNode: function (aNode) {
        var rows = this.rows()
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i]
            if (row.node() == aNode) {
                return i;
            }
        }
        return null
    },
    
    clickRowWithNode: function(aNode) {
        var index = this.indexOfRowWithNode(aNode);
        if (index != null) {
            this.setSelectedRowIndex(index)
        }
        return this
    },

      
    selectRowWithNode: function (aNode) {
        var rows = this.rows()
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i]
            if (row.node() == aNode) {
                row.setIsSelected(true)
                return row
            }
        }
        return null
    },
    
    selectedRowTitle: function () {
        var row = this.selectedRow()
        if (row) { return row.title().innerHTML() }
        return null
    },

	// sync

    syncFromNode: function () {
        
        if (this.browser() == null) {
            console.log("WANRING: exiting BrowserColumn.syncFromNode because this.browser() == null")
            return
        }
        
        // remember the selection        
        var selectedIndex = this.selectedRowIndex()
        var thereWasASelection = selectedIndex != -1
        var lastSelectedNode = this.selectedNode()
        
        NodeView.syncFromNode.apply(this)
        
        if (this.node() == null) {
            this.registerForDrop(false)
            return
        }
        
        this.registerForDrop(this.node().acceptsFileDrop())

        if (!thereWasASelection) {
            this.browser().clearColumnsGroupsAfter(this.columnGroup())
        } else {
 
            // select the row matching the last selected node
            var row = this.selectRowWithNode(lastSelectedNode)

            if (row) {
                //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                if (!row.isSelected()) {
                    row.setIsSelected(true)
                    this.rowClicked(row)
                }
            } else {
                //this.log(this.title() + " syncFromNode with new selection")
                //this.log("this.rows().length: " + this.rows().length)
                //this.log("selectedIndex: " + selectedIndex)
                
                // otherwise, select close to last selected index
                if (selectedIndex > this.rows().length) {
                    selectedIndex = this.rows().length -1
                }
                
                //this.log("selectedIndex after: " + selectedIndex)
                //this.log("selectedIndex < this.rows().length: " + (selectedIndex < this.rows().length) )
                
                if (selectedIndex > -1 && selectedIndex < this.rows().length) {
                    var row = this.rows()[selectedIndex]
                    //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                    row.setIsSelected(true)
                    this.rowClicked(row)
                } else {
                    //this.log("clear other columns")
                    this.browser().clearColumnsGroupsAfter(this.columnGroup())
                }
            }
        }
    },

	// keyboard controls, arrow navigation
	
	onUpArrowKeyUp: function(event) {
        if (!this.allowsCursorNavigation()) { return }
        this.selectPreviousRow()
		return this
	},
	
	onDownArrowKeyUp: function(event) {
        if (!this.allowsCursorNavigation()) { return }	
        this.selectNextRow()
		return this
	},
	
	onLeftArrowKeyUp: function(event) {
        if (!this.allowsCursorNavigation()) { return }	

        var sNode = this.selectedNode()
		if (sNode) { sNode.unselect() }

		var pc = this.previousColumn()			
		pc.rowClicked(pc.selectedRow())
        this.selectPreviousColumn()
		return this
	},
	
	onRightArrowKeyUp: function(event) {
        if (!this.allowsCursorNavigation()) { return }		

        this.selectNextColumn()
		return this
	},	

	// keyboard controls, add and delete actions
	
	/*
	
	// need to fix interactions with direct editing of row title, etc first
	
	onDeleteKeyUp: function(event) {
        if (!this.allowsCursorNavigation()) { return }		
        var sNode = this.selectedNode()
        if (sNode && sNode.hasAction("delete")) { sNode.performAction("delete") }
		return this
	},
	
	onPlusKeyUp: function(event) {
        if (!this.allowsCursorNavigation()) { return }		
        var sNode = this.selectedNode()
        if (sNode && sNode.hasAction("add")) { sNode.performAction("add") }
		return this		
	},
	
	*/
	

	// -----------------------------
    
    columnIndex: function() {
        return this.browser().columnGroups().indexOf(this.columnGroup())
        //return this.browser().columns().indexOf(this)
    },

	// nextRow

    selectNextRow: function() {
        var si = this.selectedRowIndex()
        var rows = this.rows()
        if (si == -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si + 1)
        }
        return this
    },
    
    selectPreviousRow: function() {
        var si = this.selectedRowIndex()
        var rows = this.rows()
        if (si == -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si - 1)
        }
        return this
    },

	// next column
    
    nextColumn: function() {
        var i = this.columnIndex()
        var nextColumn = this.browser().columns()[i+1]
        return nextColumn
    },
    
    selectNextColumn: function() {
        var nextColumn = this.nextColumn()
        if (nextColumn) {
            if (nextColumn.selectedRowIndex() == -1) {
                nextColumn.setSelectedRowIndex(0)
            }
            this.blur()
            console.log("nextColumn.focus()")
            nextColumn.focus()
        }
        return this
    },
    
	// previous column
	
    previousColumn: function() {
        var i = this.columnIndex()
        var prevColumn = this.browser().columns()[i-1]
        return prevColumn
    },

    selectPreviousColumn: function() {
		this.log("selectPreviousColumn this.columnIndex() = " + this.columnIndex())
        var prevColumn = this.previousColumn()
        if (prevColumn) {
            this.blur()
            prevColumn.focus()
        }
        return this
    },

	// paths
    
    browserPathArray: function() {
        var items = this.browser().columns().itemsBefore(this)
        items.push(this)
        return items
    },
    
    browserPathString: function() {
        return this.browserPathArray().map(function (column) { 
            return column.title()  // + ":" + column.node().type()
        }).join("/")
    },

    logName: function() {
        return this.browserPathString()
    },
})

