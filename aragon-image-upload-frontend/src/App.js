import React from 'react';
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ImageUpload userId="test-user" />
    </div>
  );
}

export default App;