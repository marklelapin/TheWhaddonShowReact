import { mockCurrentScriptItems } from './mockData';

import { getSurroundingScriptItems } from '../scripts/scriptItem';


it('getSurroundingScriptItems nextId = null', () => {
    const scriptItem = mockCurrentScriptItems['s7'];
    const previousScriptItem = mockCurrentScriptItems['s6'];

    const expectedResult = [previousScriptItem, scriptItem]
    const actualResult = getSurroundingScriptItems(scriptItem, mockCurrentScriptItems)

    logResults('surroundingScriptItems nextId = null', expectedResult, actualResult)

    expect(actualResult).toEqual(expectedResult);

});

it('getSurroundingScriptItems both nextId and previousId', () => {
    const scriptItem = mockCurrentScriptItems['s2'];
    const previousScriptItem = mockCurrentScriptItems['s1'];
    const nextScriptItem = mockCurrentScriptItems['s3'];

    const expectedResult = [previousScriptItem, scriptItem, nextScriptItem]
    const actualResult = getSurroundingScriptItems(scriptItem, mockCurrentScriptItems)

    logResults('surroundingScriptItems both nextId and previousId', expectedResult, actualResult)

    expect(actualResult).toEqual(expectedResult);
});



const logResults = (testName,expectedResult,actualResult) => {

    console.log(testName.toUpperCase())
    console.log('expectedResult')
    console.log(expectedResult)
    console.log('actualResult')
    console.log(actualResult)
}