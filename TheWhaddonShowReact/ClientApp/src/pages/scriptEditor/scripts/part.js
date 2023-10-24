import { PartUpdate } from 'dataAccess/localServerModels'



export const addPersonsInfo = (parts, persons) => {

    const partPerson = parts.map(part => addPersonInfo(part, persons.find(person => person.id === part.personId)))

    return partPerson

}

export const addPersonInfo = (part, person) => {


    let updatedPart = { ...part }
    updatedPart.firstName = part.name
    updatedPart.avatarInitials = (part.name) ? part.name.split(' ').map(word => word[0]).join('') : '?';
    updatedPart.pictureRef = person?.pictureRef
    updatedPart.personName = person?.firstName


    return updatedPart

}


export const setupParts = (parts, persons) => {

    let updateParts = [...parts]

    updateParts = updateParts.map(part => addPersonInfo(part, persons))

    updateParts = updateParts.sort((a, b) => a.name.localeCompare(b.name))

    return updateParts;
}


// functions for useState hook for allocatedParts
export const addNewPart = (existingParts) => {

    const parts = [...existingParts]

    const newPart = new PartUpdate()
    newPart.new = true
    parts.push(newPart)

    return parts

}