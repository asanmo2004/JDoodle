const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// JDoodle credentials
const JDoodleClientID = "f7981c7e20c1a096e5bc891e5197ea98"; // Replace with your JDoodle Client ID
const JDoodleClientSecret = "5d1911b8e9d55af16a87be38f2fb5c34b405a3ed74baded1638998c644c718d6"; // Replace with your JDoodle Client Secret

// Endpoint to execute Java code
app.post("/execute", async (req, res) => {
  const { code } = req.body;

  const payload = {
    clientId: JDoodleClientID,
    clientSecret: JDoodleClientSecret,
    script: code,
    language: "java",
    versionIndex: "4",
  };

  try {
    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      payload
    );
    res.json({ output: response.data.output });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: "Failed to execute code" });
  }
});
console.log(res);
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${5000}`);
});
