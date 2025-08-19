import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EventType } from '../src/database/entities';

describe('Sumu-Machi Backend (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('App Controller', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Commutes API', () => {
    it('/commutes/seed (POST) should seed sample data', async () => {
      const response = await request(app.getHttpServer())
        .post('/commutes/seed')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('サンプルデータを投入しました');
    });

    it('/commutes/search (POST) should return commute candidates', async () => {
      // 先投入測試資料
      await request(app.getHttpServer()).post('/commutes/seed');

      const searchData = { origin: '渋谷' };
      const response = await request(app.getHttpServer())
        .post('/commutes/search')
        .send(searchData)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('station');
        expect(response.body[0]).toHaveProperty('line');
        expect(response.body[0]).toHaveProperty('minutes');
        expect(response.body[0]).toHaveProperty('suumo_url');
      }
    });

    it('/commutes/search (POST) should return 404 for invalid station', async () => {
      const searchData = { origin: '無効駅' };
      const response = await request(app.getHttpServer())
        .post('/commutes/search')
        .send(searchData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('が見つかりません');
    });

    it('/commutes/search (POST) should validate input', async () => {
      const searchData = { origin: '' }; // 空字串應該失敗
      await request(app.getHttpServer())
        .post('/commutes/search')
        .send(searchData)
        .expect(400);
    });
  });

  describe('Events API', () => {
    it('/events (POST) should create event', async () => {
      const eventData = {
        type: EventType.INPUT,
        payload: { station: '渋谷', searchTime: new Date() },
        sessionId: 'test-session-123',
      };

      const response = await request(app.getHttpServer())
        .post('/events')
        .send(eventData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('eventId');
      expect(typeof response.body.eventId).toBe('string');
    });

    it('/events (POST) should validate event type', async () => {
      const eventData = {
        type: 'invalid_type', // 無效的事件類型
        payload: { station: '渋谷' },
      };

      await request(app.getHttpServer())
        .post('/events')
        .send(eventData)
        .expect(400);
    });

    it('/events/statistics (GET) should return statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/statistics')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('/events/popular-stations (GET) should return popular stations', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/popular-stations?limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
