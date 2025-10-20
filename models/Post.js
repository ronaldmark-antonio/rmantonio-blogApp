const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is Required']
  },
  content: {
    type: String,
    required: [true, 'Content is Required']
  },
  author_information: {
    type: String,
    required: [true, 'Content is Required']
  },
  creationAdded: {
    type: Date,
    default: Date.now
  },
  comments: [
      {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
          },
          comment: {
              type: String,
              required: [true, 'Comment is Required']
          }
      }
    ]
});

module.exports = mongoose.model('Post', postSchema);
