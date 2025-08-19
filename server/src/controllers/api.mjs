function get(req, res) {
  return res.send({
    status: 'success',
    data: {
      message: 'A message from the api.',
    },
  });
}

export { get };
