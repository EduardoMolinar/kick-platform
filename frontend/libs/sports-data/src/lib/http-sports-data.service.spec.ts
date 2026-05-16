import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  HttpSportsDataService,
  SPORTS_DATA_API_BASE_URL,
} from './http-sports-data.service';

const BASE = 'https://api.example.test';

describe('HttpSportsDataService', () => {
  let service: HttpSportsDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SPORTS_DATA_API_BASE_URL, useValue: BASE },
        HttpSportsDataService,
      ],
    });
    service = TestBed.inject(HttpSportsDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs /v1/live for getLiveMatches', async () => {
    const promise = firstValueFrom(service.getLiveMatches());
    const req = http.expectOne(`${BASE}/v1/live`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await expect(promise).resolves.toEqual([]);
  });

  it('GETs /v1/matches/<id> for getMatch', async () => {
    const promise = firstValueFrom(service.getMatch('m-123'));
    const req = http.expectOne(`${BASE}/v1/matches/m-123`);
    req.flush(null);
    await expect(promise).resolves.toBeNull();
  });

  it('GETs /v1/competitions/<id>/fixtures for getFixtures', async () => {
    const promise = firstValueFrom(service.getFixtures('pl'));
    const req = http.expectOne(`${BASE}/v1/competitions/pl/fixtures`);
    req.flush([]);
    await expect(promise).resolves.toEqual([]);
  });

  it('GETs /v1/competitions/<id>/standings for getStandings', async () => {
    const promise = firstValueFrom(service.getStandings('pl'));
    const req = http.expectOne(`${BASE}/v1/competitions/pl/standings`);
    req.flush(null);
    await expect(promise).resolves.toBeNull();
  });

  it('GETs /v1/teams/<id>/fixtures for getTeamFixtures', async () => {
    const promise = firstValueFrom(service.getTeamFixtures('t-ars'));
    const req = http.expectOne(`${BASE}/v1/teams/t-ars/fixtures`);
    req.flush([]);
    await expect(promise).resolves.toEqual([]);
  });

  it('GETs /v1/teams/<id>/standings for getTeamStandings', async () => {
    const promise = firstValueFrom(service.getTeamStandings('t-ars'));
    const req = http.expectOne(`${BASE}/v1/teams/t-ars/standings`);
    req.flush([]);
    await expect(promise).resolves.toEqual([]);
  });

  it('GETs /v1/teams/<id> for getTeam', async () => {
    const promise = firstValueFrom(service.getTeam('t-ars'));
    const req = http.expectOne(`${BASE}/v1/teams/t-ars`);
    req.flush(null);
    await expect(promise).resolves.toBeNull();
  });

  it('falls back to empty array on HTTP error from getLiveMatches', async () => {
    const promise = firstValueFrom(service.getLiveMatches());
    const req = http.expectOne(`${BASE}/v1/live`);
    req.flush({ error: 'upstream' }, { status: 503, statusText: 'Service Unavailable' });
    await expect(promise).resolves.toEqual([]);
  });

  it('falls back to undefined on 404 from getMatch', async () => {
    const promise = firstValueFrom(service.getMatch('m-missing'));
    const req = http.expectOne(`${BASE}/v1/matches/m-missing`);
    req.flush({ error: 'not_found' }, { status: 404, statusText: 'Not Found' });
    await expect(promise).resolves.toBeUndefined();
  });

  it('URL-encodes match ids that need it', async () => {
    const promise = firstValueFrom(service.getMatch('m/with slash'));
    const req = http.expectOne(`${BASE}/v1/matches/m%2Fwith%20slash`);
    req.flush(null);
    await expect(promise).resolves.toBeNull();
  });
});
