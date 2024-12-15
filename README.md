# Ressource Manager for OpenSearch Dashboards

## Overview

The **Ressource Manager** is a custom plugin for **OpenSearch Dashboards** designed to add a navigation option to set live ressource monitoring.

## Features

![Navigation](images/1.png)

![Navigation](images/2.png)

![Navigation](images/3.png)

![Navigation](images/4.png)

## Installation

1. sudo bin/opensearch-dashboards-plugin install https://github.com/geoloe/ressource_manager/blob/main/build/ressourceManager-2.18.0.0.zip
2. Restart opensearch-dashboards.service

## Usage

Once the plugin is installed and OpenSearch Dashboards is running, the **Ressource Manager** will automatically be active. Navigate to Ressource Manager on the sidebar. The plugin operates by using the server backend to fetch information live.

## Development

To modify and test the plugin locally:

1. Run OpenSearch Dashboards in development mode.
2. Make changes to the plugin code.
3. Reload OpenSearch Dashboards to see the changes in effect.

### Running Locally
- To run the OpenSearch Dashboards instance locally, use the following command:
  ```bash
  yarn start
  ```

## Contributing

Feel free to fork the repository, make changes, and create pull requests.

## License

This plugin is licensed under the [Apache 2.0 License](LICENSE).