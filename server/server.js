// Application server
// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

// Database related
let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let Profile = require('./models/profiles')

let mongoose = require('mongoose')
let mongoDB = 'mongodb://127.0.0.1:27017/fake_so'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
let db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

function createTag(name) {
  let tag = new Tag({ name: name })
  return tag.save()
}

function createProfile(username, email, password, register_date, rep, questions) {
  profiledetail = {
    username: username,
    email, email,
    password: password,
    register_date: register_date,
    rep: rep,
    questions: questions
  }

  let profile = new Profile(profiledetail);
  return profile.save();
}

function createAnswer(text, ans_by, ans_date_time) {
  answerdetail = {text: text}
  if (ans_by != false) answerdetail.ans_by = ans_by
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time

  let answer = new Answer(answerdetail)
  return answer.save()
}

function createQuestion(title, summary, text, tags, answers, asked_by, ask_date_time, views, rep) {
  questiondetail = {
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    asked_by: asked_by,
    reputation: rep
  }
  if (answers != false) questiondetail.answers = answers
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time
  questiondetail.views = views

  let question = new Question(questiondetail)
  return question.save()
}

console.log('Connected to MongoDB!')

// Express related
// Hashing 
const bcrypt = require('bcrypt')
const saltRounds = 10

const express = require('express')
const app = express()
const port = 8000
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.listen(port, () => {
  console.log('App listening on port ${port}')
});

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {db.close()}
  console.log("Server closed. Database instance disconnected.")
  process.exit()
})

app.get('/', async (req, res) => {
  return res.send({
    server: 'open'
  })
})

// Updates all missing fields of questions & answers in advance
app.get('/update_missing_fields', async (req, res) => {
    try {
      // Update missing fields in questions
      await db.collection('questions').updateMany(
        { views: { $exists: false } },
        { $set: { views: 0 } }
      );
  
      await db.collection('questions').updateMany(
        { asked_by: { $exists: false } },
        { $set: { asked_by: 'Anonymous' } }
      );
  
      await db.collection('questions').updateMany(
        { ask_date_time: { $exists: false } },
        { $set: { ask_date_time: new Date() } }
      );
  
      // Update missing fields in answers
      await db.collection('answers').updateMany(
        { ans_by: { $exists: false } },
        { $set: { ans_by: 'Anonymous' } }
      );
  
      await db.collection('answers').updateMany(
        { ans_date_time: { $exists: false } },
        { $set: { ans_date_time: new Date() } }
      );
  
      res.send("Fields updated");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
  

// Returns all questions depending on user request
app.get('/questions', async (req, res) => {
  const questions = await db.collection('questions').find({}).toArray()
  res.send(questions)
})

// Returns all tags depending on user request
app.get('/tags', async (req, res) => {
  const tags = await db.collection('tags').find({}).toArray()
  res.send(tags)
})

// Returns all answers depending on user request
app.get('/answers', async (req, res) => {
  const answers = await db.collection('answers').find({}).toArray()
  res.send(answers)
})

app.get('/profiles', async (req, res) => {
  const profiles = await db.collection('profiles').find({}).toArray()
  res.send(profiles)
})

app.get('/admins', async (req, res) => {
  const admins = await db.collection('admins').find({}).toArray()
  res.send(admins)
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const profile = await db.collection('profiles').findOne({ email: email });
      if (!profile || !bcrypt.compareSync(password, profile.password)) {
        res.status(401).send('Invalid email or password');
        return;
      }
      res.send('Login successful');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.post('/login_admin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const profile = await db.collection('admins').findOne({ email: email });
      if (!profile || !bcrypt.compareSync(password, profile.password)) {
        res.status(401).send('Invalid email or password');
        return;
      }
      res.send('Admin login successful');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });  

// 1. Adds/modifies question 
// 2. Adds any new tags to backend
app.post('/post_question', async (req, res) => {
    try {
      let { question, profile } = req.body;
  
      // Fetch or create tags concurrently
      const tagPromises = question.tags.map(async tagName => {
        const existingTags = await db.collection('tags').find({ name: tagName }).toArray();
        if (existingTags.length === 0) {
          const newTag = await createTag(tagName);
          console.log('New tag added!');
          return newTag._id;
        } else {
          return existingTags[0]._id;
        }
      });
      const tags = await Promise.all(tagPromises);
  
      // Update or create the question
      if (question._id) {
        let id = new mongoose.Types.ObjectId(question._id);
        await db.collection('questions').updateOne({_id: id}, {"$set": { title: question.title, summary: question.summary, text: question.text, tags: tags }});
        console.log("Question updated!");
      } else {
        let q = await createQuestion(question.title, question.summary, question.text, tags, false, question.askedBy, question.askDate, question.views, 0);
        let mongooseId = new mongoose.Types.ObjectId(profile._id);
        await db.collection('profiles').updateOne({_id: mongooseId}, {$push: {questions: q._id}});
        console.log('Question posted!');
      }
  
      res.send('Done');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });  

app.post('/delete_question', async (req, res) => {
  let { id } = await req.body
  let mongooseId = new mongoose.Types.ObjectId(id)

  await db.collection('questions').deleteOne({_id: mongooseId})
  res.send('Done')
})

app.post('/post_profile', async (req, res) => {
  let { profile } = await req.body

  const salt = bcrypt.genSaltSync(saltRounds)
  const hashedPassword = bcrypt.hashSync(profile.password, salt);
  await createProfile(profile.username, profile.email, hashedPassword, new Date(), 0, [])
  console.log('Profile posted!')

  res.send('Done')
})

// Adds answer to backend
app.post('/post_answer', async (req, res) => {
  let { answer, question } = req.body

  let createdAnswer = await createAnswer(answer.text, answer.ans_by, answer.ans_date_time)

  question.answers.push(createdAnswer._id.toString())
  let id = new mongoose.Types.ObjectId(question._id) 
  await db.collection('questions').updateOne({_id: id}, {"$set": {answers: question.answers}})
  console.log('Answer posted!')

  res.send('Done')
})

// Updates question view count
app.post('/update_view_count', async (req, res) => {
  let info = await req.body
  let id = new mongoose.Types.ObjectId(info)
  let questionInfo = await db.collection('questions').find({_id: id}).toArray()
  let updatedViews = questionInfo[0].views + 1
  await db.collection('questions').updateOne({_id: id}, {"$set": {views: updatedViews}})

  res.send('Done')
})

// Updates question vote
app.post('/vote', async (req, res) => {
    try {
      const { id, change } = req.body;
      const mongooseId = new mongoose.Types.ObjectId(id);
      await db.collection('questions').updateOne({_id: mongooseId}, {"$inc": {reputation: change}});
      res.send('Done');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Updates user reputation
  app.post('/rep_change', async (req, res) => {
    try {
      const { id, change } = req.body;
      const mongooseQuestionId = new mongoose.Types.ObjectId(id);
  
      const profile = await getProfileAssociatedWithQuestionId(mongooseQuestionId);
      if (!profile) {
        res.status(404).send('Profile not found');
        return;
      }
  
      await db.collection('profiles').updateOne({_id: profile._id}, {"$inc": {rep: change}});
      res.send('Done');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  

// Get question by id
app.post('/get_question_by_id', async (req, res) => {
  let info = await req.body
  let id = new mongoose.Types.ObjectId(info)
  let questionInfo = await db.collection('questions').find({_id: id}).toArray()

  res.send(questionInfo[0])
})

// Get answer by id
app.post('/get_answer_by_id', async (req, res) => {
  let info = await req.body
  let id = new mongoose.Types.ObjectId(info)
  let answerInfo = await db.collection('answers').find({_id: id}).toArray()

  res.send(answerInfo[0])
})

// Get questions associated with the profile
app.post('/get_questions_from_profile', async (req, res) => {
  try {
    const { id } = req.body;
    const mongooseProfileId = new mongoose.Types.ObjectId(id);
    const profile = await db.collection('profiles').findOne({_id: mongooseProfileId});

    if (!profile || !profile.questions) {
      res.status(404).send('Profile not found or no questions associated');
      return;
    }

    const questionIds = profile.questions.map(q => new mongoose.Types.ObjectId(q._id));
    const questionsFromProfile = await db.collection('questions').find({_id: { $in: questionIds }}).toArray();

    res.send(questionsFromProfile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Get tags by question id
app.post('/get_tags_by_question_id', async (req, res) => {
  try {
    const info = req.body;
    const id = new mongoose.Types.ObjectId(info._id); // Assuming info contains an _id property
    const question = await db.collection('questions').findOne({_id: id});

    if (!question || !question.tags) {
      res.status(404).send('Question not found or no tags associated');
      return;
    }

    const tagIds = question.tags.map(tag => new mongoose.Types.ObjectId(tag));
    const relevantTags = await db.collection('tags').find({_id: { $in: tagIds }}).toArray();

    res.send(relevantTags);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

console.log('Connected to server!');

// Helpers
// Note: id should be the mongodb id object for the question
async function getProfileAssociatedWithQuestionId(id) {
  let profiles = await db.collection('profiles').find({}).toArray()

  for (let i = 0; i < profiles.length; i++) {
    if (profiles[i].questions.some(question => question._id.equals(id))) {
      return profiles[i]
    }
  }

  console.error("No profile associated with the question!");
}
