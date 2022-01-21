//////////////////////////////////////////////////
// Window Functions
//////////////////////////////////////////////////

// Close button
function CloseWindow(o) {
    o.parentNode.parentNode.remove()
}

// Moving a window : https://www.w3schools.com/howto/howto_js_draggable.asp
function DragElement(elmnt) {
    
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // if (document.getElementById(elmnt.id + "header")) {
    const toolbar = elmnt.firstElementChild//elmnt.getElementsByClass("toolbar")[0]
    if (toolbar) { // also check if it has a class "toolbar"
        // if present, the header is where you move the DIV from:
        // toolbar.onmousedown = dragMouseDown;
        // Down
        toolbar.addEventListener("touchstart",  dragMouseDown);
        toolbar.addEventListener("pointerdown",  dragMouseDown);
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        // elmnt.onmousedown = dragMouseDown;
        elmnt.removeEventListener("touchstart",  dragMouseDown);
        elmnt.removeEventListener("pointerdown",  dragMouseDown);
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        // document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        // document.onmousemove = elementDrag;
        // Up
        document.addEventListener("touchend",  closeDragElement);
        document.addEventListener("pointerup",  closeDragElement);
        // Cancel
        document.addEventListener("touchcancel",  closeDragElement);
        document.addEventListener("pointercancel",  closeDragElement);
        // Move
        document.addEventListener("touchmove",  elementDrag);
        document.addEventListener("pointermove",  elementDrag);

        // Set zindex higher than all others
        if (elmnt.parentNode.children.length > 1) {
            let maxZ = 0
            for (let i = 0; i < elmnt.parentNode.children.length; i++) {
                if (elmnt.parentNode.children[i].classList.contains('window')) {
                    if (elmnt.parentNode.children[i].style.zIndex > maxZ) {
                        maxZ = elmnt.parentNode.children[i].style.zIndex
                    }
                }
            }
            elmnt.style.zIndex = (parseInt(maxZ, 10) + 1)
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        // document.onmouseup = null;
        // document.onmousemove = null;

        // Up
        document.removeEventListener("touchend",  closeDragElement);
        document.removeEventListener("pointerup",  closeDragElement);
        // Cancel
        document.removeEventListener("touchcancel",  closeDragElement);
        document.removeEventListener("pointercancel",  closeDragElement);
        // Move
        document.removeEventListener("touchmove",  elementDrag);
        document.removeEventListener("pointermove",  elementDrag);
    }
}

// Apply movent code to all existing windows
const startingWindows = $$(".window")
for (let i = 0; i < startingWindows.length; i++) {
    DragElement(startingWindows[i])
}
// Apply movement code to all desktop icons
const startingIcons = $$(".desktop-icon")
for (let i = 0; i < startingIcons.length; i++) {
    DragElement(startingIcons[i])
}

//////////////////////////////////////////////////
// Event Handler
//////////////////////////////////////////////////

const alabaster = {};

alabaster.invocationHandlers_ = {
    'os.actions.Alert': o => {
        alert(o.message);
    },

    // Creates a new window element
    'os.entities.Window': o => {
        const hasContents = o.contents && Array.isArray(o.contents);
        const windowId = `win_${alabaster.nextId()}`;
        const winEl = domutil.create(['div', '. window resizable', `#${windowId}`, [
            ['div', '. toolbar', [
                ['span', o.title || 'Untitled Window'],
                ['button', button => {
                    button.addEventListener('click', () => {
                        alabaster.Invoke({
                            class: 'os.actions.CloseWindow',
                            ref: windowId,
                        });
                    });

                    button.innerHTML = 'X';
                }]
            ]],
            ['div', '. contents', hasContents ? o.contents : []],
        ]]);
        document.body.appendChild(winEl);
        winEl.style.width = '256px';
        winEl.style.height = '256px';
        DragElement(winEl);

        
    },

    // Destroys a window element
    'os.actions.CloseWindow': o => {
        const winEl = document.getElementById(o.ref);
        winEl.remove();
    },

    // Displays an error message and logs to console
    'os.actions.DebugAlert': o => {
        alert(`Attempt to invoke unrecognized object; it has been logged.`);
        console.log(o);
    },

    // Logs to console silently (useful for debugging)
    'os.actions.Debug': o => {
        console.log(o);
    },

     // Creates a folder
     'os.actions.CreateFolder': o => {
        const hasContents = o.contents && Array.isArray(o.contents);
        const windowId = `win_${alabaster.nextId()}`;
        const winEl = domutil.create(['div', '. desktop-icon',
            "<img src='src/img/folder icon 1 grey.png'><br>" +
            (o.label || 'Untitled Folder')
        ]);
        const parentEl = o.parentEl || document.body;
        parentEl.appendChild(winEl);
        if ( o.primaryAction ) {
            winEl.addEventListener('dblclick', () => {
                alabaster.Invoke(o.primaryAction);
            })
        }
        DragElement(winEl);
    },
    
    'os.actions.OpenFolder': o => {
        const path = o.path;
        alabaster.Invoke({
            class: 'os.entities.Window',
            title: path,
            contents: [
                ['div', fileRegistry.list(path).map(item => {
                    return ['div', el => {
                        let primaryAction;
                        if ( item.class === 'folder' ) {
                            primaryAction = {
                                class: 'os.actions.OpenFolder',
                                path: path ? (path + '.' + item.key) : item.key
                            }
                        } else if ( item.class === 'file' ) {
                            primaryAction = {
                                class: 'os.actions.Alert',
                                message: 'cannot open files yet'
                            }
                        }
                        alabaster.Invoke({
                            class: 'os.actions.CreateFolder',
                            label: item.key,
                            parentEl: el,
                            primaryAction: primaryAction,
                        });
                    }]
                })]
            ]
        });
    }
};


// Invoke performs an action depending on the "class" property of its input
// For example, the following will alert the client:
//   { class: 'os.actions.Alert', message: 'Hello' } 
alabaster.Invoke = function (object) {
    // "object.class" will determine what Invoke() does
    // If there's no "object.class", it'll just be logged
    if ( ! object.class ) {
        object = { ...object, class: 'os.actions.Debug' };
    }
    let handler = alabaster.invocationHandlers_[object.class];
    if ( ! handler ) object = { ...object, class: 'os.actions.DebugAlert' };
    handler = alabaster.invocationHandlers_[object.class];
    if ( ! handler ) console.error(alabaster.errors.TERMINAL);
    handler(object);
};

// Error messages for console logs
alabaster.errors = {};
alabaster.errors.TERMINAL = {
    title: 'TERMINAL ERROR',
    description: 'this should never happen'
};

// Incrementing number for window IDs
alabaster.sequenceId = 0;
alabaster.nextId = function () { return this.sequenceId++; };

// Temporary testing code
(() => {
    const id = fileRegistry.put({ type: 'html' }, `<h1>Hello!</h1>`);
    fileRegistry.link('alabaster.system.testFile', id);
})();