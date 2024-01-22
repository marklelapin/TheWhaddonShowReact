import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import { Button } from 'reactstrap';
import TagsInput from '../../../components/Forms/TagsInput';
import { Input } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';

//Utils
import { updateSearchParameters, setShowSceneSelector } from '../../../actions/scriptEditor';
import classnames from 'classnames';
import s from '../Script.module.scss'
function ScriptSearch(props) {

    const { isModal } = props;

    const dispatch = useDispatch();

    const searchParameters = useSelector(state => state.scriptEditor.searchParameters)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const currentUser = useSelector(state => state.user.currentUser)

    const viewAsPartPersonName = (viewAsPartPerson.personId === undefined) ? viewAsPartPerson.firstName : viewAsPartPerson.name

    const highlightMessage = (viewAsPartPerson?.id === currentUser?.id) ? 'My scenes' : `${viewAsPartPersonName}'s scenes`

    const tagOptions = ['Music', 'Comedy', 'Intro', 'Guy To Do', 'Mark B to Do', 'Mark C to Do', 'Heather to Do']

    const tags = searchParameters.tags

    const unselectedTags = tagOptions.filter(tag => !tags.includes(tag))

    const handleChange = (type, value) => {
        let newSearchParameters;
        switch (type) {
            case 'addTag':
                newSearchParameters = { ...searchParameters, tags: [...searchParameters.tags, value] }
                break;
            case 'removeTag':
                newSearchParameters = { ...searchParameters, tags: searchParameters.tags.filter(tag => tag !== value) }
                break;
            case 'myScenes':
                newSearchParameters = { ...searchParameters, myScenes: value }
                break;
            case 'characters':
                newSearchParameters = { ...searchParameters, characters: value }
                break;
            default: return;
        }

        dispatch(updateSearchParameters(newSearchParameters))
    }


    return (

        <div className={s.scriptSearch}>
            <h2>Search</h2>
            <div className={s.closeIcon}>
                <Icon icon="cross" onClick={() => dispatch(setShowSceneSelector(false))} />
            </div>
            <div className={s.scriptSearchButtons}>
                <Button
                    size='sm'
                    color={searchParameters.myScenes ? 'secondary' : 'primary'}
                    outline={searchParameters.myScenes ? true : false}
                    onClick={() => handleChange('myScenes', false)}
                    className={s.scriptSearchAll}
                >All</Button>
                <div className={s.scriptSearchOr}>or</div>
                <Button
                    size='sm'
                    color={searchParameters.myScenes ? 'primary' : 'secondary'}
                    outline={searchParameters.myScenes ? false : true}
                    onClick={() => handleChange('myScenes', true)}
                    className={classnames(s.scriptSearchMine,searchParameters.myScenes ? s.active : null)}
                >
                    <div className={classnames(isModal ? s.highlight : null)} >{highlightMessage}</div></Button>
            </div>
            <div className={s.scriptSearchCharacters}>
                <Input
                    type="text"
                    value={searchParameters.characters}
                    onChange={(e) => handleChange('characters', e.target.value)}
                    name="search"
                    id="search"
                    placeholder="Search"
                />
            </div>

            <div className={s.scriptSearchTags}>
                <TagsInput
                    tags={tags}
                    tagOptions={unselectedTags}
                    onClickAdd={(tag) => handleChange('addTag', tag)}
                    onClickRemove={(tag) => handleChange('removeTag', tag)}
                />
            </div>
            


        </div>


    )
}

export default ScriptSearch;