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

	function updateNode(node) {
		// handle remaining calculation
		var estimate = getNum(node, 'estimate');
		var actual   = getNum(node, 'actual');
		var progress = node.tag('done') ? 1 : getNum(node, 'progress') / 100;
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

			var progress = Math.round(averageTag(children, 'progress', 'estimate'));
			progress > 0 ? node.addTag('progress', progress + '%') : node.removeTag('progress');
		}
	}

	function sumTag(nodes, tag) {
		return _.reduce(nodes, function(sum, node) { return sum + getNum(node, tag) }, 0);
	}

	function averageTag(nodes, tag, weight) {
		var weightSum = sumTag(nodes, weight);
		return weightSum > 0 ? _.reduce(nodes, function(sum, node) { return sum + getNum(node, weight) * getNum(node, tag) }, 0) / weightSum : 0;
	}

	exports.editorDidLoad = function(editor) {
		model = editor.treeController.treeModel;
		model.addEventListener('treeChanged', update);
	};
});
