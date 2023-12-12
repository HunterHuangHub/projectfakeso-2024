import React from "react";
import axios from 'axios'
import { filterQuestionsBySearchBar} from './fakestackoverflow'

//UTILS Page:  easier to import all necessary methods & constants from one source.

// CONSTANTS
export const UserTypes = {
    GUEST: 'GUEST',
    ADMIN: 'ADMIN',
    USER: 'USER'
}

export const Components = {
    MAIN_PAGE: 'MAIN_PAGE',
    QUESTIONS_PAGE: 'QUESTIONS_PAGE',
    POST_QUESTION_PAGE: 'POST_QUESTION_PAGE',
    ANSWERS_PAGE: 'ANSWERS_PAGE',
    POST_ANSWER_PAGE: 'POST_ANSWER_PAGE',
    TAGS_PAGE: 'TAGS_PAGE',
    PROFILE_PAGE: 'PROFILE_PAGE'
}

export const TextTypes = {
    TITLE: 'TITLE',
    SUMMARY: 'SUMMARY',
    TEXT: 'TEXT',
    TAGS: 'TAGS',
    USER: 'USER'
  }
  
  export const QuestionTypes = {
    NEW: 'NEW',
    OLD: 'OLD'
}
// CONSTANTS

// METHODS

// ANSWERS
export function sortAnswers (answers) {
    if (answers.length < 2) {
      return
    }
  
    answers.sort(function (a, b) { return new Date(b.ans_date_time) - new Date(a.ans_date_time) })
  }

// TAGS
export function getTagsByIds(tagIds, tags) {
    const tagMap = new Map(tags.map(tag => [tag._id, tag]));
    return tagIds.map(tagId => tagMap.get(tagId)).filter(tag => tag !== undefined);
}

// Given an array of tags, return the tag string
export function generateTagsString(tags) {
    let tagNames = tags.map(tag => tag.name)
    return tagNames.join(' ')
}  

export async function getNumberOfTags (tags) {
    const numberOfEachTags = []
  
    for (let i = 0; i < tags.length; i++) {
      let tag = await filterQuestionsBySearchBar([], [tags[i].name])
      numberOfEachTags.push(tag.length)
    }
  
    return numberOfEachTags
  }

// Gets all tags with the given ids from the given tag array
export function Tags ({ tags }) {
    return tags.map(function (tag, index) {
      return (<span className = 'question-tags' key = { index }>{ tag.name } </span>)
    })
  } 
// TAGS

// QUESTIONS
// get question by id from backend
export async function getQuestionById(id) {
    let question
    await axios.post('http://localhost:8000/get_question_by_id', { id }).then(res => {
      question = res.data;
    })
  
    return question
  }
// Sorts question ids from newest to oldest
export function sortByNewest (questions) {
    return questions.sort(function (a, b) { 
      return new Date(b.ask_date_time) - new Date(a.ask_date_time)
    })
  }
  
  // sorts questions from most active to least active
export function sortByActive (questions) {
    const questionsWithNoAnswers = questions.filter(question => question.answers.length === 0)
  
    let questionsWithAnswers = questions.filter(question => question.answers.length > 0)
  
    questionsWithAnswers.sort(async function (a, b) {
      // grab all answers from question a
      let answersA = []
      for (let i = 0; i < a.answers.length; i++) {
        let id = a.answers[i]
        await axios.post('http://localhost:8000/get_answer_by_id', { id }).then(res => {
          answersA.push(res.data)
        })
      }
  
      // grab all answers from question b
      let answersB = []
      for (let i = 0; i < b.answers.length; i++) {
        let id = b.answers[i]
        await axios.post('http://localhost:8000/get_answer_by_id', { id }).then(res => {
          answersB.push(res.data)
        })
      }
      
      // sort answers by most recent
      sortAnswers(answersA)
      sortAnswers(answersB)
  
      // grab the most recent answers
      const answerA = answersA[0]
      const answerB = answersB[0]
  
      return new Date(answerB.ans_date_time) - new Date(answerA.ans_date_time) 
    })
  
    for (let i = 0; i < questionsWithNoAnswers.length; i++) {
      questionsWithAnswers.push(questionsWithNoAnswers[i])
    }
  
    return questionsWithAnswers
  
  }
  
  // returns all questions that are unanswered
  export function sortByUnanswered (questions) {
    return questions.filter(question => question.answers.length === 0)
  }
// QUESTIONS  
  
// UTILS
export function verifyLinks(text) {
    const linkRegex = /\((https?:\/\/.*?)\)/g;
    let isValid = true;
  
    text.replace(linkRegex, (match, url) => {
      if (!url) {
        isValid = false;
      }
    });
  
    return isValid;
  }

  // getTimeString
  export function getTimeString(postDate) {
    const currentDate = new Date();
    postDate = new Date(postDate);
    const differenceInSeconds = (currentDate - postDate) / 1000;
  
    if (differenceInSeconds < 60) {
      return `${Math.floor(differenceInSeconds)} seconds ago`;
    }
    if (differenceInSeconds < 3600) {
      return `${Math.floor(differenceInSeconds / 60)} minutes ago`;
    }
    if (differenceInSeconds < 86400) {
      return `${Math.floor(differenceInSeconds / 3600)} hours ago`;
    }
  
    // For dates beyond a day, format more traditionally
    return postDate.toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      year: differenceInSeconds >= 2073600 ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    });
  }

// Given a user search string, finds all the keywords in that string
export function parseKeywords(searchString) {
    if (searchString === '') {
      return [];
    }
  
    // Split by space and filter out empty strings
    return searchString.split(' ').filter(keyword => keyword !== '' && !keyword.includes('[') && !keyword.includes(']'));
  }
  
  
  // given a user search string, finds all the tags in that string
export function parseTags(searchString) {
    const tagPattern = /\[(.*?)\]/g;
    const tags = [];
    let match;
  
    while ((match = tagPattern.exec(searchString)) !== null) {
      if (match[1].includes('[') || match[1].includes(']')) {
        // Invalid tag format (nested brackets or misplaced bracket)
        return null;
      }
      tags.push(match[1]);
    }
  
    return tags;
  }
  
  

export function verifyQuestionPageInputs (title, text, tags) {
    let titleValid = true
    let textValid = true
    let tagsValid = true

    // verify input boxes
    if (title === '') {
      document.getElementById('post-question-title-error').innerHTML = 'Title can not be empty.'
      titleValid = false
    } else {
      document.getElementById('post-question-title-error').innerHTML = ''
    }

    if (text === '') {
      document.getElementById('post-question-text-error').innerHTML = 'Question text can not be empty.'
      textValid = false
    } else {
      document.getElementById('post-question-text-error').innerHTML = ''
    }

    if (tags[0] === '') {
      document.getElementById('post-question-tags-error').innerHTML = 'Tags can not be empty.'
      tagsValid = false
    } else if (tags.length > 5) {
      document.getElementById('post-question-tags-error').innerHTML = 'Can not exceed 5 tags.'
      tagsValid = false
    } else if (tags.filter(tag => tag.length > 10).length !== 0) {
      document.getElementById('post-question-tags-error').innerHTML = 'Length of tag can not exceed 10 characters.'
      tagsValid = false
    } else {
      const allowableCharacters = /^[a-zA-Z0-9-]+$/
      for (let i = 0; i < tags.length; i++) {
        if (!tags[i].match(allowableCharacters)) {
          document.getElementById('post-question-tags-error').innerHTML = 'Tags can only contain alphabets, numbers, and hyphens.'
          tagsValid = false
          break
        }
      }
      if (tagsValid) {
        document.getElementById('post-question-tags-error').innerHTML = ''
      }
    }

    // verify hyperlinks
    const hyperlinkRegex = /\[(.*?)\]\((.*?)\)/g
    let match
    while ((match = hyperlinkRegex.exec(text)) !== null) {
      const linkName = match[1]
      const linkUrl = match[2]
      if (linkUrl.trim() === '') {
        document.getElementById('post-question-text-error').innerHTML = 'The URL for ' + linkName + ' is missing a URL'
        textValid = false
        break
      }
      if (linkName.trim() === '') {
        document.getElementById('post-question-text-error').innerHTML = 'The name for ' + linkUrl + ' is missing a name'
        textValid = false
        break
      }
      if (!(linkUrl.startsWith('https://') || linkUrl.startsWith('http://'))) {
        document.getElementById('post-question-text-error').innerHTML = 'The URL for ' + linkName + ' must start with https:// or http://'
        textValid = false
        break
      }
    }

    return titleValid && textValid && tagsValid
  }

  // generates a title and input box with the associated parameters
export function UserInputSection ({title, captions, textId, errorId, textType, value = ''}) {
    function TextArea () {
      if (textType === TextTypes.TEXT) {
        return (<textarea className = 'post-question-textarea-box' id = { textId } defaultValue = { value }/>)
      }
  
      if (textType === TextTypes.TITLE) {
        return <input className = 'post-question-input-box' id = { textId } maxLength = '50' defaultValue = { value }/>
      }
  
      if (textType === TextTypes.SUMMARY) {
        return <input className = 'post-question-input-box' id = { textId } maxLength = '140' defaultValue = { value }/>
      }
  
      return <input className = 'post-question-input-box' id = { textId } defaultValue = { value }/>
    }
  
    return (
      <>
        <div className = 'post-question-headers'>{ title }</div>
        <div className = 'post-question-captions'>{ captions }</div>
        <div className = 'post-question-input'>
          <TextArea />
        </div>
        <div id = { errorId }></div>
      </>
    )
  }
