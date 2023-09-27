import { PartUpdate } from 'dataAccess/localServerModels'



export const updatePersonInfo = (part,persons) => {

    const allocatedPerson = persons.find(person => person.id === part.personId) || null

    const updatedPart = {
        ...part, firstName: part.name
        , avatarInitials: (part.name) ? part.name.split(' ').map(word => word[0]).join('') : '?'
        , pictureRef: (allocatedPerson) ? allocatedPerson.pictureRef : null
        , personName: (allocatedPerson) ? allocatedPerson.firstName : null
    }

    return updatedPart

}



export const setupParts = (parts, persons) => {

    let updateParts = [...parts]

    updateParts = updateParts.map(part => updatePersonInfo(part, persons))

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