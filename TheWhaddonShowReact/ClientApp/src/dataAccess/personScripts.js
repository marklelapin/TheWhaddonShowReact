import { log, PERSON as logType } from './logging'

export const categorisePersons = (persons, tags = []) => {

    const activePersons = persons.filter(person => person.isActive === true);

    let matchingTags = [];
    let frontStage = [];
    let backStage = [];

    activePersons.forEach(person => {
        let tagMatch = (tags.length === 0) ? false : true;
        tags.forEach(tag => {

            if (!person.tags.includes(tag)) {
                return tagMatch = false;
            }
        }
        )

        if (person.isActor === false && person.isSinger === false) {
            return backStage.push(person);
        } else
            if (tagMatch) {

                matchingTags.push(person);

            }
            else {
                frontStage.push(person);
            }

    })


    return { matchingTags, frontStage, backStage };
}


export const addFriendlyName = (persons) => {
    try {
        const personsWithFriendlyName = persons.map(person => {
            if (persons.filter(persons => persons.firstName === person.firstName).length > 1) {
                return { ...person, friendlyName: `${person.firstName} ${person.lastName[0]}` }
            }
            return { ...person, friendlyName: person.firstName };
        })
    } catch (error) {
        log(logType, 'error in addFriendlyName:', error)
        return persons;
    }


    return personsWithFriendlyName
}

