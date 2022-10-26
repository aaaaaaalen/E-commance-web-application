# COMP5347 - WebDev40-Assignment2
## Authors/Group Members

Wenjian Mu / 510580755 / wemu4408 \
Yafei Zhang / 440010472 / yzha8481 \
Tony Huang / 312146337 / thua9118

## Quickstart Guide

### Requirements

This guide assumes you have the following dependencies already installed on your system:

- NodeJS version 16.15.0 LTS or newer
- MongoDB server 5 or newer
- A modern web browser such as Firefox or Chrome

### Instructions

First clone the repo:
```bash
git clone https://github.sydney.edu.au/COMP5347-2022/WebDev40-Assignment2.git
```

Install all the necessary dependencies
```bash
cd WebDev40-Assignment2
npm install
```

Load the database into MongoDB on first run. Before you begin to load the dataset into your MongoDB server, please configure the settings in `config/default.json`:

```json
{
    "mongoBaseURI": "mongodb://localhost:<PORT NUMBER HERE>/",
    "mongoDBName": "<COLLECTION NAME HERE>"
}
```

You can choose to either load the initially provided development database as follows:

```bash
npm run dataload_dev
```

or instead load the final demo dataset used for the presentation as follows:
```bash
npm run dataload_demo
```

Finally, run the application.
```bash
npm run start
```

You're now good to use our SellPhone web app!