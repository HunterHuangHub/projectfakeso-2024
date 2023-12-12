import React from 'react'
import axios from 'axios'
import { Components, verifyLinks, TextTypes, UserInputSection, getQuestionById} from './utils.js'

export default function PostAnswerPage ({ stateInfo }) {
  function PostAnswerButton () {
    async function postAnswer () {
      const text = document.getElementById('post-answer-text-input-box').value
      const ans_by = stateInfo.user_profile.username
      const ans_date_time = new Date()

      if (verifyAnswerPageInputs(text) === false) {
        return
      }
      const answer = { text, ans_by, ans_date_time }
      
      try {
        const question = await stateInfo.question;
        await axios.post('http://localhost:8000/post_answer', { answer, question });
        stateInfo.setQuestion(await getQuestionById(stateInfo.question._id));
        stateInfo.setComponent(Components.ANSWERS_PAGE);
      } catch (error) {
        console.error('Error posting answer:', error);
      }     
    }

    function verifyAnswerPageInputs (text) {
      if (text === '') {
        document.getElementById('post-answer-text-error').innerHTML = 'Text can not be empty.'
        return false
      } else {
        document.getElementById('post-answer-text-error').innerHTML = ''
      }
      if (!verifyLinks(text)) {
        document.getElementById('post-answer-text-error').innerHTML = 'Link is not in correct format.'
        return false
      }
      return true
    }

    return <button id = 'post-answer-button' onClick = { postAnswer }>Post Answer</button>
  }

  return (
    <div id = 'post-answer-page'>
      <UserInputSection title = 'Answer Text*' captions = '' textId = 'post-answer-text-input-box'
        errorId = 'post-answer-text-error' textType = { TextTypes.TEXT} />

      <PostAnswerButton />
    </div>
  )
}
