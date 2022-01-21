// Concept API for file storage

/* DEFINITIONS

  LINKED FILES

    Linked files exist in a traditional tree hierarchy of folders.
    The concept of hard links is implemented by allowing a file to
    be linked in multiple locations on the tree.

  UNLINKED FILES

    Unlinked files do not exist in any folder, but they still have
    a filetype and name associated with them so they can be searched.

*/

const FileRegistryError = (method, subject, constraint) => {
    return new Error(`Error in call to ${method}: ${subject} ${constraint}`);
}

const fileRegistry = {
    data_: {
        files: [],
        idToFile: {},
        tree: {},
    },
};

fileRegistry.put = function (meta, contents) {
    if ( ! meta ) {
        meta = {};
    }

    if ( typeof meta === 'string' ) {
        meta = { type: meta };
    }

    if ( ! meta.type ) meta.type = 'file';

    meta.id = '' +
        Math.random().toString(16).slice(2) +
        (new Date()).getTime()
        ;

    const node = { meta, contents };
    this.data_.files.push(node);
    this.data_.idToFile[meta.id] = node;

    return meta.id;
};

fileRegistry.getMeta = function (ref) {
    return this.data_.idToFile[ref].meta;
}

fileRegistry.getData = function (ref) {
    return this.data_.idToFile[ref].contents;
}

fileRegistry.link = function (path, id, delim) {
    // File paths traditionally use '/', but since this system
    // is fundamentally different '.' will be used by default.
    if ( ! delim ) delim = '.';
    const parts = path.split(delim);
    const basename = parts.pop()
    let folder = this.data_.tree;
    for ( part of parts ) {
        // Create this subdirectory if it doesn't exist
        if ( ! folder.hasOwnProperty(part) ) {
            folder[part] = {
                class: 'folder',
                children: {}
            };
        }
        folder = folder[part].children;
    }
    folder[basename] = {
        class: 'file',
        ref: id
    };
}

fileRegistry.list = function (path) {
    const parts = ( ! path ) ? [] : path.split('.');
    let folder = this.data_.tree;
    for ( part of parts ) {
        if ( ! folder.hasOwnProperty(part) ) {
            throw FileRegistryError('fileRegistry.list', 'path', 'must exist');
        }
        folder = folder[part].children;
    }
    const shallowFolder = [];
    for ( let k in folder ) {
        let shallowNode = null;
        switch ( folder[k].class ) {
            case 'file':
                const meta = this.getMeta(folder[k].ref);
                shallowNode = {
                    // TODO: add file type
                    key: k,
                    class: 'file',
                    meta,
                    ref: folder[k].ref,
                };
                break;
            case 'folder':
                shallowNode = {
                    key: k,
                    class: 'folder',
                }
                break;
        }
        shallowFolder.push(shallowNode);
    }
    return shallowFolder;
}
