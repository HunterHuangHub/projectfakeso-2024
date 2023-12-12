// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
let userArgs = process.argv.slice(2);
console.log("Your admin username/email is: " + userArgs[0])
console.log("Your admin password is: " + userArgs[1])

let Profile = require('./models/profiles')

let bcrypt = require('bcrypt')
const saltRounds = 10

let mongoose = require('mongoose');
let mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createProfile(username, email, password, register_date, rep, questions, isAdmin) {
  prfldetail = {
    username: username,
    email, email,
    password: password,
    register_date: register_date,
    rep: rep,
    questions: questions,
    isAdmin: isAdmin
  }

  let profile = new Profile(prfldetail);
  return profile.save();
}

const populate = async () => {

  const salt = bcrypt.genSaltSync(saltRounds)
  const hashedPassword = bcrypt.hashSync(userArgs[1], salt);
  await createProfile(userArgs[0], userArgs[0], hashedPassword, new Date(), 0, [], true)
  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');

