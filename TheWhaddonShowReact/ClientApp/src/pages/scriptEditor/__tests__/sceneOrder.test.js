it.each([

])('refreshSceneOrder', (currentSceneOrder = [], newScriptItems = [], viewAsPartPerson, scenePartPersonIds) => {

		const mergedSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)

		const { head, mergedSceneOrderWithUpdatedHead } = getHead(currentSceneOrder, mergedSceneOrder)

		if (Object.keys(head).length === 0) return []

		const sortedSceneOrder = sortSceneOrder(head, mergedSceneOrderWithUpdatedHead)

		const zIndexedSceneOrder = updateZIndex(sortedSceneOrder)

		let finalSceneOrder;

		//different processes for different head types
		if (head.type === SCENE) {
			const curtainSceneOrder = (head.type === SCENE) ? refreshCurtain(zIndexedSceneOrder) : zIndexedSceneOrder

			const alignedSceneOrder = (head.type === SCENE) ? alignRight(curtainSceneOrder, viewAsPartPerson, scenePartPersonIds) : curtainSceneOrder

			finalSceneOrder = refreshHeaderFocus(alignedSceneOrder)
		}

		if (head.type === SHOW) {
			finalSceneOrder = addSceneNumbers(zIndexedSceneOrder)
		}

		if (finalSceneOrder) {
			return finalSceneOrder;
		} else {
			return []
		}


	})

it.each([

])('mergeSceneOrder', (currentSceneOrder = [], newScriptItems = []) => {

	const actualMergedSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)

	expect(mergedSceneOrder).toEqual([...currentSceneOrder, ...newScriptItems])

})

it.each([


])('getHead', (currentSceneOrder = [], mergedSceneOrder = []) => {

	const { head, mergedSceneOrderWithUpdatedHead } = getHead(currentSceneOrder, mergedSceneOrder)

	//export const getHead = (currentSceneOrder, mergedSceneOrder) => {

	//    let draftHead = null;

	//    if (currentSceneOrder.length > 0) {
	//        draftHead = currentSceneOrder[0]
	//    }
	//    else {
	//        const show = mergedSceneOrder.find(item => item.type === SHOW)
	//        const scene = mergedSceneOrder.find(item => item.type === SCENE)

	//        if (show) { draftHead = show } else { draftHead = scene }

	//    }

	//    if (draftHead === null || draftHead === undefined) {
	//        log(debug, ('Script:SceneOrder getHead - no head found'))
	//        const emptyHead = {};
	//        return {
	//            head: emptyHead, mergedSceneOrderWithUpdatedHead: []
	//        }
	//    }
////this calculates a new nextId for head to allow it to swap between different linked lists. e.g. a SCene is part ofthe Show linked list but also the head of the Scene linked list
		//const headNextId = mergedSceneOrder.filter((item) => item.previousId === draftHead.id && item.type !== COMMENT)[0].id;
		//const head = { ...draftHead, nextId: headNextId }
		//const mergedSceneOrderWithUpdatedHead = mergedSceneOrder.map(item => {

		//    if (item.id === head.id) {
		//        return { ...head }
		//    } else {
		//        return item
		//    }

		//})

		//return { head, mergedSceneOrderWithUpdatedHead };
	expect(head).toEqual(mergedSceneOrder[0])
	expect(mergedSceneOrderWithUpdatedHead).toEqual(mergedSceneOrder)

})

it.each([

])('sortSceneOrder', (head, unsortedSceneOrder) => {
////create objectMap of all items in the targetArray
//	const idToObjectMap = {};

//	for (const item of unsortedSceneOrder) {
//		idToObjectMap[item.id] = item;
//	}

//	//Sort the targetArray by nextId
//	const sortedLinkedList = [];
//	let currentId = head.id

//	while (currentId !== null) {
//		let currentItem = idToObjectMap[currentId];

//		if (currentItem) {
//			currentId = currentItem.nextId;
//			sortedLinkedList.push(currentItem);

//		} else {
//			currentId = null;
//		}
//	}

//	return sortedLinkedList;
		
	})


it.each([
])('updateZIndex ', (sortedSceneOrder) => {

	//export const updateZIndex = (sortedSceneOrder) => {

	//	const startingZIndex = 1000000;
	//	const zIndexInterval = 1000;

	//	let zIndexedSceneOrder = [...sortedSceneOrder]

	//	const resetZIndex = () => {
	//		let zIndex = startingZIndex;

	//		sortedSceneOrder.forEach(item => {
	//			item.zIndex = zIndex;
	//			zIndex = zIndex - zIndexInterval;
	//		})
	//	}

	//	const head = sortedSceneOrder[0]
	//	if (head.zIndex !== startingZIndex) {
	//		resetZIndex()
	//	}

	//	try {

	//		for (let i = 0; i < sortedSceneOrder.length; i++) {

	//			const item = sortedSceneOrder[i]

	//			if (item.zIndex && item.zIndex > 0) {
	//				//do nothing as z-Index already set and if changed will cause a re-render.
	//			} else {

	//				const previousZIndex = zIndexedSceneOrder[i - 1].zIndex
	//				const nextZIndex = zIndexedSceneOrder[i + 1].zIndex || null

	//				if (nextZIndex === null) {
	//					zIndexedSceneOrder[i].zIndex = previousZIndex - zIndexInterval
	//				} else {
	//					if (previousZIndex - nextZIndex < 2) { throw new Error('not enough space between scriptItems to insert another') }
	//					const newZIndex = Math.floor((previousZIndex + nextZIndex) / 2)
	//					zIndexedSceneOrder[i].zIndex = newZIndex
	//				}

	//			}
	//		}
	//	} catch {
	//		resetZIndex()
	//	}

	//	return zIndexedSceneOrder;
	/*	}*/
})


it.each([

])('refreshHeaderFocus', (sceneOrder, scenePartIds) => {

	//export const refreshHeaderFocus = (sceneOrder, scenePartIds = null) => {
	//const scene = sceneOrder.find(item => item.type === SCENE)
	//const synopsis = sceneOrder.find(item => item.type === SYNOPSIS)
	//const initialStaging = sceneOrder.find(item => item.type === INITIAL_STAGING)
	//const partIds = scenePartIds || scene.partIds

	//scene.previousFocusId = scene.previousId
	//scene.nextFocusId = synopsis.id
	//synopsis.previousFocusId = scene.id
	//synopsis.nextFocusId = partIds[0]
	//initialStaging.previousFocusId = partIds[partIds.length - 1]
	//initialStaging.nextFocusId = initialStaging.nextId

	//const newSceneOrder = sceneOrder.map(item => {
	//	if (item.type === SCENE) { return scene }
	//	if (item.type === SYNOPSIS) { return synopsis }
	//	if (item.type === INITIAL_STAGING) { return initialStaging }
	//	return item
	//})

	//return newSceneOrder;

})


it.each([

])('alignRight',(sceneOrder, viewAsPartPerson, scenePartPersonIds, scriptItemUpdates = []) => {

	//const mergedSceneOrder = mergeSceneOrder(sceneOrder, scriptItemUpdates)

	////work out alignment
	//const partIdsOrder = [...new Set(mergedSceneOrder.map(item => item.partIds[0]).filter(id => id !== undefined))]

	//const defaultRighthandPartId = partIdsOrder[1] //defaults the second part to come up as the default right hand part.

	//const righthandPartId = scenePartPersonIds?.find(ids => ids.partId === viewAsPartPerson?.id || ids.personId === viewAsPartPerson?.id)?.id || defaultRighthandPartId

	//const alignedSceneOrder = mergedSceneOrder.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

	//return alignedSceneOrder


})


it.each([

])('getSceneORderUpdates',(currentScriptItemUpdates, currentScriptItems, sceneOrders) => {

	//const sceneIds = [currentScriptItemUpdates.map(item => item.parentId)]
	//const uniqueSceneIds = [...new Set(sceneIds)]

	////output variables
	//let sceneOrderUpdates = []
	//let previousCurtainUpdates = []

	//uniqueSceneIds.forEach(sceneId => {

	//	const nextSceneIdFromScriptItemUpdates = currentScriptItemUpdates.find(item => item.id === sceneId)?.nextId || null
	//	const nextSceneId = nextSceneIdFromScriptItemUpdates || currentScriptItems[sceneId]?.nextId || null

	//	const newSceneScriptItems = currentScriptItemUpdates.filter(item => item.parentId === sceneId || item.id === sceneId)
	//	const newSceneOrder = refreshSceneOrder(sceneOrders[sceneId], newSceneScriptItems)

	//	if (newSceneOrder.length > 0) { //this can occur if the scene is inActive
	//		sceneOrderUpdates.push(newSceneOrder)

	//		if (nextSceneId) {
	//			const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1]?.curtainOpen;
	//			previousCurtainUpdates.push({ sceneId: nextSceneId, previousCurtainOpen })
	//		}
	//	}
	//})

	//return { sceneOrderUpdates, previousCurtainUpdates }
})



it.each([

]) ('alignRightIfAffectedByViewAsPartPerson', (scene, viewAsPartPerson, sceneOrders, currentPartPersons) => {

	//const scenePartPersonIds = scene.partIds.map(partId => currentPartPersons[partId]).map(partPerson => ({ sceneId: scene.id, partId: partPerson.id, personId: partPerson.personId }))

	//const matchesPart = scenePartPersonIds.some(partPerson => partPerson.partId === viewAsPartPerson.id)

	//if (!matchesPart) {
	//	const matchesPerson = scenePartPersonIds.some(partPerson => partPerson.personId === viewAsPartPerson.id)
	//	if (!matchesPerson) return [];
	//}

	//const newSceneOrder = alignRight(sceneOrders[scene.id], viewAsPartPerson, scenePartPersonIds)

	//return newSceneOrder
})