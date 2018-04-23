function removeItem(card){
  let list = card.parentNode;
	for (let i = list.children.length -1; i >= 0; i --) { 
		if (card.id.toString() !== list.children[i].id) {
			list.removeChild(list.children[i]);
		}
	}
}