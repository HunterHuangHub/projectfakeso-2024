import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Components, TextTypes, QuestionTypes, getTagsByIds, generateTagsString, verifyQuestionPageInputs, UserInputSection, sortByNewest} from './utils'

export default function PostQuestionPage ({ stateInfo }) {

  // Contains all tags that exists:
  const [currentTags, setCurrentTags] = useState([])
  useEffect(() => {
    axios.get('http://localhost:8000/tags').then(function(response) {
      setCurrentTags(response.data)
    })
  }, [])

  // POST QUESTION BUTTON
  // 1. Verify question format
  // 2. Send question to backend
  // 3. Bring user back to questions page
  function PostQuestionButton () {
    async function postQuestion () {
      // Initialize question attributes:
      const title = document.getElementById('post-question-title-input-box').value
      const summary = document.getElementById('post-question-summary-input-box').value
      const text = document.getElementById('post-question-text-input-box').value
      let tags = document.getElementById('post-question-tags-input-box').value.replace(/\s+/g, ' ').trim().split(' ')
      const askedBy = stateInfo.user_profile.username
      const askDate = new Date()
      const answers = []
      const views = 0

      // Verify Attributes:
      if (verifyQuestionPageInputs(title, text, tags) === false) {
        return
      }

      // Create Question:
      let question = { title, summary, text, tags, askedBy, askDate, answers, views }

      // Send question to backend:
      if (stateInfo.questionType === QuestionTypes.OLD) {
        question._id = stateInfo.question._id
      }
      await axios.post('http://localhost:8000/post_question', { question: question, profile: stateInfo.user_profile })

      // Displays questions from backend:
      axios.get('http://localhost:8000/questions').then(function(response) { stateInfo.setQuestionsToDisplay(sortByNewest(response.data)) })

      // Set colors of sidebar & filter buttons:
      document.getElementById('questions-link').style.backgroundColor = 'lightgrey'
      document.getElementById('tags-link').style.backgroundColor = 'white'
      stateInfo.setButtonColors({ newestColor: 'gray', activeColor: 'white', unansweredColor: 'white' })

      // Switch back to questions page
      stateInfo.setComponent(Components.QUESTIONS_PAGE)
    }

    return (<button id = 'post-question-button' onClick = { postQuestion }>Post Question</button>)
  }

  async function deleteQuestion(id) {
    await axios.post('http://localhost:8000/delete_question', { id: id })

    // gets all questions from backend and sets state to display them
    axios.get('http://localhost:8000/questions').then(function(response) { stateInfo.setQuestionsToDisplay(sortByNewest(response.data)) })

    // set colors of sidebar
    document.getElementById('questions-link').style.backgroundColor = 'lightgrey'
    document.getElementById('tags-link').style.backgroundColor = 'white'

    // set colors of filter buttons
    stateInfo.setButtonColors({ newestColor: 'gray', activeColor: 'white', unansweredColor: 'white' })

    // switch back to questions page
    stateInfo.setComponent(Components.QUESTIONS_PAGE)

  }

  function DeleteQuestionButton() {
    return (<button id = 'delete-question-button' onClick = {() => {deleteQuestion(stateInfo.question._id)} }>Delete Question</button>)
  }

  if (stateInfo.questionType === QuestionTypes.NEW) {
    return (
      <div id = 'post-question-page'>
        <UserInputSection title = 'Question Title*' captions = 'Limit title to 50 characters or less'
        textId = 'post-question-title-input-box' errorId = 'post-question-title-error' textType = {TextTypes.TITLE} />

        <UserInputSection title = 'Question Summary*' captions = 'Limit summary to 140 characters or less'
        textId = 'post-question-summary-input-box' errorId = 'post-question-summary-error' textType = {TextTypes.SUMMARY} />

        <UserInputSection title = 'Question Text*' captions = 'Add details'
        textId = 'post-question-text-input-box' errorId = 'post-question-text-error' textType = {TextTypes.TEXT}/>

        <UserInputSection title = 'Tags*' captions = 'Add keywords separated by whitespace'
        textId = 'post-question-tags-input-box' errorId = 'post-question-tags-error' textType = {TextTypes.TAGS}/>

        <div><PostQuestionButton /></div>
      </div>
    )
  }
  else {
    return (
      <div id = 'post-question-page'>
        <UserInputSection title = 'Question Title*' captions = 'Limit title to 50 characters or less'
        textId = 'post-question-title-input-box' errorId = 'post-question-title-error' textType = {TextTypes.TITLE} value = {stateInfo.question.title}/>

        <UserInputSection title = 'Question Summary*' captions = 'Limit summary to 140 characters or less'
        textId = 'post-question-summary-input-box' errorId = 'post-question-summary-error' textType = {TextTypes.SUMMARY} value = {stateInfo.question.summary}/>

        <UserInputSection title = 'Question Text*' captions = 'Add details'
        textId = 'post-question-text-input-box' errorId = 'post-question-text-error' textType = {TextTypes.TEXT} value = {stateInfo.question.text}/>

        <UserInputSection title = 'Tags*' captions = 'Add keywords separated by whitespace'
        textId = 'post-question-tags-input-box' errorId = 'post-question-tags-error' textType = {TextTypes.TAGS} value = {generateTagsString(getTagsByIds(stateInfo.question.tags, currentTags))}/>

        <div><PostQuestionButton /> <DeleteQuestionButton /></div>
      </div>
    )
  }
}



