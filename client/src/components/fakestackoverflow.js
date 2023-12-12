import LoginPage from './login.js'
import QuestionsPage from './questionspage.js'
import PostQuestionPage from './postquestionpage.js'
import PostAnswerPage from './postanswerpage.js'
import TagsPage from './tagspage.js'
import AnswersPage from './answerspage.js'
import { Components, UserTypes, QuestionTypes, parseKeywords, parseTags, sortByNewest} from './utils.js'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ProfilePage from './profilepage.js'

export default function FakeStackOverflow ({ loginInfo }) {

  // STATES
  // Updates missing fields
  useEffect(() => {
    axios.get('http://localhost:8000/update_missing_fields')
  }, [])

  // Is user logged in?
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  // Switch between components
  const [component, setComponent] = useState(Components.QUESTIONS_PAGE)

  // Question to print answers for:
  const [question, setQuestion] = useState('')

  // Questions to display:
  const [questionsToDisplay, setQuestionsToDisplay] = useState([])
  useEffect(() => {
    axios.get('http://localhost:8000/questions').then(function(response) {
      setQuestionsToDisplay(sortByNewest(response.data))
    })
  }, [])

  // Colors of buttons:
  const [buttonColors, setButtonColors] = useState({ newestColor: 'gray', activeColor: 'white', unansweredColor: 'white' })

  // New or Old Question? 
  const [questionType, setQuestionType] = useState(QuestionTypes.NEW)
  // STATES

  // Switching between dynamic components:
  function Component () {
    // stateInfo: all the current state variables & their modifiers
    let stateInfo = {
      component: component,
      setComponent: setComponent,
      question: question,
      setQuestion: setQuestion,
      questionsToDisplay: questionsToDisplay,
      setQuestionsToDisplay: setQuestionsToDisplay,
      buttonColors: buttonColors,
      setButtonColors: setButtonColors,
      user_type: loginInfo.user_type,
      user_profile: loginInfo.user_profile,
      questionType: questionType,
      setQuestionType: setQuestionType
    }

    changeSidebarColorsFor(component);
    switch (component) {
      case Components.QUESTIONS_PAGE:
        return <QuestionsPage stateInfo = {stateInfo} />

      case Components.POST_QUESTION_PAGE:
        return <PostQuestionPage stateInfo = {stateInfo} />

      case Components.TAGS_PAGE:
        return <TagsPage stateInfo = {stateInfo} />
      
      case Components.ANSWERS_PAGE:
        return <AnswersPage stateInfo = {stateInfo} />

      case Components.POST_ANSWER_PAGE:
        return <PostAnswerPage stateInfo = {stateInfo} />

      case Components.PROFILE_PAGE:
        return <ProfilePage stateInfo = {stateInfo} />

      default:
        return <QuestionsPage stateInfo = {stateInfo} />
    }
  }

  function changeSidebarColorsFor(component) {
    switch (component) {
      case Components.QUESTIONS_PAGE:
        break
      case Components.TAGS_PAGE:
        document.getElementById('questions-link').style.backgroundColor = 'white'
        document.getElementById('tags-link').style.backgroundColor = 'lightgrey'
        if (loginInfo.user_type !== UserTypes.GUEST) {
          document.getElementById('profile-link').style.backgroundColor = 'white'
        }
        break
      case Components.PROFILE_PAGE:
        document.getElementById('questions-link').style.backgroundColor = 'white'
        document.getElementById('tags-link').style.backgroundColor = 'white'
        document.getElementById('profile-link').style.backgroundColor = 'lightgrey'
        break
      default:
        document.getElementById('questions-link').style.backgroundColor = 'white'
        document.getElementById('tags-link').style.backgroundColor = 'white'
        if (loginInfo.user_type !== UserTypes.GUEST) {
          document.getElementById('profile-link').style.backgroundColor = 'white'
        }
    }
  }

  // modifies questionIds state based on search bar results, then refreshes
  async function search (e) {
    if (e.keyCode === 13) {
      const searchString = document.getElementById('search-box').value
      document.getElementById('search-box').value = ''
      const keywords = parseKeywords(searchString)
      const tags = parseTags(searchString)
      if (keywords === null || tags === null) {
        document.getElementById('search-box').placeholder = 'Invalid Format'
      } else {
        document.getElementById('search-box').placeholder = 'Search . . .'
        setQuestionsToDisplay(await filterQuestionsBySearchBar(keywords, tags))
        setComponent(Components.QUESTIONS_PAGE)
      }
    }
  }

  // switches dynamic component out for questions page
  function goToQuestionsPage () {
    // set sidebar colors
    document.getElementById('questions-link').style.backgroundColor = 'lightgrey'
    document.getElementById('tags-link').style.backgroundColor = 'white'
    if (loginInfo.user_type !== UserTypes.GUEST) {
      document.getElementById('profile-link').style.backgroundColor = 'white'
    }

    // grabs all questions from backend and then displays them in newest order
    axios.get('http://localhost:8000/questions').then(function(response) {
      setQuestionsToDisplay(sortByNewest(response.data))
    })

    // set button colors
    setButtonColors({ newestColor: 'gray', activeColor: 'white', unansweredColor: 'white' })

    // change component to questions page
    setComponent(Components.QUESTIONS_PAGE)
  }

  // switches dynamic component out for tags page
  function goToTagsPage () {
    setComponent(Components.TAGS_PAGE)
    //setQuestionsToDisplay(sortByNewest(questionsToDisplay))
  }

  // switches dynamic component out for profile page
  function goToProfile() {
    setComponent(Components.PROFILE_PAGE)
  }

  // switches page to login page
  function goToLogin() {
    setIsLoggedIn(false);
  }
  
  if (!isLoggedIn) {
    return <LoginPage />
  }

  let vline
  if (component === Components.QUESTIONS_PAGE) {
    vline = <div id = 'vertical-line' className = 'questions-vertical-line'></div>
  }
  else if (component === Components.ANSWERS_PAGE) {
    vline = <div id = 'vertical-line' className = 'answers-vertical-line'></div>
  }
  else {
    vline = <div id = 'vertical-line' className = 'full'></div>
  }

  let profileSection
  if (loginInfo.user_type !== UserTypes.GUEST) {
    profileSection = <div><span id = 'profile-link' onClick = { goToProfile }>Profile</span></div>
  }

  return (
    <div>
      <div id = 'main-page-header'>
        <div id = 'main-page-header-text'> Fake Stack Overflow </div>

        <div id = 'search-bar'>
          <input id = 'search-box' type = 'text' placeholder = 'Search...' onKeyDown = { search }></input>
        </div>
      </div>

      <div id= 'main'>
        <div id= 'side-bar'>
            <div><span id = 'questions-link' onClick = { goToQuestionsPage }>Questions</span></div>
            <div><span id = 'tags-link' onClick = { goToTagsPage }>Tags</span></div>
            { profileSection }
            <div><span id = 'logout-link' onClick = { goToLogin }>Logout</span></div>
        </div>

        { vline }

        <Component />
      </div>
    </div>
  )
}

// Given a keywords and tags array, return all relevant questions from all questions available
export async function filterQuestionsBySearchBar(keywords, tags) {
  const response = await axios.get('http://localhost:8000/questions');
  const questions = response.data;
  
  const lowerCaseKeywords = keywords.map(keyword => keyword.toLowerCase());
  const lowerCaseTags = tags.map(tag => tag.toLowerCase());

  return questions.filter(question => {
    const titleWords = question.title.toLowerCase().split(' ');
    const textWords = question.text.toLowerCase().split(' ');
    const questionTags = question.tags.map(tag => tag.toLowerCase()); // Assuming tags are included in question data

    const keywordMatch = lowerCaseKeywords.some(keyword => titleWords.includes(keyword) || textWords.includes(keyword));
    const tagMatch = lowerCaseTags.some(tag => questionTags.includes(tag));

    return keywordMatch || tagMatch;
  });
}
