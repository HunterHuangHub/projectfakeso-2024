// apiService.js
import axios from 'axios'

export const fetchAnswers = () => axios.get('http://localhost:8000/answers');
export const fetchTags = () => axios.get('http://localhost:8000/tags');
