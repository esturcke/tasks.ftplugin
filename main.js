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
			var tags = ['estimate', 'actual'];
			for (var i = 0; i < tags.length; i++) {
				var sum = sumTag(children, tags[i]);
				if (sum > 0) {
					node.addTag(tags[i], sum);
				}
				else {
					node.removeTag(tags[i]);
				}
			}
		}
	}

	function sumTag(nodes, tag) {
		var sum = 0;
		for (var i = 0; i < nodes.length; i++) sum += parseFloat(nodes[i].tag(tag)) || 0;
		return sum;
	}

	exports.editorDidLoad = function(editor) {
		editor.treeController.treeModel.addEventListener('treeChanged', update);
	};
});
