const express = require("express");
var router = express.Router();
const ES_URL = "http://localhost:9200/";
const ES_INDEX = "journal";
const axios = require("axios");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: ES_URL,
  pingTimeout: 3000,
  host: {
    host: "localhost",
    port: 9200,
    headers: {
      "Content-type": "application/json",
    },
  },
});
const QUERY_DATA = {
  query: {
    match: {},
  },
  size: 1000,
};

const queryType = (data, searchType) => {
  var query = [];
  if (data?.domain) {
    query.push({ [searchType]: { domain: data.domain } });
  }
  if (data?.URL) {
    query.push({ [searchType]: { URL: data.URL } });
  }
  if (data?.content) {
    query.push({ [searchType]: { content: data.content } });
  }
  if (data?.date) {
    query.push({ [searchType]: { date: data.date } });
  }
  if (data?.category) {
    query.push({ [searchType]: { category: data.category } });
  }
  return query;
};

const matchQuery = async (data) => {
  return {
    query: {
      bool: {
        must: queryType(data, "match"),
      },
    },
    size: 100,
  };
};

router.post("/searchAll", async function (req, res, next) {
  var data = {
    query: {
      query_string: {
        query: req.body.query,
      },
    },
  };

  const searchDoc = async () => {
    const response = await client.search({
      index: ES_INDEX,
      body: data,
    });

    res.send(response?.hits?.hits);
  };
  searchDoc().catch((e) => console.log("error:", e));
});

router.post("/search", async function (req, res, next) {
  var data = QUERY_DATA;
  data = await matchQuery(req.body);
  const searchDoc = async () => {
    const response = await client.search({
      index: ES_INDEX,
      body: data,
    });

    res.send(response?.hits?.hits);
  };
  searchDoc().catch((e) => console.log("error>", e));
});

router.get("/getAll", function (req, res, next) {
  axios
    .get(ES_URL + ES_INDEX + "/_search?size=1000&pretty=true&q=*:*")
    .then((response) => {
      res.send(response.data.hits.hits);
    });
});

module.exports = router;
