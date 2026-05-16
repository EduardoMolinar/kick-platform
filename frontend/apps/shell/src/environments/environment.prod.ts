/**
 * Production environment.
 *
 * After a successful `cdk deploy` of SportsProxyStack, paste the `apiUrl`
 * output here (no trailing slash). The next frontend build will wire
 * HttpSportsDataService against this URL.
 *
 * Empty string falls back to MockSportsDataService — useful if you want to
 * ship the frontend before the backend is reachable.
 */
export const environment = {
  production: true,
  // e.g. 'https://abc123.execute-api.eu-west-1.amazonaws.com'
  sportsApiBaseUrl: 'https://ulcojhxgj5.execute-api.us-east-1.amazonaws.com',
};
