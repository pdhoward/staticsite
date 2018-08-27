# Static Site

Basic custom static site generator. 
Requires Node.js >= 8.11.x

## Development

```bash
npm start
```

Note that in development mode, the source directory is watched for changes. See `chokidar` documentation for more details.

This project uses Bulma.css as base CSS framework. Bulma has been slightly customized and is compiled directly from SASS to CSS along with some other styles. If you are also interested in watching the sass files for changes, open another terminal instance and run the following:

```bash
npm run sass:watch
```

To live reload the browser on any change, install `browser-sync` globally via `npm i -g browser-sync` and then the following command in a new terminal:

```bash
npm run live-reload
```

## Production

```bash
npm run build
```

Note that the compiled css files are also checked into source control so compiling sass is not a hard requirement.

## Deployment

This project's static Pages are built by GitLab CI, following the steps defined in [`.gitlab-ci.yml`](.gitlab-ci.yml)
