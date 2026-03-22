const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const genAI = new GoogleGenerativeAI("AIzaSyAYVBLgRo0lpjQAqFCrAbWXeFV-fLQx_kQ");
  
  try {
    const fetch = require("node-fetch");
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAYVBLgRo0lpjQAqFCrAbWXeFV-fLQx_kQ");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

run();
