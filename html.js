
function HTMLTemplate(literalSections, values) {
	this.literalSections = literalSections;
	this.values = values;
}

const primitives = {
	string: 1,
	boolean: 1,
	number: 1
}
const resolved = Promise.resolve(null);
HTMLTemplate.prototype.subscribe = function({ onNext, onError, onDone }) {
	// Use raw literal sections: we don’t want
	// backslashes (\n etc.) to be interpreted
	let raw = this.literalSections.raw;

	let promise = resolved;
	let context = { promise: promise };
	
	function then(context, val) {
		if(onError) {
			return context.promise = context.promise.then(next(val), onError);
		} else {
			return context.promise = context.promise.then(next(val));
		}
	}
	function next(val) {
		return function() {
			onNext(val);
		}
	}
	
	function handleNext(context, value) {
		if (primitives[typeof (value)]) {
			console.log("Handling Primitive");
			return then(context, value);
		} else if (Array.isArray(value)) {
			console.log("Handling Array");
			return Promise.all(value.map(v => handleNext(context, v)));
		} else if (value instanceof HTMLTemplate) {
			console.log("Handling HTMLTemplate");
			return context.promise = context.promise.then(function() {
				return new Promise(function(resolve, reject) {
					value.subscribe({
						onNext,
						onError: reject,
						onDone: resolve
					});
				});
			});
		} else if (value instanceof Promise) {
			console.log("Handling Promise");
			return context.promise = context.promise.then(function() {
				let newContext = { promise: value };
				return value.then(function(res) {
					console.log("Promise resolved");
					return handleNext(newContext, res);
				});
			});
		} else {
			console.log("Unhandled input", value);
			return resolved;
		}
	}

	this.values.forEach((value, i) => {
		// Handle the literal section preceding
		// the current substitution
		handleNext(context, raw[i]);
		handleNext(context, value);
	});

	// Take care of last literal section
	// (Never fails, because an empty template string
	// produces one literal section, an empty string)
	function done() {
		onNext(raw[raw.length-1]);
		onDone();
	}
	context.promise = context.promise.then(done, done);

}
module.exports = function HTML(literalSections, ...values) {
	return new HTMLTemplate(literalSections, values);
}