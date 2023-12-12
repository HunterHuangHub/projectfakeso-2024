import React, { useState, useEffect } from 'react'
import { Components, UserTypes, QuestionTypes, sortAnswers, getTagsByIds, getTimeString, Tags } from './utils.js'
import { fetchAnswers, fetchTags } from './apiservice.js'
import axios from 'axios'

export default function AnswersPage ({ stateInfo }) {
  const [currentAnswers, setCurrentAnswers] = useState([])
  const [currentTags, setCurrentTags] = useState([])

  useEffect(() => {
    fetchAnswers().then(response => setCurrentAnswers(response.data));
  }, []);
  
  useEffect(() => {
    fetchTags().then(response => setCurrentTags(response.data));
  }, []);
  
  // Page Number
  const [pageNumber, setPageNumber] = useState(1)

  // Vote Count
  const [voteCount, setVoteCount] = useState(stateInfo.question.reputation)

  function getAnswersByIds(answerIds) {
    return answerIds.map(id => currentAnswers.find(answer => answer._id === id)).filter(answer => answer !== undefined);
  }  

  function createHyperlinks(text) {
    const regex = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    return text.replace(regex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  let firstAnswerId = (pageNumber - 1) * 5
  let lastAnswerId = pageNumber * 5
  let onFirstPage = pageNumber === 1
  let onLastPage = lastAnswerId >= stateInfo.question.answers.length

  // Generates answer table
  function AnswerRows({ answerIds }) {
    const answers = getAnswersByIds(answerIds);
    sortAnswers(answers);
  
    const answersToDisplay = answers.slice(firstAnswerId, Math.min(lastAnswerId, stateInfo.question.answers.length));
  
    if (answersToDisplay.length === 0) {
      return <p>No answers available.</p>; 
    }
  
    return answersToDisplay.map((answer, index) => (
      <tr className='answers-table-row' key={answer._id || index}> {/* Use unique id if available */}
        <td className='answers-table-col1'>
          <div dangerouslySetInnerHTML={{ __html: createHyperlinks(answer.text) }} />
        </td>
        <td className='answers-table-col2'>
          <span className='answers-table-answer-post-date'>
            {answer.ans_by} <br /> answered {getTimeString(answer.ans_date_time)}
          </span>
        </td>
      </tr>
    ));
  }
  

  // Change Page buttons
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

  // Change page buttons
  // Upvote/downvote section

  let votingSection
  let isAdmin = stateInfo.user_type === UserTypes.ADMIN
  let notGuest = stateInfo.user_type !== UserTypes.GUEST
  let enoughRep
  notGuest ? enoughRep = stateInfo.user_profile.rep >= 50 
           : enoughRep = false
  let canVote = notGuest && enoughRep
  if (isAdmin || canVote) {
    votingSection = <div id = 'answers-page-row3'>
                      <span id = 'upvote-button' onClick = {handleUpvote}>&#8593;</span>
                      <span id = 'downvote-button' onClick = {handleDownvote}>&#8595;</span>
                    </div>
  }
  else {
    votingSection = <div id = 'answers-page-row3'>
                      <span id = 'upvote-button' className = 'disabled' onClick = {handleUpvote}>&#8593;</span>
                      <span id = 'downvote-button' className = 'disabled' onClick = {handleDownvote}>&#8595;</span>
                    </div>
  }

  function handleUpvote() {
    if (!isAdmin) {
      if (!notGuest) {
        alert("Guests can not vote!")
        return
      }
      // A new tag name can only be created by a user with at least 50 reputation points.
      //A user can vote if their reputation is 50 or higher
      if (!enoughRep) {
        alert("Not enough reputation to vote!")
        return
      }
    }

    axios.post('http://localhost:8000/vote', {id: stateInfo.question._id, change: 1})
    axios.post('http://localhost:8000/rep_change', {id: stateInfo.question._id, change: 5})
    setVoteCount(v => v + 1)
  }

  function handleDownvote() {
    if (!isAdmin) {
      if (!notGuest) {
        alert("Guests can not vote!")
        return
      }
      // A new tag name can only be created by a user with at least 50 reputation points.
      //A user can vote if their reputation is 50 or higher
      if (!enoughRep) {
        alert("Not enough reputation to vote!")
        return
      }
    }
    
    axios.post('http://localhost:8000/vote', {id: stateInfo.question._id, change: -1})
    axios.post('http://localhost:8000/rep_change', {id: stateInfo.question._id, change: -10})
    setVoteCount(v => v - 1)
  }
  // Upvote/downvote section

  let askButton
  let answerButton
  if (stateInfo.user_type !== UserTypes.GUEST) {
    askButton = <button id = 'answers-page-ask-question-button' onClick = { () => { stateInfo.setQuestionType(QuestionTypes.NEW); stateInfo.setComponent(Components.POST_QUESTION_PAGE) } }>Ask Question</button>
    answerButton = <button id = 'answers-page-answer-question-button' onClick = { () => { stateInfo.setComponent(Components.POST_ANSWER_PAGE) } }>Answer Question</button>
  }

  return (
    <div id = 'answers-page'>
      <div id = 'answers-page-row1'>
        <span id = 'answers-page-num-answers'>{ stateInfo.question.answers.length } answers</span>
        <span id = 'answers-page-title'>{ stateInfo.question.title }</span>

        { askButton }
      </div>

      <div id = 'answers-page-row2'>
        <span id = 'answers-page-reputation'>{ voteCount } reputation</span>
        <span id = 'answers-page-tags'><Tags tags = { getTagsByIds(stateInfo.question.tags, currentTags) } /></span>
      </div>

      { votingSection }

      <div id = 'answers-page-row4'>
        <span id = 'answers-page-num-views'>{ stateInfo.question.views } views</span>
        <span id = 'answers-page-text' dangerouslySetInnerHTML={ { __html: createHyperlinks(stateInfo.question.text) } } />
        <span id = 'answers-page-user-asked'>{ stateInfo.question.asked_by } asked { getTimeString(stateInfo.question.ask_date_time) }</span>
      </div>

      <table id = 'answers-table'>
        <tbody>
          <AnswerRows answerIds = { stateInfo.question.answers }/>
        </tbody>
      </table>

      <div className = "page-buttons">
        { onFirstPage ? <span id = "prev-button" className = "disabled" onClick = { showPrevPage }>&lt;</span>
                      : <span id = "prev-button" onClick = { showPrevPage }>&lt;</span> }
        { onLastPage ? <span id = "next-button" className = "disabled" onClick = { showNextPage }>&gt;</span>
                     : <span id = "next-button" onClick = { showNextPage }>&gt;</span> }
      </div>

      { answerButton }
    </div>
  )
}