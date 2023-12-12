import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { UserTypes, Components, QuestionTypes, getTagsByIds, getTimeString, Tags, sortByNewest,sortByActive,sortByUnanswered, getQuestionById } from './utils'

export default function QuestionsPage ( {stateInfo} ) {
  // STATES
  // Contains all existing tags
  const [currentTags, setCurrentTags] = useState([])
  useEffect(() => {
    axios.get('http://localhost:8000/tags').then(function(response) {
      setCurrentTags(response.data)
    })
  }, [])

  // Contains page number 
  const [pageNumber, setPageNumber] = useState(1)

  // Determines correct questions display

  let firstQuestionId = (pageNumber - 1) * 5
  let lastQuestionId = pageNumber * 5
  let questions = []
  let onFirstPage = pageNumber === 1
  let onLastPage = lastQuestionId >= stateInfo.questionsToDisplay.length
  for (let i = firstQuestionId; i < lastQuestionId && i < stateInfo.questionsToDisplay.length; i++) {
    questions.push(stateInfo.questionsToDisplay[i]);
  }

  // Determining correct questions for current page
  // Updates view count of the question
  async function updateViewCount(id) {
    // sending answer to backend server
    await axios.post('http://localhost:8000/update_view_count', { id })
  }

  // Page change buttons
  function showPrevPage() {
    if (!onFirstPage) {
      setPageNumber(pageNumber-1)
    }
  }

  function showNextPage() {
    if (!onLastPage) {
      setPageNumber(pageNumber+1)
    }
  }
  
  // Question Filter by type: {sortByNewest, sortByActive, sortByUnanswered}
  function QuestionsFilter () {
    return (
        <span id = "questions-filter">
            <button id = 'sort-by-newest-button' style = { { backgroundColor: stateInfo.buttonColors.newestColor } }
            onClick = { () => { 
              axios.get('http://localhost:8000/questions').then(function(response) {
                stateInfo.setQuestionsToDisplay(sortByNewest(response.data))
              });
              stateInfo.setButtonColors({ newestColor: 'gray', activeColor: 'white', unansweredColor: 'white' }) } }>Newest</button>
            <button id = 'sort-by-active-button' style = { { backgroundColor: stateInfo.buttonColors.activeColor } }
            onClick = { () => {
              axios.get('http://localhost:8000/questions').then(function(response) {
                stateInfo.setQuestionsToDisplay(sortByActive(response.data))
              });
              stateInfo.setButtonColors({ newestColor: 'white', activeColor: 'gray', unansweredColor: 'white' }) } }>Active</button>
            <button id = 'sort-by-unanswered-button' style = { { backgroundColor: stateInfo.buttonColors.unansweredColor } }
            onClick = { () => { 
              axios.get('http://localhost:8000/questions').then(function(response) {
                stateInfo.setQuestionsToDisplay(sortByUnanswered(response.data))
              });
              stateInfo.setButtonColors({ newestColor: 'white', activeColor: 'white', unansweredColor: 'gray' }) } }>Unanswered</button>
        </span>
    )
  }

  // creates the table of questions
  function QuestionRows () {
    const questionRows = questions.map(question => (
        <tr className = 'question-table-row' key = { question._id }>
            <td className = 'question-table-col1'>
                <span className = 'number-of-reputation-and-answers-and-views'>{question.reputation} reputation <br></br> {question.answers.length} answers <br></br> {question.views} views</span>
            </td>

            <td className = 'question-table-col2'>
                <span className = 'question-title-and-tags'>
                    <span className = 'question-title' onClick = { async () => 
                      { await updateViewCount(question._id); stateInfo.setQuestion(await getQuestionById(question._id)); stateInfo.setComponent(Components.ANSWERS_PAGE) } }>{ question.title }</span>
                    <br></br>
                    <br></br>

                    <span className = 'question-summary'> {question.summary} </span>

                    <br></br>
                    <br></br>
                    
                    <Tags id = 'answer-page-tags' tags = { getTagsByIds(question.tags, currentTags) } />
                </span>
            </td>

            <td className = 'question-table-col3'>
                <span className = 'question-time'>{ question.asked_by } asked { getTimeString(question.ask_date_time) }
                </span>
            </td>
        </tr>
    ))

    return questionRows
  }

  let postQuestionButton
  if (stateInfo.user_type !== UserTypes.GUEST) {
    postQuestionButton = <button id = 'questions-page-ask-question-button' onClick = { () => { stateInfo.setQuestionType(QuestionTypes.NEW); stateInfo.setComponent(Components.POST_QUESTION_PAGE) } }>Ask Question</button>
  }

  return (
    <div id = 'questions-page'>
      <div id = 'questions-page-row1'>
        <span id = 'all-questions-text'>All Questions</span>
        { postQuestionButton }
      </div>
      <div id = 'questions-page-row2'>
        <span id = 'total-num-questions'>{ stateInfo.questionsToDisplay.length } questions</span>
        <QuestionsFilter />
      </div>

      { stateInfo.questionsToDisplay.length === 0
        ? <div id = 'no-questions-text'>No Results Found</div>
        : <table id = 'questions-table'>
          <tbody>
              <QuestionRows />
          </tbody>
        </table> }

        <div className = "page-buttons">
            { onFirstPage ? <span id = "prev-button" className = "disabled" onClick = { showPrevPage }>&lt;</span>
                        : <span id = "prev-button" onClick = { showPrevPage }>&lt;</span> }
            { onLastPage ? <span id = "next-button" className = "disabled" onClick = { showNextPage }>&gt;</span>
                       : <span id = "next-button" onClick = { showNextPage }>&gt;</span> }
        </div>
    </div>
  )
}
