const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const escapeHTML = require('../utils/escapeHTML');
const requestIp = require('request-ip');
const validateEmail = require('../utils/validateEmail');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    let { title, author, email } = req.fields;
    const file = req.files.file;

    if (
      title &&
      title.length <= 25 &&
      title.length === escapeHTML(title).length && // check if title is valid
      author &&
      author.length <= 50 &&
      author.length === escapeHTML(author).length && // check if author is valid
      email &&
      validateEmail(email) &&
      file
    ) {
      // if fields are not empty...
      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0]; // leave only the extension

      if (fileExt === 'jpg' || fileExt === 'png' || fileExt === 'gif') {
        const newPhoto = new Photo({
          title: escapeHTML(title),
          author: escapeHTML(author),
          email,
          src: fileName,
          votes: 0,
        });
        await newPhoto.save(); // ...save new photo in DB
        return res.json(newPhoto);
      } else {
        throw new Error('Wrong file extension!');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const voterIp = requestIp.getClientIp(req);
    const voter = await Voter.findOne({ voter: voterIp });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    console.log(photoToUpdate);

    if (!photoToUpdate) return res.status(404).json({ message: 'Not found' });
    if (!voter) {
      const newVoter = await Voter.create({ voter: voterIp, votes: [] });
      newVoter.votes.push(req.params.id);
      newVoter.save();
      console.log(newVoter);
      photoToUpdate.votes++;
      photoToUpdate.save();
      return res.status(200).send({ message: 'OK' });
    } else if (voter.votes.includes(photoToUpdate._id)) {
      return res.status(500).json({ message: 'You already voted for this photo' });
    } else {
      voter.votes.push(photoToUpdate._id);
      voter.save();
      photoToUpdate.votes++;
      photoToUpdate.save();
      console.log(voter);
      return res.status(200).send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const voter = await Voter.findOne({ user: requestIp.getClientIp(req) });
// const photoToUpdate = await Photo.findOne({ _id: { $eq: req.params.id } });

// if (!photoToUpdate) return res.status(404).json({ message: 'Not found' });
// if (!voter) {
//   const newVoter = await Voter.create({ user: clientIp, votes: [] });
//   newVoter.votes.push(req.params.id);
//   newVoter.save();
//   photoToUpdate.votes++;
//   photoToUpdate.save();
//   return res.status(200).send({ message: 'OK' });
// } else if (voter.votes.includes(photoToUpdate._id)) {
//   return res.status(500).json({ message: 'You already voted for this photo' });
// } else {
//   voter.votes.push(photoToUpdate._id);
//   photoToUpdate.votes++;
//   await photoToUpdate.save();
//   return res.status(200).send({ message: 'OK' });
// }
// } catch (err) {
// res.status(500).json({ message: err.message });
// }
