/* global define */
(function() {

    var listeners = { };
	var resolves = { };
	function forEach(arr, fn) {
		for(var i = 0, length = arr.length; i < length; i++) {
			fn(arr[i], i);
		}
	}

    function addLoadListener(listener, name) {
        if (resolves[name]) {
            // value is already loaded, call listener immediately
            listener(resolves[name]);
        } else if (listeners[name]) {
            listeners[name].push(listener);
        } else {
            listeners[name] = [ listener ];
        }
    }

    function resolve(name, value) {
        resolves[name] = value;
        var handlers = listeners[name];
        if (handlers) {
            forEach(handlers, function(listener) {
                listener(value);
            });
            // remove listeners (delete listeners[name] is longer)
            listeners[name] = 0;
        }
    }

    function req(deps, definition) {
        var length = deps.length;
        if (!length) {
            // no dependencies, run definition now
            definition();
        } else {
            // we need to wait for all dependencies to load
            var values = []
			var remaining = length;
			forEach(deps, function(dep, index) {
				addLoadListener(function(value){
                	values[index] = value;
					if (!--remaining) {
						definition.apply(0, values);
					}
				}, dep);
			});
        }
    }

    /** @export */
    require = req;

    /** @export */
	define = function(name, deps, definition) {
        if (!definition) {
            // just two arguments - bind name to value (deps) now
            resolve(name, deps);
        } else {
            // asynchronous define with dependencies
            req(deps, function() {
                resolve(name, definition.apply(0, arguments));
            });
        }
    }

}());