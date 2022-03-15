
## Overview

This repository includes a demonstration of an interactive dropdown list that allows the user to select a U.S. county for use as a filter in an interactive user interface.

The dropdown also doubles as a search interface; when the user types a search term into the text field, the options in the dropdown list are filtered to display only those items that match the user's input.

## How to run this demonstration

This demonstration uses `d3-fetch` and `d3-selection` for data loading and DOM manipulation tasks. Webpack is used to coordinate package dependencies and run a server. Installing these dependencies is required to run this demonstration. After cloning this repository:

- Run `npm install` to install dependencies
- Run `npm start` and navigate to `http://localhost:8000/` to see the application