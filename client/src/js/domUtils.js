var domutil = {};

// *** Portable element create utility ***
// ( written by Eric Dubé, MIT license )
//
// Allows you to define DOM elements from a list, like this:
//
// domutil.create([
//     'div',            // First item is always the tag name
//     '. some classes', // A string starting with "." sets classes
//     '#anId',          // A string starting with "#" sets id
//     [                 // A nested array defines child elements
//         ['p', 'hello'],
//         [
//             'p',
//             'world'   // "world" does not start with "." or "#", so it's just text
//         ]
//     ]
// ])

domutil.create = (spec) => {
    const nodeName = spec[0]; // eg: "div"
    const el = document.createElement(nodeName);

    if ( spec.length > 1 ) for ( let arg of spec.slice(1) ) {
        if ( typeof arg === 'function' ) {
            const fn = arg;
            fn(el);
        } else if ( Array.isArray(arg) ) {
            for ( let subSpec of arg ) {
                el.appendChild(domutil.create(subSpec));
            }
        } else if ( typeof arg === 'string' ) {
            if ( arg.startsWith('.') ) {
                arg = arg.slice(1).trim();
                let parts = arg.split(' ');
                for ( let part of parts ) {
                    el.classList.add(part);
                }
            } else if ( arg.startsWith('#') ) {
                arg = arg.slice(1).trim();
                el.id = arg;
            } else {
                // TODO: sanitize if text is provided this way
                el.innerHTML = arg;
            }
        }
    }

    return el;
};