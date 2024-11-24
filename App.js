import React, { useState } from "react";
import MonacoEditor from "react-monaco-editor";
import styled, { ThemeProvider } from "styled-components";

// Themes
const darkTheme = {
  background: "#121212",
  color: "#ffffff",
  buttonBg: "#1e88e5",
  buttonHover: "#1565c0",
  editorBg: "#1e1e1e",
  editorColor: "#ffffff",
  outputBg: "#2d2d2d",
};

const lightTheme = {
  background: "#f4f4f9",
  color: "#000000",
  buttonBg: "#4caf50",
  buttonHover: "#388e3c",
  editorBg: "#ffffff",
  editorColor: "#000000",
  outputBg: "#f0f0f0",
};

// Styled Components
const AppWrapper = styled.div`
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  font-family: "Arial", sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: ${(props) => props.theme.editorBg};
  color: ${(props) => props.theme.color};
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.buttonBg};
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: ${(props) => props.theme.buttonHover};
  }
`;

const EditorContainer = styled.div`
  margin-bottom: 20px;
  border: 1px solid ${(props) => props.theme.editorBg};
  border-radius: 8px;
  overflow: hidden;
`;

const OutputContainer = styled.div`
  background-color: ${(props) => props.theme.outputBg};
  color: ${(props) => props.theme.color};
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.editorBg};
  font-family: "Courier New", monospace;
`;

const SuggestionList = styled.ul`
  background-color: ${(props) => props.theme.outputBg};
  color: ${(props) => props.theme.color};
  border: 1px solid ${(props) => props.theme.editorBg};
  list-style: none;
  margin: 0;
  padding: 5px;
  position: absolute;
  max-height: 150px;
  overflow-y: auto;
  border-radius: 5px;
`;

const SuggestionItem = styled.li`
  padding: 5px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.buttonBg};
    color: white;
  }
`;

// Trie Data Structure
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this.collectWords(node, prefix);
  }

  collectWords(node, prefix) {
    let words = [];
    if (node.isEnd) words.push(prefix);
    for (let char in node.children) {
      words.push(...this.collectWords(node.children[char], prefix + char));
    }
    return words;
  }
}

// Preload Java Keywords
const javaKeywords = [
  "class", "public", "static", "void", "main", "String", "args", 
  "int", "double", "boolean", "if", "else", "for", "while", 
  "switch", "case", "break", "continue", "return", "System", "out", 
  "println", "try", "catch", "finally", "import", "package", "new"
];

const trie = new Trie();
javaKeywords.forEach((keyword) => trie.insert(keyword));

// React Component

const App = () => {
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState(
    `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`
  );
  const [output, setOutput] = useState("Output will be displayed here.");
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleRunCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setOutput(data.output || "No output received");
    } catch (error) {
      setOutput("Error executing code");
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord) {
      const matches = trie.search(lastWord);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (keyword) => {
    setCode((prevCode) => prevCode + " " + keyword);
    setSuggestions([]);
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <AppWrapper>
        <Header>
          <h1>JDoodle</h1>
          <Button onClick={toggleTheme}>
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </Button>
        </Header>

        <EditorContainer>
          <MonacoEditor
            height="400"
            language="java"
            theme={theme === "light" ? "vs-light" : "vs-dark"}
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
          {suggestions.length > 0 && (
            <SuggestionList>
              {suggestions.map((keyword, index) => (
                <SuggestionItem
                  key={index}
                  onClick={() => handleSuggestionClick(keyword)}
                >
                  {keyword}
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}
        </EditorContainer>

        <Button onClick={handleRunCode}>Run Code</Button>

        <OutputContainer>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </OutputContainer>
      </AppWrapper>
    </ThemeProvider>
  );
};

export default App;
