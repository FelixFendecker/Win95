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