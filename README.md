# Grafana Data Source Plugin Template

## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```
4. Volume mount the plugin directory into the grafana plugins folder in the container:

   ```docker run -d -p 3000:3000 -v <plugin-directory>:/var/lib/grafana/plugins grafana/grafana```

5. For running the plugin post any changes run ```yarn dev && docker restart <containerid/containername>```
