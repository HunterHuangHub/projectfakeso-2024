import { filterQuestionsBySearchBar} from './fakestackoverflow'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { UserTypes, QuestionTypes, Components, getNumberOfTags, sortByNewest} from './utils'

export default function TagsPage ({ stateInfo }) {
  // STATES

  const [tags, setTags] = useState([])
  const [numsOfEachTags, setNumsOfEachTags] = useState([])
  useEffect(() => {
    async function setTagInfo() {
      const response = await axios.get('http://localhost:8000/tags')
      setTags(response.data)

      let numsOfEachTags = await getNumberOfTags(response.data)
      setNumsOfEachTags(numsOfEachTags)
    }

    setTagInfo()
  }, [])

  let backButton
  if (stateInfo.user_type !== UserTypes.GUEST) {
    backButton = <button id = 'tags-page-ask-question-button' onClick = { () => { stateInfo.setQuestionType(QuestionTypes.NEW); stateInfo.setComponent(Components.POST_QUESTION_PAGE) } }>Ask Question</button>
  }

  return (
    <div id = 'tags-page'>
      <div id = 'tags-page-row1'>
        <span id = 'num-of-tags'>{ tags.length } tags</span>
        <span id = 'all-tags-text'>All Tags</span>
        { backButton }
      </div>
      <div className = 'grid-container'>
        { tags.map((tag, index) => (
          <div className = 'grid-item' key = { index }>
            <div className = 'tag-button' onClick = { async () => { stateInfo.setQuestionsToDisplay(sortByNewest(await filterQuestionsBySearchBar([], [tag.name]))); stateInfo.setComponent(Components.QUESTIONS_PAGE) } } >{tag.name}</div>
            <div> { numsOfEachTags[index] } questions </div>
            
          </div>
        )) }
      </div>
    </div>
  )
}
