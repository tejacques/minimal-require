var HTML = require('../html');

function head(req, res, section) {
	return HTML`
	<script>
		console.log("Head Section rendered!");
	</script>
	`;
}

module.exports = head;