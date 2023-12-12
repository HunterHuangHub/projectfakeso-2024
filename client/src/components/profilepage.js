import { useState, useEffect } from "react";
import axios from 'axios';
import { QuestionTypes, Components, getTimeString } from "./utils.js";

export default function ProfilePage({ stateInfo }) {
  // Regular User
  // States for all posted questions
  const [currUserQuestions, setCurrUserQuestions] = useState([])
  let id = stateInfo.user_profile._id
  useEffect(() => {
    axios.post('http://localhost:8000/get_questions_from_profile', { id }).then(function(response) {
      setCurrUserQuestions(response.data);
    })
  }, [id])

  return (
    <>
      <UserProfiles stateInfo = { stateInfo } currUserQuestions = { currUserQuestions }/>
    </>
  );
}

// Users is an array containing all profiles
function UserProfiles({ stateInfo, currUserQuestions }) {
  let timeSinceRegistration = getTimeString(stateInfo.user_profile.register_date);
  let userRep = stateInfo.user_profile.rep;
  let questions = currUserQuestions.filter(question => question !== null)

  return (
    <>
      <br></br>
      <div className = "user-profile">
        <div id = 'user-registration-and-rep'>
          <span id = 'user-registration-date'>Account created {timeSinceRegistration}</span>
          <span id = 'user-reputation'>{userRep} reputation</span>
        </div>
        {/* Display user's questions */}
        <h2>My Questions</h2>
        <ul className="question-list">
          {/* 1. Iterate over user's questions and render question titles. */}
          {/* 2. Modify the question or delete it. */}
          {/* 3. Display existing information in appropriate fields. */}
          {
            questions.map((question, index) => (
              <li key = {index}>
                <span onClick = {
                  () => {stateInfo.setQuestion(question); stateInfo.setQuestionType(QuestionTypes.OLD); stateInfo.setComponent(Components.POST_QUESTION_PAGE)}
                }>{question.title}</span> 
              </li>
            ))
          }
        </ul>

        {/* Display links to view created tags */}
        <h2>My Tags</h2>
        <ul className="tag-list">
          {/* Iterate over user's tags to render them */}
          {/* Each tag entry has options to be deleted/edited. */}
          <li>
            <span className="tag">Tag 1</span>
            <button>Delete</button>
            <button>Edit</button>
          </li>
          <li>
            <span className="tag">Tag 2</span>
            <button>Delete</button>
            <button>Edit</button>
          </li>
          {/* Add additional tag entries */}
        </ul>

        {/* Display questions answered by the user */}
        <h2>Questions Answered</h2>
        <ul className="answered-question-list">
          {/* 1. Iterate over user's answered questions */}
          {/* 2. Each question is displayed in the home page's format: "Newest questions" */}
          {/* 3. Clicking a question link changes component to the the question's answer page. */}
          {/* 4. The user's answer is displayed first, followed by other answers in the {newest order} */}
          <li>
            <a href="/question/1">Question 1</a>
            <div className="answer">
              <p>User's answer</p>
            </div>
            <div className="other-answers">
              <p>Other answers</p>
            </div>
            {/* Add additional question entries */}
          </li>
        </ul>
      </div>
    </>
  );
}
