import app from '../../server/src/app.mjs';
import { describe, it } from 'vitest';
import { request } from 'sagetest';

describe('/api/v1/admin', () => {
  it('responds with a 403 status code if admin mode is not enabled', async () => {
    process.env.ADMIN_ENABLED = 'false';
    await request(app).get('/api/v1/admin').expect(403);
    await request(app).post('/api/v1/admin').expect(403);
    await request(app).put('/api/v1/admin').expect(403);
    await request(app).delete('/api/v1/admin').expect(403);
  });
});
