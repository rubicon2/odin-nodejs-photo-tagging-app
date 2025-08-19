import server from '@app/server';
import 'dotenv/config';

server.listen(process.env.SERVER_PORT, () =>
  console.log('Listening on port', process.env.SERVER_PORT),
);
