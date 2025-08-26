function get(req, res) {
  return res.send({
    status: 'success',
    data: {
      message: 'A message from the api.',
    },
  });
}

function postPhoto(req, res) {
  // Multer gets file data.
  const image = req.file;
  // Contains details of people tagged in the photo.
  const body = req.body;

  console.log('image uploaded:', image);

  // Form can also include data like tagged people. E.g. 'tag' and you click on the image and it logs it.
  return res.send({
    status: 'success',
    data: {
      message: 'Post photo mode successfully accessed!',
      image: {
        url: `${process.env.VITE_SERVER_URL}/data/${image.filename}`,
      },
    },
  });
}

function getPhoto(req, res) {
  // return db entry of photo. that will contain the url to the public /static/photo url,
  // and other details. E.g. id, which can be used to check db tags when user clicks on the image.
  return res.send({
    status: 'success',
    data: {
      image: {
        // Now this is working, how to upload new images and set up stuff?
        url: `${process.env.VITE_SERVER_URL}/data/dale.jpg`,
      },
    },
  });
}

export { get, getPhoto, postPhoto };
