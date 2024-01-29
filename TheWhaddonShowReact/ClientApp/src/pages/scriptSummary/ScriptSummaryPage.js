import React from 'react';

import ScriptSummary from './ScriptSummary';
//SummaryTypes
export const SHOW = 'show'
export const TECHNICAL = 'technical'
export const STAGE_MANAGEMENT = 'stageManagement'
export const CASTING = 'casting'

const ScriptSummaryPage = (props) => {

    const { summaryType = 'None' } = props

    return (
        <>
            <h1>Script Summary</h1>
            <ScriptSummary summaryType={summaryType} />
        </>
    )

}
export default ScriptSummaryPage;

