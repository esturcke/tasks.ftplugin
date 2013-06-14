define(function(require, exports, module) {
	function update(e) {
		var inserts = e.insertedByMode('todo');
		var updates = e.updatedByMode('todo');
		var removes = e.removedByMode('todo');
		var nodes = inserts.unionSet(updates).unionSet(removes);

		nodes.forEachNodeInSet(updateNode);
	}

	function updateNode(node) {
		node = node.parent;
		if (!node || node.type() != 'unordered') return;
		var children = node.children();
		if (children.length > 0) {
			_.each(['actual', 'estimate'], function(tag) {
				var sum = sumTag(children, tag);
				sum > 0 ? node.addTag(tag, sum) : node.removeTag(tag);
			});
		}
	}

	function sumTag(nodes, tag) {
		return _.reduce(nodes, function(sum, node) { return sum + parseFloat(node.tag(tag)) || 0 }, 0);
	}

	exports.editorDidLoad = function(editor) {
		editor.treeController.treeModel.addEventListener('treeChanged', update);
	};
});
