import "./App.css";
import {
  TimeDisplay,
  SearchSection,
  AppsGrid,
  RadioPlayer,
  IssuesList,
} from "./components";

// Main App Component
function App() {
  return (
    <div className="app">
      <div className="container">
        <TimeDisplay />
        <SearchSection />
        <AppsGrid />
      </div>
      <RadioPlayer />
      <IssuesList />
    </div>
  );
}

export default App;
