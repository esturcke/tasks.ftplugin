define(function(require, exports, module) {
	var model;

	function update(e) {
		var inserts = e.insertedByMode('todo');
		var updates = e.updatedByMode('todo');
		var removes = e.removedByMode('todo');
		var nodes = inserts.unionSet(updates).unionSet(removes);
		model.beginUpdates();
		nodes.forEachNodeInSet(updateNode);
		model.endUpdates();
	}

	function getNum(node, tag) {
		return parseFloat(node.tag(tag)) || 0;
	}

	function getNumWithFallback(node, tag, fallbackTag) {
		return parseFloat(node.tag(tag)) || parseFload(node.tag(fallbackTag)) || 0;
	}

	function updateNode(node) {
		// handle remaining calculation
		var estimate = getNum(node, 'estimate');
		var actual   = getNum(node, 'actual');
		var progress = node.tag('done') === "" ? 1 : getNum(node, 'progress') / 100;
		var remaining = progress > 0 ? Math.round( 10 * actual * (1 - progress) / progress ) / 10 : 0;
		if (remaining != getNum(node, 'remaining')) {
			remaining > 0 ? node.addTag('remaining', remaining) : node.removeTag('remaining');
		}

		node = node.parent;
		if (!node || node.type() != 'unordered') return;
		var children = node.children();
		if (children.length > 0) {
			_.each(['actual', 'estimate'], function(tag) {
				var sum = sumTag(children, tag);
				sum > 0 ? node.addTag(tag, sum) : node.removeTag(tag);
			});

			var weightSum = sumTag(children, 'actual') + sumTag(children, 'remaining');
			var progress  = weightSum > 0 ? _.reduce(children, function(sum, node) {
				return sum + (getNum(node, 'actual') + getNum(node, 'remaining')) * (node.tag('done') === "" ? 100 : getNum(node, 'progress'))
			}, 0) / weightSum : 0;
			progress > 0 ? node.addTag('progress', Math.round(progress * 10) / 10 + '%') : node.removeTag('progress');
		}
	}

	function sumTag(nodes, tag) {
		return _.reduce(nodes, function(sum, node) { return sum + getNum(node, tag) }, 0);
	}

	function sumTagWithFallback(nodes, tag, fallbackTag) {
		return _.reduce(nodes, function(sum, node) { return sum + getNumWithFallback(node, tag, fallbackTag) }, 0);
	}

	exports.editorDidLoad = function(editor) {
		model = editor.treeController.treeModel;
		model.addEventListener('treeChanged', update);
	};
});
