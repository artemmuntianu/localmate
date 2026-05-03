import { PostHog } from 'posthog-node';

let _client: PostHog | undefined;

export function getPostHogClient(): PostHog {
  if (!_client) {
    _client = new PostHog(import.meta.env.PUBLIC_POSTHOG_KEY, {
      host: import.meta.env.PUBLIC_POSTHOG_HOST,
    });
  }
  return _client;
}
